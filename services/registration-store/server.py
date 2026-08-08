#!/usr/bin/env python3
"""Minimal authenticated SQLite store for paid recovery registrations."""

from __future__ import annotations

import hmac
import json
import logging
import os
import re
import sqlite3
from contextlib import closing, contextmanager
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Iterator
from urllib.parse import unquote, urlsplit


MAX_BODY_BYTES = 128 * 1024
MAX_PAYLOAD_BYTES = 96 * 1024
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


class RegistrationStore:
    def __init__(self, database_path: str) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
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


class RegistrationStoreHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server: RegistrationStoreServer

    def _send_json(self, status: HTTPStatus, body: dict[str, Any]) -> None:
        encoded = json.dumps(body, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def _require_authentication(self) -> None:
        expected = f"Bearer {self.server.api_token}"
        provided = self.headers.get("Authorization", "")
        if not hmac.compare_digest(provided, expected):
            raise Unauthorized("Authentication required")

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

    def _handle(self) -> None:
        path = unquote(urlsplit(self.path).path)

        if self.command == "GET" and path == "/health":
            self.server.store.health()
            self._send_json(HTTPStatus.OK, {"status": "ok"})
            return

        self._require_authentication()

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
) -> RegistrationStoreServer:
    if len(api_token) < 32:
        raise ValueError("REGISTRATION_STORE_TOKEN must contain at least 32 characters")
    return RegistrationStoreServer(
        (host, port),
        RegistrationStore(database_path),
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
    api_token = os.environ.get("REGISTRATION_STORE_TOKEN", "")
    server = create_server(host, port, database_path, api_token)
    LOGGER.info("Listening on %s:%s", host, port)
    server.serve_forever()


if __name__ == "__main__":
    main()
