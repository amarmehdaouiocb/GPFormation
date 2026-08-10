from __future__ import annotations

import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from server import create_server


TOKEN = "test-token-that-is-longer-than-thirty-two-characters"
REFERENCE = "recovery_20260904_123e4567-e89b-42d3-a456-426614174000"
PAYLOAD = "aGVsbG93b3JsZA.dGFnZWQ.ZW5jcnlwdGVk"
CHECKOUT_SESSION_ID = "cs_test_1234567890abcdef"


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
        request = urllib.request.Request(
            f"{self.base_url}{path}",
            data=data,
            headers=headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                return response.status, json.loads(response.read())
        except urllib.error.HTTPError as error:
            try:
                return error.code, json.loads(error.read())
            finally:
                error.close()

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
            },
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


if __name__ == "__main__":
    unittest.main()
