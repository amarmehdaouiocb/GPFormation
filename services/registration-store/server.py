#!/usr/bin/env python3
"""Minimal authenticated SQLite store for paid recovery registrations."""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import re
import sqlite3
import tempfile
import time
from contextlib import closing, contextmanager
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Iterator
from urllib.parse import parse_qs, unquote, urlsplit
from zoneinfo import ZoneInfo

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


MAX_BODY_BYTES = 128 * 1024
MAX_PAYLOAD_BYTES = 96 * 1024
MAX_DOCUMENT_BYTES = 8 * 1024 * 1024
DOCUMENT_FILE_MAGIC = b"GPFDOC1"
DOCUMENT_NONCE_BYTES = 12
DOCUMENT_KINDS = (
    "permis_recto",
    "permis_verso",
    "identite_recto",
    "identite_verso",
)
IDENTITY_DOCUMENT_TYPES = (
    "carte_identite",
    "passeport",
    "titre_sejour",
)
DEFAULT_IDENTITY_DOCUMENT_TYPE = "carte_identite"
DOCUMENT_KIND_PATTERN = re.compile(r"^(?:permis|identite)_(?:recto|verso)$")
SIGNATURE_PATTERN = re.compile(r"^[0-9a-f]{64}$")
VERCEL_ORIGIN_PATTERN = re.compile(
    r"^https://gpformation(?:-[a-z0-9-]+)?\.vercel\.app$"
)
ALLOWED_UPLOAD_ORIGINS = {
    "https://gpformation.fr",
    "https://www.gpformation.fr",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
}
REFERENCE_PATTERN = re.compile(
    r"^recovery_\d{8}_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.IGNORECASE,
)
CHECKOUT_SESSION_PATTERN = re.compile(r"^cs_[A-Za-z0-9_]{8,255}$")
PAYMENT_INTENT_PATTERN = re.compile(r"^pi_[A-Za-z0-9_]{8,255}$")
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ENCRYPTED_PAYLOAD_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+$")
SESSION_STATUSES = ("open", "closed")
DEFAULT_SESSION_CAPACITY = 20
DEFAULT_RECOVERY_SESSIONS = (
    ("2026-09-04", "2026-09-05"),
    ("2026-09-18", "2026-09-19"),
    ("2026-09-25", "2026-09-26"),
    ("2026-10-09", "2026-10-10"),
    ("2026-10-23", "2026-10-24"),
    ("2026-10-30", "2026-10-31"),
    ("2026-11-06", "2026-11-07"),
    ("2026-11-20", "2026-11-21"),
    ("2026-11-27", "2026-11-28"),
    ("2026-12-04", "2026-12-05"),
    ("2026-12-18", "2026-12-19"),
)

LOGGER = logging.getLogger("gpformation-registration-store")


class StoreError(Exception):
    status = HTTPStatus.INTERNAL_SERVER_ERROR
    code = "store_error"


class BadRequest(StoreError):
    status = HTTPStatus.BAD_REQUEST
    code = "bad_request"


class Unauthorized(StoreError):
    status = HTTPStatus.UNAUTHORIZED
    code = "unauthorized"


class Forbidden(StoreError):
    status = HTTPStatus.FORBIDDEN
    code = "forbidden"


class NotFound(StoreError):
    status = HTTPStatus.NOT_FOUND
    code = "not_found"


class Conflict(StoreError):
    status = HTTPStatus.CONFLICT
    code = "conflict"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace(
        "+00:00", "Z"
    )


def validate_reference(value: Any) -> str:
    if not isinstance(value, str) or not REFERENCE_PATTERN.fullmatch(value):
        raise BadRequest("Invalid registration reference")
    return value


def validate_checkout_session_id(value: Any) -> str:
    if not isinstance(value, str) or not CHECKOUT_SESSION_PATTERN.fullmatch(value):
        raise BadRequest("Invalid Stripe checkout session ID")
    return value


def session_start_from_reference(reference: str) -> str:
    compact_date = reference.removeprefix("recovery_")[:8]
    return validate_date(
        f"{compact_date[:4]}-{compact_date[4:6]}-{compact_date[6:8]}",
        "session start date",
    )


def validate_payment_intent_id(value: Any) -> str:
    if not isinstance(value, str) or not PAYMENT_INTENT_PATTERN.fullmatch(value):
        raise BadRequest("Invalid Stripe PaymentIntent ID")
    return value


def validate_date(value: Any, field_name: str = "date") -> str:
    if not isinstance(value, str) or not DATE_PATTERN.fullmatch(value):
        raise BadRequest(f"Invalid {field_name}")
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError as error:
        raise BadRequest(f"Invalid {field_name}") from error
    return value


def validate_session_dates(start: Any, end: Any) -> tuple[str, str]:
    validated_start = validate_date(start, "session start date")
    validated_end = validate_date(end, "session end date")
    if validated_end < validated_start:
        raise BadRequest("Session end date must be after its start date")
    return validated_start, validated_end


def validate_capacity(value: Any) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 1 or value > 100:
        raise BadRequest("Session capacity must be between 1 and 100")
    return value


def validate_session_status(value: Any) -> str:
    if not isinstance(value, str) or value not in SESSION_STATUSES:
        raise BadRequest("Unsupported session status")
    return value


def validate_amount(value: Any) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise BadRequest("Invalid payment amount")
    return value


def validate_currency(value: Any) -> str:
    if not isinstance(value, str) or not re.fullmatch(r"^[a-z]{3}$", value):
        raise BadRequest("Invalid payment currency")
    return value


def validate_payload(value: Any) -> str:
    if not isinstance(value, str):
        raise BadRequest("Encrypted payload must be a string")

    payload_size = len(value.encode("utf-8"))
    if (
        payload_size < 32
        or payload_size > MAX_PAYLOAD_BYTES
        or not ENCRYPTED_PAYLOAD_PATTERN.fullmatch(value)
        or value.count(".") != 2
    ):
        raise BadRequest("Invalid encrypted registration payload")
    return value


def validate_document_kind(value: Any) -> str:
    if not isinstance(value, str) or not DOCUMENT_KIND_PATTERN.fullmatch(value):
        raise BadRequest("Invalid document kind")
    if value not in DOCUMENT_KINDS:
        raise BadRequest("Unsupported document kind")
    return value


def validate_identity_document_type(value: Any) -> str:
    if not isinstance(value, str) or value not in IDENTITY_DOCUMENT_TYPES:
        raise BadRequest("Unsupported identity document type")
    return value


def required_document_kinds(identity_document_type: str) -> set[str]:
    kinds = {"permis_recto", "permis_verso", "identite_recto"}
    if identity_document_type != "passeport":
        kinds.add("identite_verso")
    return kinds


def detect_document_type(content: bytes) -> tuple[str, str]:
    if content.startswith(b"%PDF-"):
        return "application/pdf", "pdf"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png", "png"
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg", "jpg"
    if len(content) >= 12 and content[4:8] == b"ftyp":
        brand = content[8:12]
        if brand in {b"heic", b"heix", b"hevc", b"hevx"}:
            return "image/heic", "heic"
        if brand in {b"heif", b"mif1", b"msf1"}:
            return "image/heif", "heif"
    raise BadRequest("Unsupported document format")


