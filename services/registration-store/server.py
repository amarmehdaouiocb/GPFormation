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
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Iterator
from urllib.parse import parse_qs, unquote, urlsplit

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
ENCRYPTED_PAYLOAD_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+$")

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
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
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

    def document_path(self, reference: str, kind: str) -> Path:
        return self.documents_path / reference / f"{kind}.enc"

    def assert_document_upload_allowed(self, reference: str, kind: str) -> None:
        with closing(self._connect()) as connection:
            registration = connection.execute(
                "SELECT 1 FROM registrations WHERE reference = ?",
                (reference,),
            ).fetchone()
            if not registration:
                raise NotFound("Registration was not found")

            payment = connection.execute(
                "SELECT 1 FROM payments WHERE reference = ? LIMIT 1",
                (reference,),
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
                "SELECT 1 FROM registrations WHERE reference = ?",
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

        documents = [
            {
                "kind": row["kind"],
                "contentType": row["content_type"],
                "sizeBytes": row["size_bytes"],
                "uploadedAt": row["updated_at"],
            }
            for row in rows
            if self.document_path(reference, row["kind"]).is_file()
        ]
        present_kinds = {document["kind"] for document in documents}
        return {
            "complete": present_kinds == set(DOCUMENT_KINDS),
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
                INNER JOIN payments ON payments.reference = documents.reference
                WHERE documents.reference = ?
                    AND documents.kind = ?
                    AND payments.status = 'processed'
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

    def save_registration(self, reference: str, payload: str) -> str:
        now = utc_now()
        with self._transaction() as connection:
            existing = connection.execute(
                "SELECT encrypted_payload FROM registrations WHERE reference = ?",
                (reference,),
            ).fetchone()

            if existing:
                if hmac.compare_digest(existing["encrypted_payload"], payload):
                    return "existing"
                raise Conflict("Registration reference already exists")

            connection.execute(
                """
                INSERT INTO registrations (
                    reference, encrypted_payload, created_at, updated_at
                ) VALUES (?, ?, ?, ?)
                """,
                (reference, payload, now, now),
            )
        return "created"

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
                SELECT encrypted_payload
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
            if document_kinds != set(DOCUMENT_KINDS):
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

            document_rows = connection.execute(
                """
                SELECT
                    documents.reference,
                    documents.kind,
                    documents.content_type,
                    documents.size_bytes,
                    documents.updated_at
                FROM documents
                INNER JOIN payments ON payments.reference = documents.reference
                WHERE payments.status = 'processed'
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

        return [
            {
                "reference": row["reference"],
                "payload": row["encrypted_payload"],
                "registrationCreatedAt": row["registration_created_at"],
                "checkoutSessionId": row["checkout_session_id"],
                "paidAt": row["paid_at"],
                "emailSentAt": row["email_sent_at"],
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

        if self.command == "GET" and path == "/v1/registrations/paid":
            registrations = self.server.store.list_paid_registrations()
            self._send_json(HTTPStatus.OK, {"registrations": registrations})
            return

        if self.command == "PUT" and path.startswith("/v1/registrations/"):
            reference = validate_reference(path.removeprefix("/v1/registrations/"))
            body = self._read_json()
            payload = validate_payload(body.get("payload"))
            result = self.server.store.save_registration(reference, payload)
            status = HTTPStatus.CREATED if result == "created" else HTTPStatus.OK
            self._send_json(status, {"status": result})
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
