from __future__ import annotations

import hashlib
import hmac
import json
import sqlite3
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from server import RegistrationStore, create_server


TOKEN = "test-token-that-is-longer-than-thirty-two-characters"
REFERENCE = "recovery_20260904_123e4567-e89b-42d3-a456-426614174000"
PAYLOAD = "aGVsbG93b3JsZA.dGFnZWQ.ZW5jcnlwdGVk"
CHECKOUT_SESSION_ID = "cs_test_1234567890abcdef"
DOCUMENT_KINDS = (
    "permis_recto",
    "permis_verso",
    "identite_recto",
    "identite_verso",
)
PASSPORT_DOCUMENT_KINDS = (
    "permis_recto",
    "permis_verso",
    "identite_recto",
)
SAMPLE_PNG = b"\x89PNG\r\n\x1a\nprivate-test-document"


class RegistrationStoreApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        database_path = str(
            Path(self.temporary_directory.name) / "registrations.sqlite3"
        )
        self.server = create_server("127.0.0.1", 0, database_path, TOKEN)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.server.server_port}"

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)
        self.temporary_directory.cleanup()

    def request(
        self,
        method: str,
        path: str,
        body: dict[str, str] | None = None,
        authenticated: bool = True,
    ) -> tuple[int, dict[str, object]]:
        headers = {"Content-Type": "application/json"}
        if authenticated:
            headers["Authorization"] = f"Bearer {TOKEN}"
        data = None if body is None else json.dumps(body).encode("utf-8")
        status, response_body, _ = self.raw_request(method, path, data, headers)
        return status, json.loads(response_body)

    def raw_request(
        self,
        method: str,
        path: str,
        data: bytes | None = None,
        headers: dict[str, str] | None = None,
    ) -> tuple[int, bytes, Any]:
        request = urllib.request.Request(
            f"{self.base_url}{path}",
            data=data,
            headers=headers or {},
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                return response.status, response.read(), response.headers
        except urllib.error.HTTPError as error:
            try:
                return error.code, error.read(), error.headers
            finally:
                error.close()

    def signed_document_path(
        self,
        purpose: str,
        kind: str,
        expires_in_seconds: int = 300,
    ) -> str:
        expires = int(time.time()) + expires_in_seconds
        message = f"{purpose}\n{REFERENCE}\n{kind}\n{expires}".encode("utf-8")
        signature = hmac.new(TOKEN.encode("utf-8"), message, hashlib.sha256).hexdigest()
        route = "uploads" if purpose == "upload" else "downloads"
        return (
            f"/v1/{route}/{REFERENCE}/{kind}"
            f"?expires={expires}&signature={signature}"
        )

    def upload_document(self, kind: str) -> None:
        status, body, headers = self.raw_request(
            "PUT",
            self.signed_document_path("upload", kind),
            SAMPLE_PNG,
            {
                "Content-Type": "image/png",
                "Origin": "http://localhost:3000",
            },
        )
        self.assertEqual(status, 201, body)
        self.assertEqual(json.loads(body)["kind"], kind)
        self.assertEqual(headers["Access-Control-Allow-Origin"], "http://localhost:3000")

    def upload_all_documents(self, kinds: tuple[str, ...] = DOCUMENT_KINDS) -> None:
        for kind in kinds:
            self.upload_document(kind)

    def test_health_is_public(self) -> None:
        status, body = self.request("GET", "/health", authenticated=False)
        self.assertEqual(status, 200)
        self.assertEqual(body, {"status": "ok"})

    def test_private_endpoints_require_authentication(self) -> None:
        status, body = self.request(
            "PUT",
            f"/v1/registrations/{REFERENCE}",
            {"payload": PAYLOAD},
            authenticated=False,
        )
        self.assertEqual(status, 401)
        self.assertEqual(body["error"], "unauthorized")

    def test_paid_registration_flow_is_idempotent(self) -> None:
        status, body = self.request(
            "PUT",
            f"/v1/registrations/{REFERENCE}",
            {"payload": PAYLOAD},
        )
        self.assertEqual((status, body["status"]), (201, "created"))

        status, body = self.request(
            "PUT",
            f"/v1/registrations/{REFERENCE}",
            {"payload": PAYLOAD},
        )
        self.assertEqual((status, body["status"]), (200, "existing"))

        status, body = self.request(
            "POST",
            "/v1/documents/verify",
            {"reference": REFERENCE},
        )
        self.assertEqual(status, 200)
        self.assertFalse(body["complete"])

        self.upload_all_documents()

        status, body = self.request(
            "POST",
            "/v1/documents/verify",
            {"reference": REFERENCE},
        )
        self.assertEqual(status, 200)
        self.assertTrue(body["complete"])

        claim = {
            "checkoutSessionId": CHECKOUT_SESSION_ID,
            "reference": REFERENCE,
        }
        status, body = self.request("POST", "/v1/payments/claim", claim)
        self.assertEqual(status, 200)
        self.assertEqual(body, {"status": "ready", "payload": PAYLOAD})

        status, body = self.request("POST", "/v1/payments/claim", claim)
        self.assertEqual(status, 200)
        self.assertEqual(body, {"status": "ready", "payload": PAYLOAD})

        status, body = self.request("GET", "/v1/registrations/paid")
        self.assertEqual(status, 200)
        self.assertEqual(body, {"registrations": []})

        status, body = self.request("POST", "/v1/payments/complete", claim)
        self.assertEqual((status, body["status"]), (200, "processed"))

        status, body = self.request("GET", "/v1/registrations/paid")
        self.assertEqual(status, 200)
        registrations = body["registrations"]
        self.assertIsInstance(registrations, list)
        self.assertEqual(len(registrations), 1)
        self.assertEqual(
            registrations[0],
            {
                "reference": REFERENCE,
                "payload": PAYLOAD,
                "registrationCreatedAt": registrations[0]["registrationCreatedAt"],
                "checkoutSessionId": CHECKOUT_SESSION_ID,
                "paidAt": registrations[0]["paidAt"],
                "emailSentAt": registrations[0]["emailSentAt"],
                "documents": registrations[0]["documents"],
            },
        )
        self.assertEqual(
            {document["kind"] for document in registrations[0]["documents"]},
            set(DOCUMENT_KINDS),
        )

        status, body = self.request("POST", "/v1/payments/claim", claim)
        self.assertEqual(status, 200)
        self.assertEqual(body, {"status": "processed"})

    def test_reference_cannot_be_overwritten(self) -> None:
        path = f"/v1/registrations/{REFERENCE}"
        self.request("PUT", path, {"payload": PAYLOAD})
        status, body = self.request(
            "PUT",
            path,
            {"payload": "aGVsbG93b3JsZA.dGFnZWQ.ZGlmZmVyZW50"},
        )
        self.assertEqual(status, 409)
        self.assertEqual(body["error"], "conflict")

    def test_reference_identity_document_type_cannot_be_changed(self) -> None:
        path = f"/v1/registrations/{REFERENCE}"
        self.request(
            "PUT",
            path,
            {
                "payload": PAYLOAD,
                "identityDocumentType": "passeport",
            },
        )
        status, body = self.request(
            "PUT",
            path,
            {
                "payload": PAYLOAD,
                "identityDocumentType": "carte_identite",
            },
        )
        self.assertEqual(status, 409)
        self.assertEqual(body["error"], "conflict")

    def test_passport_requires_only_the_identity_page(self) -> None:
        status, body = self.request(
            "PUT",
            f"/v1/registrations/{REFERENCE}",
            {
                "payload": PAYLOAD,
                "identityDocumentType": "passeport",
            },
        )
        self.assertEqual((status, body["status"]), (201, "created"))

        self.upload_all_documents(PASSPORT_DOCUMENT_KINDS)

        status, body = self.request(
            "POST",
            "/v1/documents/verify",
            {"reference": REFERENCE},
        )
        self.assertEqual(status, 200)
        self.assertTrue(body["complete"])
        self.assertEqual(
            {document["kind"] for document in body["documents"]},
            set(PASSPORT_DOCUMENT_KINDS),
        )

        status, body, _ = self.raw_request(
            "PUT",
            self.signed_document_path("upload", "identite_verso"),
            SAMPLE_PNG,
            {
                "Content-Type": "image/png",
                "Origin": "http://localhost:3000",
            },
        )
        self.assertEqual(status, 409)
        self.assertEqual(json.loads(body)["error"], "conflict")

        claim = {
            "checkoutSessionId": CHECKOUT_SESSION_ID,
            "reference": REFERENCE,
        }
        status, body = self.request("POST", "/v1/payments/claim", claim)
        self.assertEqual(status, 200)
        self.assertEqual(body, {"status": "ready", "payload": PAYLOAD})

    def test_invalid_identity_document_type_is_rejected(self) -> None:
        status, body = self.request(
            "PUT",
            f"/v1/registrations/{REFERENCE}",
            {
                "payload": PAYLOAD,
                "identityDocumentType": "permis_de_conduire",
            },
        )
        self.assertEqual(status, 400)
        self.assertEqual(body["error"], "bad_request")

    def test_existing_database_is_migrated_with_card_as_default(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            database_path = Path(directory) / "legacy.sqlite3"
            connection = sqlite3.connect(database_path)
            try:
                connection.execute(
                    """
                    CREATE TABLE registrations (
                        reference TEXT PRIMARY KEY,
                        encrypted_payload TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )
                    """
                )
                connection.execute(
                    """
                    INSERT INTO registrations (
                        reference, encrypted_payload, created_at, updated_at
                    ) VALUES (?, ?, ?, ?)
                    """,
                    (REFERENCE, PAYLOAD, "2026-08-10T10:00:00Z", "2026-08-10T10:00:00Z"),
                )
                connection.commit()
            finally:
                connection.close()

            store = RegistrationStore(str(database_path))
            connection = sqlite3.connect(database_path)
            try:
                row = connection.execute(
                    """
                    SELECT identity_document_type
                    FROM registrations
                    WHERE reference = ?
                    """,
                    (REFERENCE,),
                ).fetchone()
            finally:
                connection.close()

            self.assertIsNotNone(store)
            self.assertEqual(row, ("carte_identite",))

    def test_missing_registration_cannot_be_claimed(self) -> None:
        status, body = self.request(
            "POST",
            "/v1/payments/claim",
            {
                "checkoutSessionId": CHECKOUT_SESSION_ID,
                "reference": REFERENCE,
            },
        )
        self.assertEqual(status, 404)
        self.assertEqual(body["error"], "not_found")

    def test_incomplete_documents_block_payment_claim(self) -> None:
        self.request(
            "PUT",
            f"/v1/registrations/{REFERENCE}",
            {"payload": PAYLOAD},
        )
        self.upload_document("permis_recto")

        status, body = self.request(
            "POST",
            "/v1/payments/claim",
            {
                "checkoutSessionId": CHECKOUT_SESSION_ID,
                "reference": REFERENCE,
            },
        )

        self.assertEqual(status, 409)
        self.assertEqual(body["error"], "conflict")

    def test_documents_are_encrypted_and_downloadable_only_after_payment(self) -> None:
        self.request(
            "PUT",
            f"/v1/registrations/{REFERENCE}",
            {"payload": PAYLOAD},
        )
        self.upload_all_documents()

        encrypted_path = (
            Path(self.temporary_directory.name)
            / "documents"
            / REFERENCE
            / "permis_recto.enc"
        )
        encrypted_content = encrypted_path.read_bytes()
        self.assertNotEqual(encrypted_content, SAMPLE_PNG)
        self.assertNotIn(SAMPLE_PNG, encrypted_content)

        download_path = self.signed_document_path("download", "permis_recto")
        status, _, _ = self.raw_request("GET", download_path)
        self.assertEqual(status, 404)

        claim = {
            "checkoutSessionId": CHECKOUT_SESSION_ID,
            "reference": REFERENCE,
        }
        self.request("POST", "/v1/payments/claim", claim)
        self.request("POST", "/v1/payments/complete", claim)

        status, content, headers = self.raw_request("GET", download_path)
        self.assertEqual(status, 200)
        self.assertEqual(content, SAMPLE_PNG)
        self.assertEqual(headers["Content-Type"], "image/png")
        self.assertIn("attachment", headers["Content-Disposition"])

    def test_upload_requires_allowed_origin_and_valid_signature(self) -> None:
        self.request(
            "PUT",
            f"/v1/registrations/{REFERENCE}",
            {"payload": PAYLOAD},
        )
        path = self.signed_document_path("upload", "permis_recto")

        status, body, headers = self.raw_request(
            "OPTIONS",
            path,
            headers={"Origin": "http://localhost:3000"},
        )
        self.assertEqual(status, 204)
        self.assertEqual(body, b"")
        self.assertEqual(headers["Access-Control-Allow-Origin"], "http://localhost:3000")

        status, body, _ = self.raw_request(
            "PUT",
            path,
            SAMPLE_PNG,
            {"Origin": "https://example.com"},
        )
        self.assertEqual(status, 403)
        self.assertEqual(json.loads(body)["error"], "forbidden")

        status, body, _ = self.raw_request(
            "PUT",
            f"{path}0",
            SAMPLE_PNG,
            {"Origin": "http://localhost:3000"},
        )
        self.assertEqual(status, 401)
        self.assertEqual(json.loads(body)["error"], "unauthorized")

        self.upload_document("permis_recto")
        status, body, _ = self.raw_request(
            "PUT",
            path,
            SAMPLE_PNG,
            {"Origin": "http://localhost:3000"},
        )
        self.assertEqual(status, 409)
        self.assertEqual(json.loads(body)["error"], "conflict")


if __name__ == "__main__":
    unittest.main()