class RegistrationStore:
    def __init__(self, database_path: str, documents_path: str | None = None) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self.documents_path = Path(
            documents_path or self.database_path.parent / "documents"
        )
        self.documents_path.mkdir(parents=True, exist_ok=True)
        self.documents_path.chmod(0o700)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(
            self.database_path,
            timeout=5,
            isolation_level=None,
        )
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA busy_timeout = 5000")
        return connection

    def _initialize(self) -> None:
        with closing(self._connect()) as connection:
            connection.execute("PRAGMA journal_mode = WAL")
            connection.execute("PRAGMA synchronous = FULL")
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS registrations (
                    reference TEXT PRIMARY KEY,
                    encrypted_payload TEXT NOT NULL,
                    identity_document_type TEXT NOT NULL DEFAULT 'carte_identite',
                    session_start TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    start_date TEXT PRIMARY KEY,
                    end_date TEXT NOT NULL,
                    capacity INTEGER NOT NULL DEFAULT 20 CHECK (capacity BETWEEN 1 AND 100),
                    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT
                );

                CREATE TABLE IF NOT EXISTS payments (
                    checkout_session_id TEXT PRIMARY KEY,
                    reference TEXT NOT NULL,
                    status TEXT NOT NULL CHECK (status IN ('processing', 'processed')),
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    email_sent_at TEXT,
                    FOREIGN KEY (reference) REFERENCES registrations(reference)
                );

                CREATE INDEX IF NOT EXISTS payments_reference_idx
                    ON payments(reference);

                CREATE TABLE IF NOT EXISTS payment_authorizations (
                    payment_intent_id TEXT PRIMARY KEY,
                    reference TEXT NOT NULL UNIQUE,
                    session_start TEXT NOT NULL,
                    status TEXT NOT NULL CHECK (status IN (
                        'created',
                        'requires_capture',
                        'capturing',
                        'paid',
                        'canceled'
                    )),
                    amount INTEGER NOT NULL,
                    currency TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    captured_at TEXT,
                    authorization_email_claimed_at TEXT,
                    authorization_email_sent_at TEXT,
                    email_claimed_at TEXT,
                    email_sent_at TEXT,
                    FOREIGN KEY (reference) REFERENCES registrations(reference)
                );

                CREATE INDEX IF NOT EXISTS payment_authorizations_session_idx
                    ON payment_authorizations(session_start, status);

                CREATE TABLE IF NOT EXISTS documents (
                    reference TEXT NOT NULL,
                    kind TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    extension TEXT NOT NULL,
                    size_bytes INTEGER NOT NULL,
                    sha256 TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (reference, kind),
                    FOREIGN KEY (reference) REFERENCES registrations(reference)
                        ON DELETE CASCADE,
                    CHECK (kind IN (
                        'permis_recto',
                        'permis_verso',
                        'identite_recto',
                        'identite_verso'
                    ))
                );

                CREATE INDEX IF NOT EXISTS documents_reference_idx
                    ON documents(reference);
                """
            )
            registration_columns = {
                row["name"]
                for row in connection.execute(
                    "PRAGMA table_info(registrations)"
                ).fetchall()
            }
            if "identity_document_type" not in registration_columns:
                connection.execute(
                    """
                    ALTER TABLE registrations
                    ADD COLUMN identity_document_type TEXT NOT NULL
                        DEFAULT 'carte_identite'
                    """
                )
            if "session_start" not in registration_columns:
                connection.execute(
                    "ALTER TABLE registrations ADD COLUMN session_start TEXT"
                )

            authorization_columns = {
                row["name"]
                for row in connection.execute(
                    "PRAGMA table_info(payment_authorizations)"
                ).fetchall()
            }
            if "authorization_email_claimed_at" not in authorization_columns:
                connection.execute(
                    """
                    ALTER TABLE payment_authorizations
                    ADD COLUMN authorization_email_claimed_at TEXT
                    """
                )
            if "authorization_email_sent_at" not in authorization_columns:
                connection.execute(
                    """
                    ALTER TABLE payment_authorizations
                    ADD COLUMN authorization_email_sent_at TEXT
                    """
                )

            now = utc_now()
            for start_date, end_date in DEFAULT_RECOVERY_SESSIONS:
                connection.execute(
                    """
                    INSERT OR IGNORE INTO sessions (
                        start_date, end_date, capacity, status,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, 'open', ?, ?)
                    """,
                    (
                        start_date,
                        end_date,
                        DEFAULT_SESSION_CAPACITY,
                        now,
                        now,
                    ),
                )

            connection.execute(
                """
                UPDATE registrations
                SET session_start = substr(reference, 10, 4)
                    || '-' || substr(reference, 14, 2)
                    || '-' || substr(reference, 16, 2)
                WHERE session_start IS NULL
                    AND reference GLOB 'recovery_[0-9]*'
                """
            )

    @contextmanager
    def _transaction(self) -> Iterator[sqlite3.Connection]:
        connection = self._connect()
        connection.execute("BEGIN IMMEDIATE")
        try:
            yield connection
        except Exception:
            connection.rollback()
            raise
        else:
            connection.commit()
        finally:
            connection.close()

    def health(self) -> None:
        with closing(self._connect()) as connection:
            connection.execute("SELECT 1").fetchone()

    @staticmethod
    def _serialize_session(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "start": row["start_date"],
            "end": row["end_date"],
            "capacity": row["capacity"],
            "status": row["status"],
            "paidCount": row["paid_count"],
            "pendingCount": row["pending_count"],
            "remainingPlaces": max(0, row["capacity"] - row["paid_count"]),
            "deletedAt": row["deleted_at"],
        }

    def _session_rows(self, connection: sqlite3.Connection) -> list[sqlite3.Row]:
        return connection.execute(
            """
            SELECT
                sessions.*,
                (
                    SELECT COUNT(*)
                    FROM payment_authorizations
                    WHERE payment_authorizations.session_start = sessions.start_date
                        AND payment_authorizations.status IN ('capturing', 'paid')
                ) + (
                    SELECT COUNT(*)
                    FROM payments
                    INNER JOIN registrations
                        ON registrations.reference = payments.reference
                    WHERE registrations.session_start = sessions.start_date
                        AND payments.status = 'processed'
                ) AS paid_count,
                (
                    SELECT COUNT(*)
                    FROM payment_authorizations
                    WHERE payment_authorizations.session_start = sessions.start_date
                        AND payment_authorizations.status = 'requires_capture'
                ) AS pending_count
            FROM sessions
            ORDER BY sessions.start_date
            """
        ).fetchall()

    def list_sessions(self, upcoming_only: bool = False) -> list[dict[str, Any]]:
        with closing(self._connect()) as connection:
            rows = self._session_rows(connection)

        today = datetime.now(ZoneInfo("Europe/Paris")).date().isoformat()
        sessions = [self._serialize_session(row) for row in rows]
        if not upcoming_only:
            return sessions

        return [
            session
            for session in sessions
            if session["deletedAt"] is None
            and session["status"] == "open"
            and session["end"] >= today
            and session["remainingPlaces"] > 0
        ][:5]

    def create_session(
        self,
        start_date: str,
        end_date: str,
        capacity: int,
        status: str,
    ) -> dict[str, Any]:
        now = utc_now()
        with self._transaction() as connection:
            existing = connection.execute(
                "SELECT deleted_at FROM sessions WHERE start_date = ?",
                (start_date,),
            ).fetchone()
            if existing:
                if existing["deleted_at"] is None:
                    raise Conflict("A session already exists for this start date")
                connection.execute(
                    """
                    UPDATE sessions
                    SET end_date = ?, capacity = ?, status = ?,
                        deleted_at = NULL, updated_at = ?
                    WHERE start_date = ?
                    """,
                    (end_date, capacity, status, now, start_date),
                )
            else:
                connection.execute(
                    """
                    INSERT INTO sessions (
                        start_date, end_date, capacity, status,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (start_date, end_date, capacity, status, now, now),
                )
        return self.get_session(start_date)

    def get_session(self, start_date: str) -> dict[str, Any]:
        with closing(self._connect()) as connection:
            row = connection.execute(
                """
                SELECT
                    sessions.*,
                    (
                        SELECT COUNT(*)
                        FROM payment_authorizations
                        WHERE payment_authorizations.session_start = sessions.start_date
                            AND payment_authorizations.status IN ('capturing', 'paid')
                    ) + (
                        SELECT COUNT(*)
                        FROM payments
                        INNER JOIN registrations
                            ON registrations.reference = payments.reference
                        WHERE registrations.session_start = sessions.start_date
                            AND payments.status = 'processed'
                    ) AS paid_count,
                    (
                        SELECT COUNT(*)
                        FROM payment_authorizations
                        WHERE payment_authorizations.session_start = sessions.start_date
                            AND payment_authorizations.status = 'requires_capture'
                    ) AS pending_count
                FROM sessions
                WHERE sessions.start_date = ?
                """,
                (start_date,),
            ).fetchone()
        if not row:
            raise NotFound("Session was not found")
        return self._serialize_session(row)

    def update_session(
        self,
        original_start: str,
        start_date: str,
        end_date: str,
        capacity: int,
        status: str,
    ) -> dict[str, Any]:
        now = utc_now()
        with self._transaction() as connection:
            existing = connection.execute(
                "SELECT deleted_at FROM sessions WHERE start_date = ?",
                (original_start,),
            ).fetchone()
            if not existing or existing["deleted_at"] is not None:
                raise NotFound("Session was not found")

            authorization_count = connection.execute(
                """
                SELECT COUNT(*)
                FROM payment_authorizations
                WHERE session_start = ? AND status IN ('capturing', 'paid')
                """,
                (original_start,),
            ).fetchone()[0]
            legacy_count = connection.execute(
                """
                SELECT COUNT(*)
                FROM payments
                INNER JOIN registrations
                    ON registrations.reference = payments.reference
                WHERE registrations.session_start = ?
                    AND payments.status = 'processed'
                """,
                (original_start,),
            ).fetchone()[0]
            confirmed_count = authorization_count + legacy_count
            if capacity < confirmed_count:
                raise Conflict("Capacity cannot be lower than confirmed registrations")

            if start_date != original_start:
                registration = connection.execute(
                    "SELECT 1 FROM registrations WHERE session_start = ? LIMIT 1",
                    (original_start,),
                ).fetchone()
                if registration:
                    raise Conflict(
                        "Dates cannot be changed after registrations have been created"
                    )

            try:
                connection.execute(
                    """
                    UPDATE sessions
                    SET start_date = ?, end_date = ?, capacity = ?,
                        status = ?, updated_at = ?
                    WHERE start_date = ?
                    """,
                    (
                        start_date,
                        end_date,
                        capacity,
                        status,
                        now,
                        original_start,
                    ),
                )
            except sqlite3.IntegrityError as error:
                raise Conflict("A session already exists for this start date") from error
        return self.get_session(start_date)

    def delete_session(self, start_date: str) -> str:
        now = utc_now()
        with self._transaction() as connection:
            result = connection.execute(
                """
                UPDATE sessions
                SET status = 'closed', deleted_at = ?, updated_at = ?
                WHERE start_date = ? AND deleted_at IS NULL
                """,
                (now, now, start_date),
            )
            if result.rowcount == 0:
                raise NotFound("Session was not found")
        return "deleted"

    def document_path(self, reference: str, kind: str) -> Path:
        return self.documents_path / reference / f"{kind}.enc"

    def assert_document_upload_allowed(self, reference: str, kind: str) -> None:
        with closing(self._connect()) as connection:
            registration = connection.execute(
                """
                SELECT identity_document_type
                FROM registrations
                WHERE reference = ?
                """,
                (reference,),
            ).fetchone()
            if not registration:
                raise NotFound("Registration was not found")
            if kind not in required_document_kinds(
                registration["identity_document_type"]
            ):
                raise Conflict("Document is not required for this registration")

            payment = connection.execute(
                """
                SELECT 1 FROM payments WHERE reference = ?
                UNION ALL
                SELECT 1 FROM payment_authorizations WHERE reference = ?
                LIMIT 1
                """,
                (reference, reference),
            ).fetchone()
            if payment:
                raise Conflict("Documents can no longer be modified")

            document = connection.execute(
                "SELECT 1 FROM documents WHERE reference = ? AND kind = ?",
                (reference, kind),
            ).fetchone()
            if document:
                raise Conflict("Document has already been uploaded")

    def save_document_metadata(
        self,
        reference: str,
        kind: str,
        content_type: str,
        extension: str,
        size_bytes: int,
        sha256: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            existing = connection.execute(
                "SELECT created_at FROM documents WHERE reference = ? AND kind = ?",
                (reference, kind),
            ).fetchone()
            created_at = existing["created_at"] if existing else now
            connection.execute(
                """
                INSERT INTO documents (
                    reference, kind, content_type, extension, size_bytes,
                    sha256, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(reference, kind) DO UPDATE SET
                    content_type = excluded.content_type,
                    extension = excluded.extension,
                    size_bytes = excluded.size_bytes,
                    sha256 = excluded.sha256,
                    updated_at = excluded.updated_at
                """,
                (
                    reference,
                    kind,
                    content_type,
                    extension,
                    size_bytes,
                    sha256,
                    created_at,
                    now,
                ),
            )
        return now

    def get_document_status(self, reference: str) -> dict[str, Any]:
        with closing(self._connect()) as connection:
            registration = connection.execute(
                """
                SELECT identity_document_type
                FROM registrations
                WHERE reference = ?
                """,
                (reference,),
            ).fetchone()
            if not registration:
                raise NotFound("Registration was not found")

            rows = connection.execute(
                """
                SELECT kind, content_type, size_bytes, updated_at
                FROM documents
                WHERE reference = ?
                ORDER BY kind
                """,
                (reference,),
            ).fetchall()

        expected_kinds = required_document_kinds(
            registration["identity_document_type"]
        )
        documents = [
            {
                "kind": row["kind"],
                "contentType": row["content_type"],
                "sizeBytes": row["size_bytes"],
                "uploadedAt": row["updated_at"],
            }
            for row in rows
            if row["kind"] in expected_kinds
            and self.document_path(reference, row["kind"]).is_file()
        ]
        present_kinds = {document["kind"] for document in documents}
        return {
            "complete": present_kinds == expected_kinds,
            "documents": documents,
        }

    def get_paid_document(self, reference: str, kind: str) -> dict[str, Any]:
        with closing(self._connect()) as connection:
            row = connection.execute(
                """
                SELECT
                    documents.content_type,
                    documents.extension,
                    documents.size_bytes,
                    documents.sha256
                FROM documents
                WHERE documents.reference = ?
                    AND documents.kind = ?
                    AND (
                        EXISTS (
                            SELECT 1 FROM payments
                            WHERE payments.reference = documents.reference
                                AND payments.status = 'processed'
                        )
                        OR EXISTS (
                            SELECT 1 FROM payment_authorizations
                            WHERE payment_authorizations.reference = documents.reference
                                AND payment_authorizations.status IN (
                                    'requires_capture', 'capturing', 'paid'
                                )
                        )
                    )
                LIMIT 1
                """,
                (reference, kind),
            ).fetchone()
        if not row:
            raise NotFound("Paid registration document was not found")

        document_path = self.document_path(reference, kind)
        if not document_path.is_file():
            raise NotFound("Registration document file was not found")

        return {
            "path": document_path,
            "contentType": row["content_type"],
            "extension": row["extension"],
            "sizeBytes": row["size_bytes"],
            "sha256": row["sha256"],
        }

    def save_registration(
        self,
        reference: str,
        payload: str,
        identity_document_type: str,
        session_start: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            existing = connection.execute(
                """
                SELECT encrypted_payload, identity_document_type, session_start
                FROM registrations
                WHERE reference = ?
                """,
                (reference,),
            ).fetchone()

            if existing:
                if hmac.compare_digest(
                    existing["encrypted_payload"], payload
                ) and hmac.compare_digest(
                    existing["identity_document_type"], identity_document_type
                ) and hmac.compare_digest(
                    existing["session_start"] or "", session_start
                ):
                    return "existing"
                raise Conflict("Registration reference already exists")

            connection.execute(
                """
                INSERT INTO registrations (
                    reference, encrypted_payload, identity_document_type,
                    session_start, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    reference,
                    payload,
                    identity_document_type,
                    session_start,
                    now,
                    now,
                ),
            )
        return "created"

    def create_payment_authorization(
        self,
        payment_intent_id: str,
        reference: str,
        session_start: str,
        amount: int,
        currency: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            registration = connection.execute(
                """
                SELECT identity_document_type, session_start
                FROM registrations
                WHERE reference = ?
                """,
                (reference,),
            ).fetchone()
            if not registration:
                raise NotFound("Registration was not found")
            if not hmac.compare_digest(
                registration["session_start"] or "", session_start
            ):
                raise Conflict("Registration is linked to another session")

            session = connection.execute(
                """
                SELECT capacity, status, deleted_at
                FROM sessions
                WHERE start_date = ?
                """,
                (session_start,),
            ).fetchone()
            if (
                not session
                or session["deleted_at"] is not None
                or session["status"] != "open"
            ):
                raise Conflict("Session is no longer open for registrations")

            document_rows = connection.execute(
                "SELECT kind FROM documents WHERE reference = ?",
                (reference,),
            ).fetchall()
            document_kinds = {
                row["kind"]
                for row in document_rows
                if self.document_path(reference, row["kind"]).is_file()
            }
            if document_kinds != required_document_kinds(
                registration["identity_document_type"]
            ):
                raise Conflict("Registration documents are incomplete")

            existing = connection.execute(
                """
                SELECT payment_intent_id, reference, session_start, amount, currency
                FROM payment_authorizations
                WHERE payment_intent_id = ? OR reference = ?
                """,
                (payment_intent_id, reference),
            ).fetchone()
            if existing:
                matches = (
                    hmac.compare_digest(
                        existing["payment_intent_id"], payment_intent_id
                    )
                    and hmac.compare_digest(existing["reference"], reference)
                    and hmac.compare_digest(existing["session_start"], session_start)
                    and existing["amount"] == amount
                    and hmac.compare_digest(existing["currency"], currency)
                )
                if matches:
                    return "existing"
                raise Conflict("PaymentIntent is already linked")

            connection.execute(
                """
                INSERT INTO payment_authorizations (
                    payment_intent_id, reference, session_start, status,
                    amount, currency, created_at, updated_at
                ) VALUES (?, ?, ?, 'created', ?, ?, ?, ?)
                """,
                (
                    payment_intent_id,
                    reference,
                    session_start,
                    amount,
                    currency,
                    now,
                    now,
                ),
            )
        return "created"

    def mark_payment_authorized(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                """
                SELECT reference, status
                FROM payment_authorizations
                WHERE payment_intent_id = ?
                """,
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            if payment["status"] in ("paid", "canceled"):
                return payment["status"]
            connection.execute(
                """
                UPDATE payment_authorizations
                SET status = 'requires_capture', updated_at = ?
                WHERE payment_intent_id = ?
                """,
                (now, payment_intent_id),
            )
        return "requires_capture"

    def claim_payment_approval(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> dict[str, Any]:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                """
                SELECT reference, session_start, status
                FROM payment_authorizations
                WHERE payment_intent_id = ?
                """,
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            if payment["status"] == "paid":
                return {"status": "paid"}
            if payment["status"] not in ("requires_capture", "capturing"):
                raise Conflict("Payment is not ready to be captured")

            session = connection.execute(
                """
                SELECT capacity, status, deleted_at
                FROM sessions
                WHERE start_date = ?
                """,
                (payment["session_start"],),
            ).fetchone()
            if (
                not session
                or session["deleted_at"] is not None
                or session["status"] != "open"
            ):
                raise Conflict("Session is closed")

            authorization_places = connection.execute(
                """
                SELECT COUNT(*)
                FROM payment_authorizations
                WHERE session_start = ?
                    AND status IN ('capturing', 'paid')
                    AND payment_intent_id != ?
                """,
                (payment["session_start"], payment_intent_id),
            ).fetchone()[0]
            legacy_places = connection.execute(
                """
                SELECT COUNT(*)
                FROM payments
                INNER JOIN registrations
                    ON registrations.reference = payments.reference
                WHERE registrations.session_start = ?
                    AND payments.status = 'processed'
                """,
                (payment["session_start"],),
            ).fetchone()[0]
            occupied_places = authorization_places + legacy_places
            if occupied_places >= session["capacity"]:
                raise Conflict("Session is full")

            connection.execute(
                """
                UPDATE payment_authorizations
                SET status = 'capturing', updated_at = ?
                WHERE payment_intent_id = ?
                """,
                (now, payment_intent_id),
            )
        return {"status": "capturing"}

    def claim_authorized_payment_email(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> dict[str, Any]:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                """
                SELECT reference, status, authorization_email_claimed_at,
                    authorization_email_sent_at
                FROM payment_authorizations
                WHERE payment_intent_id = ?
                """,
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            if payment["status"] in ("paid", "canceled"):
                return {"status": "processed"}
            if payment["status"] not in ("requires_capture", "capturing"):
                raise Conflict("Payment is not ready for review")
            if payment["authorization_email_sent_at"]:
                return {"status": "processed"}
            if payment["authorization_email_claimed_at"]:
                claimed_at = datetime.fromisoformat(
                    payment["authorization_email_claimed_at"].replace("Z", "+00:00")
                )
                if claimed_at > datetime.now(timezone.utc) - timedelta(minutes=10):
                    return {"status": "processing"}

            registration = connection.execute(
                "SELECT encrypted_payload FROM registrations WHERE reference = ?",
                (reference,),
            ).fetchone()
            if not registration:
                raise NotFound("Registration was not found")

            connection.execute(
                """
                UPDATE payment_authorizations
                SET authorization_email_claimed_at = ?, updated_at = ?
                WHERE payment_intent_id = ?
                """,
                (now, now, payment_intent_id),
            )
            return {
                "status": "ready",
                "payload": registration["encrypted_payload"],
            }

    def complete_authorized_payment_email(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                "SELECT reference FROM payment_authorizations WHERE payment_intent_id = ?",
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            connection.execute(
                """
                UPDATE payment_authorizations
                SET authorization_email_sent_at = COALESCE(
                        authorization_email_sent_at, ?
                    ),
                    updated_at = ?
                WHERE payment_intent_id = ?
                """,
                (now, now, payment_intent_id),
            )
        return "processed"

    def release_authorized_payment_email(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                """
                SELECT reference, authorization_email_sent_at
                FROM payment_authorizations
                WHERE payment_intent_id = ?
                """,
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            if not payment["authorization_email_sent_at"]:
                connection.execute(
                    """
                    UPDATE payment_authorizations
                    SET authorization_email_claimed_at = NULL, updated_at = ?
                    WHERE payment_intent_id = ?
                    """,
                    (now, payment_intent_id),
                )
        return "released"

    def release_payment_approval(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                """
                SELECT reference, status
                FROM payment_authorizations
                WHERE payment_intent_id = ?
                """,
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            if payment["status"] == "capturing":
                connection.execute(
                    """
                    UPDATE payment_authorizations
                    SET status = 'requires_capture', updated_at = ?
                    WHERE payment_intent_id = ?
                    """,
                    (now, payment_intent_id),
                )
                return "requires_capture"
            return payment["status"]

    def claim_captured_payment_email(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> dict[str, Any]:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                """
                SELECT reference, status, email_claimed_at, email_sent_at
                FROM payment_authorizations
                WHERE payment_intent_id = ?
                """,
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            if payment["status"] == "canceled":
                raise Conflict("Canceled payment cannot be completed")

            connection.execute(
                """
                UPDATE payment_authorizations
                SET status = 'paid', captured_at = COALESCE(captured_at, ?),
                    updated_at = ?
                WHERE payment_intent_id = ?
                """,
                (now, now, payment_intent_id),
            )

            if payment["email_sent_at"]:
                return {"status": "processed"}
            if payment["email_claimed_at"]:
                claimed_at = datetime.fromisoformat(
                    payment["email_claimed_at"].replace("Z", "+00:00")
                )
                if claimed_at > datetime.now(timezone.utc) - timedelta(minutes=10):
                    return {"status": "processing"}

            registration = connection.execute(
                "SELECT encrypted_payload FROM registrations WHERE reference = ?",
                (reference,),
            ).fetchone()
            if not registration:
                raise NotFound("Registration was not found")

            connection.execute(
                """
                UPDATE payment_authorizations
                SET email_claimed_at = ?, updated_at = ?
                WHERE payment_intent_id = ?
                """,
                (now, now, payment_intent_id),
            )
            return {
                "status": "ready",
                "payload": registration["encrypted_payload"],
            }

    def complete_captured_payment_email(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                "SELECT reference, status FROM payment_authorizations WHERE payment_intent_id = ?",
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            if payment["status"] != "paid":
                raise Conflict("Payment has not been captured")
            connection.execute(
                """
                UPDATE payment_authorizations
                SET email_sent_at = COALESCE(email_sent_at, ?), updated_at = ?
                WHERE payment_intent_id = ?
                """,
                (now, now, payment_intent_id),
            )
        return "processed"

    def release_captured_payment_email(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                "SELECT reference, email_sent_at FROM payment_authorizations WHERE payment_intent_id = ?",
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            if not payment["email_sent_at"]:
                connection.execute(
                    """
                    UPDATE payment_authorizations
                    SET email_claimed_at = NULL, updated_at = ?
                    WHERE payment_intent_id = ?
                    """,
                    (now, payment_intent_id),
                )
        return "released"

    def cancel_payment_authorization(
        self,
        payment_intent_id: str,
        reference: str,
    ) -> str:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                "SELECT reference, status FROM payment_authorizations WHERE payment_intent_id = ?",
                (payment_intent_id,),
            ).fetchone()
            if not payment:
                raise NotFound("PaymentIntent was not found")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("PaymentIntent is linked to another registration")
            if payment["status"] == "paid":
                raise Conflict("Captured payment cannot be canceled")
            connection.execute(
                """
                UPDATE payment_authorizations
                SET status = 'canceled', updated_at = ?
                WHERE payment_intent_id = ?
                """,
                (now, payment_intent_id),
            )
        return "canceled"

    def claim_payment(self, checkout_session_id: str, reference: str) -> dict[str, str]:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                """
                SELECT reference, status
                FROM payments
                WHERE checkout_session_id = ?
                """,
                (checkout_session_id,),
            ).fetchone()

            if payment:
                if not hmac.compare_digest(payment["reference"], reference):
                    raise Conflict("Checkout session is linked to another registration")
                if payment["status"] == "processed":
                    return {"status": "processed"}

            registration = connection.execute(
                """
                SELECT encrypted_payload, identity_document_type
                FROM registrations
                WHERE reference = ?
                """,
                (reference,),
            ).fetchone()
            if not registration:
                raise NotFound("Registration was not found")

            document_rows = connection.execute(
                "SELECT kind FROM documents WHERE reference = ?",
                (reference,),
            ).fetchall()
            document_kinds = {
                row["kind"]
                for row in document_rows
                if self.document_path(reference, row["kind"]).is_file()
            }
            if document_kinds != required_document_kinds(
                registration["identity_document_type"]
            ):
                raise Conflict("Registration documents are incomplete")

            if payment:
                connection.execute(
                    """
                    UPDATE payments
                    SET updated_at = ?
                    WHERE checkout_session_id = ?
                    """,
                    (now, checkout_session_id),
                )
            else:
                connection.execute(
                    """
                    INSERT INTO payments (
                        checkout_session_id, reference, status, created_at, updated_at
                    ) VALUES (?, ?, 'processing', ?, ?)
                    """,
                    (checkout_session_id, reference, now, now),
                )

            return {
                "status": "ready",
                "payload": registration["encrypted_payload"],
            }

    def complete_payment(self, checkout_session_id: str, reference: str) -> str:
        now = utc_now()
        with self._transaction() as connection:
            payment = connection.execute(
                """
                SELECT reference, status
                FROM payments
                WHERE checkout_session_id = ?
                """,
                (checkout_session_id,),
            ).fetchone()
            if not payment:
                raise NotFound("Checkout session was not claimed")
            if not hmac.compare_digest(payment["reference"], reference):
                raise Conflict("Checkout session is linked to another registration")
            if payment["status"] == "processed":
                return "processed"

            connection.execute(
                """
                UPDATE payments
                SET status = 'processed', updated_at = ?, email_sent_at = ?
                WHERE checkout_session_id = ?
                """,
                (now, now, checkout_session_id),
            )
        return "processed"

    def list_paid_registrations(self) -> list[dict[str, Any]]:
        with closing(self._connect()) as connection:
            rows = connection.execute(
                """
                SELECT
                    registrations.reference,
                    registrations.encrypted_payload,
                    registrations.created_at AS registration_created_at,
                    payments.checkout_session_id,
                    payments.updated_at AS paid_at,
                    payments.email_sent_at
                FROM payments
                INNER JOIN registrations
                    ON registrations.reference = payments.reference
                WHERE payments.status = 'processed'
                ORDER BY payments.updated_at DESC
                """
            ).fetchall()

            authorization_rows = connection.execute(
                """
                SELECT
                    registrations.reference,
                    registrations.encrypted_payload,
                    registrations.created_at AS registration_created_at,
                    payment_authorizations.payment_intent_id,
                    payment_authorizations.captured_at AS paid_at,
                    payment_authorizations.email_sent_at
                FROM payment_authorizations
                INNER JOIN registrations
                    ON registrations.reference = payment_authorizations.reference
                WHERE payment_authorizations.status = 'paid'
                ORDER BY payment_authorizations.captured_at DESC
                """
            ).fetchall()

            document_rows = connection.execute(
                """
                SELECT
                    documents.reference,
                    documents.kind,
                    documents.content_type,
                    documents.size_bytes,
                    documents.updated_at
                FROM documents
                WHERE EXISTS (
                    SELECT 1 FROM payments
                    WHERE payments.reference = documents.reference
                        AND payments.status = 'processed'
                ) OR EXISTS (
                    SELECT 1 FROM payment_authorizations
                    WHERE payment_authorizations.reference = documents.reference
                        AND payment_authorizations.status = 'paid'
                )
                ORDER BY documents.kind
                """
            ).fetchall()

        documents_by_reference: dict[str, list[dict[str, Any]]] = {}
        for document in document_rows:
            if not self.document_path(
                document["reference"], document["kind"]
            ).is_file():
                continue
            documents_by_reference.setdefault(document["reference"], []).append(
                {
                    "kind": document["kind"],
                    "contentType": document["content_type"],
                    "sizeBytes": document["size_bytes"],
                    "uploadedAt": document["updated_at"],
                }
            )

        paid_registrations = [
            {
                "reference": row["reference"],
                "payload": row["encrypted_payload"],
                "registrationCreatedAt": row["registration_created_at"],
                "stripePaymentId": row["checkout_session_id"],
                "checkoutSessionId": row["checkout_session_id"],
                "paymentSource": "checkout",
                "paidAt": row["paid_at"],
                "emailSentAt": row["email_sent_at"],
                "documents": documents_by_reference.get(row["reference"], []),
            }
            for row in rows
        ]

        paid_registrations.extend(
            {
                "reference": row["reference"],
                "payload": row["encrypted_payload"],
                "registrationCreatedAt": row["registration_created_at"],
                "stripePaymentId": row["payment_intent_id"],
                "paymentIntentId": row["payment_intent_id"],
                "paymentSource": "payment_intent",
                "paidAt": row["paid_at"],
                "emailSentAt": row["email_sent_at"],
                "documents": documents_by_reference.get(row["reference"], []),
            }
            for row in authorization_rows
        )
        return sorted(
            paid_registrations,
            key=lambda registration: registration["paidAt"] or "",
            reverse=True,
        )

    def list_pending_registrations(self) -> list[dict[str, Any]]:
        with closing(self._connect()) as connection:
            rows = connection.execute(
                """
                SELECT
                    registrations.reference,
                    registrations.encrypted_payload,
                    registrations.created_at AS registration_created_at,
                    payment_authorizations.payment_intent_id,
                    payment_authorizations.status,
                    payment_authorizations.amount,
                    payment_authorizations.currency,
                    payment_authorizations.updated_at AS authorized_at
                FROM payment_authorizations
                INNER JOIN registrations
                    ON registrations.reference = payment_authorizations.reference
                WHERE payment_authorizations.status IN (
                    'requires_capture', 'capturing'
                )
                ORDER BY payment_authorizations.updated_at
                """
            ).fetchall()
            document_rows = connection.execute(
                """
                SELECT reference, kind, content_type, size_bytes, updated_at
                FROM documents
                WHERE reference IN (
                    SELECT reference FROM payment_authorizations
                    WHERE status IN ('requires_capture', 'capturing')
                )
                ORDER BY kind
                """
            ).fetchall()

        documents_by_reference: dict[str, list[dict[str, Any]]] = {}
        for document in document_rows:
            if not self.document_path(
                document["reference"], document["kind"]
            ).is_file():
                continue
            documents_by_reference.setdefault(document["reference"], []).append(
                {
                    "kind": document["kind"],
                    "contentType": document["content_type"],
                    "sizeBytes": document["size_bytes"],
                    "uploadedAt": document["updated_at"],
                }
            )

        return [
            {
                "reference": row["reference"],
                "payload": row["encrypted_payload"],
                "registrationCreatedAt": row["registration_created_at"],
                "paymentIntentId": row["payment_intent_id"],
                "paymentStatus": row["status"],
                "amount": row["amount"],
                "currency": row["currency"],
                "authorizedAt": row["authorized_at"],
                "documents": documents_by_reference.get(row["reference"], []),
            }
            for row in rows
        ]


class RegistrationStoreServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(
        self,
        server_address: tuple[str, int],
        store: RegistrationStore,
        api_token: str,
    ) -> None:
        super().__init__(server_address, RegistrationStoreHandler)
        self.store = store
        self.api_token = api_token
        self.document_key = hashlib.sha256(
            b"gpformation-documents-v1\0" + api_token.encode("utf-8")
        ).digest()


class RegistrationStoreHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server: RegistrationStoreServer

    def _allowed_cors_origin(self) -> str | None:
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_UPLOAD_ORIGINS or VERCEL_ORIGIN_PATTERN.fullmatch(
            origin
        ):
            return origin
        return None

    def _send_cors_headers(self) -> None:
        origin = self._allowed_cors_origin()
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Methods", "PUT, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Max-Age", "600")
            self.send_header("Vary", "Origin")

    def _send_json(self, status: HTTPStatus, body: dict[str, Any]) -> None:
        encoded = json.dumps(body, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(encoded)

    def _send_empty(self, status: HTTPStatus) -> None:
        self.send_response(status)
        self.send_header("Content-Length", "0")
        self.send_header("Cache-Control", "no-store")
        self._send_cors_headers()
        self.end_headers()

    def _require_authentication(self) -> None:
        expected = f"Bearer {self.server.api_token}"
        provided = self.headers.get("Authorization", "")
        if not hmac.compare_digest(provided, expected):
            raise Unauthorized("Authentication required")

    def _require_signed_document_access(
        self,
        purpose: str,
        reference: str,
        kind: str,
        query: str,
    ) -> None:
        parameters = parse_qs(query, keep_blank_values=True)
        expires_values = parameters.get("expires", [])
        signature_values = parameters.get("signature", [])
        if len(expires_values) != 1 or len(signature_values) != 1:
            raise Unauthorized("Document access token is missing")

        try:
            expires = int(expires_values[0])
        except ValueError as error:
            raise Unauthorized("Document access token is invalid") from error

        signature = signature_values[0]
        now = int(time.time())
        if (
            expires < now
            or expires > now + 60 * 60
            or not SIGNATURE_PATTERN.fullmatch(signature)
        ):
            raise Unauthorized("Document access token has expired")

        message = f"{purpose}\n{reference}\n{kind}\n{expires}".encode("utf-8")
        expected = hmac.new(
            self.server.api_token.encode("utf-8"),
            message,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise Unauthorized("Document access token is invalid")

    def _require_upload_origin(self) -> None:
        if not self._allowed_cors_origin():
            raise Forbidden("Upload origin is not allowed")

    def _read_json(self) -> dict[str, Any]:
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise BadRequest("Invalid Content-Length") from error

        if content_length <= 0 or content_length > MAX_BODY_BYTES:
            raise BadRequest("Invalid request body size")

        try:
            body = json.loads(self.rfile.read(content_length))
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            raise BadRequest("Invalid JSON body") from error

        if not isinstance(body, dict):
            raise BadRequest("JSON body must be an object")
        return body

    def _parse_document_route(
        self, path: str, prefix: str
    ) -> tuple[str, str]:
        remainder = path.removeprefix(prefix)
        parts = remainder.split("/")
        if len(parts) != 2:
            raise NotFound("Endpoint not found")
        return validate_reference(parts[0]), validate_document_kind(parts[1])

    def _store_uploaded_document(self, reference: str, kind: str) -> None:
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise BadRequest("Invalid Content-Length") from error
        if content_length <= 0 or content_length > MAX_DOCUMENT_BYTES:
            raise BadRequest("Invalid document size")

        self.server.store.assert_document_upload_allowed(reference, kind)
        content = self.rfile.read(content_length)
        if len(content) != content_length:
            raise BadRequest("Incomplete document upload")

        content_type, extension = detect_document_type(content)
        digest = hashlib.sha256(content).hexdigest()
        nonce = os.urandom(DOCUMENT_NONCE_BYTES)
        associated_data = f"{reference}\n{kind}".encode("utf-8")
        encrypted = AESGCM(self.server.document_key).encrypt(
            nonce,
            content,
            associated_data,
        )

        destination = self.server.store.document_path(reference, kind)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.parent.chmod(0o700)
        temporary_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="wb",
                dir=destination.parent,
                prefix=f".{kind}-",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
                temporary_file.write(DOCUMENT_FILE_MAGIC)
                temporary_file.write(nonce)
                temporary_file.write(encrypted)
                temporary_file.flush()
                os.fsync(temporary_file.fileno())
            temporary_path.chmod(0o600)
            temporary_path.replace(destination)
            self.server.store.save_document_metadata(
                reference,
                kind,
                content_type,
                extension,
                content_length,
                digest,
            )
        except Exception:
            if temporary_path and temporary_path.exists():
                temporary_path.unlink()
            raise

        self._send_json(
            HTTPStatus.CREATED,
            {
                "status": "uploaded",
                "kind": kind,
                "contentType": content_type,
                "sizeBytes": content_length,
            },
        )

    def _send_document(self, reference: str, kind: str) -> None:
        metadata = self.server.store.get_paid_document(reference, kind)
        encrypted_file = metadata["path"].read_bytes()
        header_size = len(DOCUMENT_FILE_MAGIC) + DOCUMENT_NONCE_BYTES
        if (
            len(encrypted_file) <= header_size
            or encrypted_file[: len(DOCUMENT_FILE_MAGIC)] != DOCUMENT_FILE_MAGIC
        ):
            raise RuntimeError("Invalid encrypted document file")

        nonce = encrypted_file[
            len(DOCUMENT_FILE_MAGIC) : header_size
        ]
        encrypted = encrypted_file[header_size:]
        associated_data = f"{reference}\n{kind}".encode("utf-8")
        content = AESGCM(self.server.document_key).decrypt(
            nonce,
            encrypted,
            associated_data,
        )
        if (
            len(content) != metadata["sizeBytes"]
            or not hmac.compare_digest(
                hashlib.sha256(content).hexdigest(), metadata["sha256"]
            )
        ):
            raise RuntimeError("Document integrity check failed")

        filename = f"{kind.replace('_', '-')}.{metadata['extension']}"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", metadata["contentType"])
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Cache-Control", "private, no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(content)

    def _handle(self) -> None:
        parsed_url = urlsplit(self.path)
        path = unquote(parsed_url.path)

        if self.command == "GET" and path == "/health":
            self.server.store.health()
            self._send_json(HTTPStatus.OK, {"status": "ok"})
            return

        if self.command == "OPTIONS" and path.startswith("/v1/uploads/"):
            self._require_upload_origin()
            self._parse_document_route(path, "/v1/uploads/")
            self._send_empty(HTTPStatus.NO_CONTENT)
            return

        if self.command == "PUT" and path.startswith("/v1/uploads/"):
            self._require_upload_origin()
            reference, kind = self._parse_document_route(path, "/v1/uploads/")
            self._require_signed_document_access(
                "upload", reference, kind, parsed_url.query
            )
            self._store_uploaded_document(reference, kind)
            return

        if self.command == "GET" and path.startswith("/v1/downloads/"):
            reference, kind = self._parse_document_route(path, "/v1/downloads/")
            self._require_signed_document_access(
                "download", reference, kind, parsed_url.query
            )
            self._send_document(reference, kind)
            return

        self._require_authentication()

        if self.command == "GET" and path == "/v1/sessions/upcoming":
            sessions = self.server.store.list_sessions(upcoming_only=True)
            self._send_json(HTTPStatus.OK, {"sessions": sessions})
            return

        if self.command == "GET" and path == "/v1/sessions":
            sessions = self.server.store.list_sessions()
            self._send_json(HTTPStatus.OK, {"sessions": sessions})
            return

        if self.command == "POST" and path == "/v1/sessions":
            body = self._read_json()
            start_date, end_date = validate_session_dates(
                body.get("start"), body.get("end")
            )
            session = self.server.store.create_session(
                start_date,
                end_date,
                validate_capacity(body.get("capacity")),
                validate_session_status(body.get("status", "open")),
            )
            self._send_json(HTTPStatus.CREATED, {"session": session})
            return

        if self.command == "PATCH" and path.startswith("/v1/sessions/"):
            original_start = validate_date(
                path.removeprefix("/v1/sessions/"), "session start date"
            )
            body = self._read_json()
            start_date, end_date = validate_session_dates(
                body.get("start"), body.get("end")
            )
            session = self.server.store.update_session(
                original_start,
                start_date,
                end_date,
                validate_capacity(body.get("capacity")),
                validate_session_status(body.get("status")),
            )
            self._send_json(HTTPStatus.OK, {"session": session})
            return

        if self.command == "DELETE" and path.startswith("/v1/sessions/"):
            start_date = validate_date(
                path.removeprefix("/v1/sessions/"), "session start date"
            )
            result = self.server.store.delete_session(start_date)
            self._send_json(HTTPStatus.OK, {"status": result})
            return

        if self.command == "GET" and path == "/v1/registrations/paid":
            registrations = self.server.store.list_paid_registrations()
            self._send_json(HTTPStatus.OK, {"registrations": registrations})
            return

        if self.command == "GET" and path == "/v1/registrations/pending":
            registrations = self.server.store.list_pending_registrations()
            self._send_json(HTTPStatus.OK, {"registrations": registrations})
            return

        if self.command == "PUT" and path.startswith("/v1/registrations/"):
            reference = validate_reference(path.removeprefix("/v1/registrations/"))
            body = self._read_json()
            payload = validate_payload(body.get("payload"))
            identity_document_type = validate_identity_document_type(
                body.get(
                    "identityDocumentType",
                    DEFAULT_IDENTITY_DOCUMENT_TYPE,
                )
            )
            session_start_value = body.get("sessionStart")
            session_start = (
                validate_date(session_start_value, "session start date")
                if session_start_value is not None
                else session_start_from_reference(reference)
            )
            result = self.server.store.save_registration(
                reference,
                payload,
                identity_document_type,
                session_start,
            )
            status = HTTPStatus.CREATED if result == "created" else HTTPStatus.OK
            self._send_json(status, {"status": result})
            return

        if self.command == "POST" and path == "/v1/payment-intents":
            body = self._read_json()
            result = self.server.store.create_payment_authorization(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
                validate_date(body.get("sessionStart"), "session start date"),
                validate_amount(body.get("amount")),
                validate_currency(body.get("currency")),
            )
            status = HTTPStatus.CREATED if result == "created" else HTTPStatus.OK
            self._send_json(status, {"status": result})
            return

        if self.command == "POST" and path == "/v1/payment-intents/authorized":
            body = self._read_json()
            result = self.server.store.mark_payment_authorized(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, {"status": result})
            return

        if self.command == "POST" and path == "/v1/payment-intents/approval/claim":
            body = self._read_json()
            result = self.server.store.claim_payment_approval(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, result)
            return

        if self.command == "POST" and path == "/v1/payment-intents/authorization/claim-email":
            body = self._read_json()
            result = self.server.store.claim_authorized_payment_email(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, result)
            return

        if self.command == "POST" and path == "/v1/payment-intents/authorization/complete-email":
            body = self._read_json()
            result = self.server.store.complete_authorized_payment_email(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, {"status": result})
            return

        if self.command == "POST" and path == "/v1/payment-intents/authorization/release-email":
            body = self._read_json()
            result = self.server.store.release_authorized_payment_email(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, {"status": result})
            return

        if self.command == "POST" and path == "/v1/payment-intents/approval/release":
            body = self._read_json()
            result = self.server.store.release_payment_approval(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, {"status": result})
            return

        if self.command == "POST" and path == "/v1/payment-intents/capture/claim-email":
            body = self._read_json()
            result = self.server.store.claim_captured_payment_email(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, result)
            return

        if self.command == "POST" and path == "/v1/payment-intents/capture/complete-email":
            body = self._read_json()
            result = self.server.store.complete_captured_payment_email(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, {"status": result})
            return

        if self.command == "POST" and path == "/v1/payment-intents/capture/release-email":
            body = self._read_json()
            result = self.server.store.release_captured_payment_email(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, {"status": result})
            return

        if self.command == "POST" and path == "/v1/payment-intents/cancel":
            body = self._read_json()
            result = self.server.store.cancel_payment_authorization(
                validate_payment_intent_id(body.get("paymentIntentId")),
                validate_reference(body.get("reference")),
            )
            self._send_json(HTTPStatus.OK, {"status": result})
            return

        if self.command == "POST" and path == "/v1/payments/claim":
            body = self._read_json()
            checkout_session_id = validate_checkout_session_id(
                body.get("checkoutSessionId")
            )
            reference = validate_reference(body.get("reference"))
            result = self.server.store.claim_payment(checkout_session_id, reference)
            self._send_json(HTTPStatus.OK, result)
            return

        if self.command == "POST" and path == "/v1/documents/verify":
            body = self._read_json()
            reference = validate_reference(body.get("reference"))
            self._send_json(
                HTTPStatus.OK,
                self.server.store.get_document_status(reference),
            )
            return

        if self.command == "POST" and path == "/v1/payments/complete":
            body = self._read_json()
            checkout_session_id = validate_checkout_session_id(
                body.get("checkoutSessionId")
            )
            reference = validate_reference(body.get("reference"))
            result = self.server.store.complete_payment(
                checkout_session_id, reference
            )
            self._send_json(HTTPStatus.OK, {"status": result})
            return

        raise NotFound("Endpoint not found")

    def do_GET(self) -> None:  # noqa: N802
        self._dispatch()

    def do_POST(self) -> None:  # noqa: N802
        self._dispatch()

    def do_PUT(self) -> None:  # noqa: N802
        self._dispatch()

    def do_PATCH(self) -> None:  # noqa: N802
        self._dispatch()

    def do_DELETE(self) -> None:  # noqa: N802
        self._dispatch()

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._dispatch()

    def _dispatch(self) -> None:
        try:
            self._handle()
        except StoreError as error:
            self._send_json(error.status, {"error": error.code, "message": str(error)})
        except Exception:
            LOGGER.exception("Unhandled request failure")
            self._send_json(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {"error": "internal_error", "message": "Internal server error"},
            )

    def log_message(self, format_string: str, *args: Any) -> None:
        LOGGER.info("%s - %s", self.client_address[0], format_string % args)


def create_server(
    host: str,
    port: int,
    database_path: str,
    api_token: str,
    documents_path: str | None = None,
) -> RegistrationStoreServer:
    if len(api_token) < 32:
        raise ValueError("REGISTRATION_STORE_TOKEN must contain at least 32 characters")
    return RegistrationStoreServer(
        (host, port),
        RegistrationStore(database_path, documents_path),
        api_token,
    )


def main() -> None:
    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    host = os.environ.get("REGISTRATION_STORE_HOST", "127.0.0.1")
    port = int(os.environ.get("REGISTRATION_STORE_PORT", "8787"))
    database_path = os.environ.get(
        "REGISTRATION_STORE_DB_PATH",
        "/var/lib/gpformation-registration-store/registrations.sqlite3",
    )
    documents_path = os.environ.get(
        "REGISTRATION_STORE_DOCUMENTS_PATH",
        "/var/lib/gpformation-registration-store/documents",
    )
    api_token = os.environ.get("REGISTRATION_STORE_TOKEN", "")
    server = create_server(
        host,
        port,
        database_path,
        api_token,
        documents_path,
    )
    LOGGER.info("Listening on %s:%s", host, port)
    server.serve_forever()


if __name__ == "__main__":
    main()
