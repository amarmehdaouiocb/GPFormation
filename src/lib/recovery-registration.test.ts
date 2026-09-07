import { createCipheriv, randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `recovery-registration.ts` is a server module: the `server-only` guard
// throws outside a React Server Components runtime, so it is stubbed here.
vi.mock("server-only", () => ({}));

import {
  getPaidRecoveryRegistrations,
  getPendingRecoveryRegistrations,
  savePendingRecoveryRegistration,
  type RecoveryRegistrationData,
} from "./recovery-registration";

const ENCRYPTION_KEY = randomBytes(32);

function encryptForTest(registration: unknown): string {
  const initializationVector = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, initializationVector);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(registration), "utf8"),
    cipher.final(),
  ]);

  return [initializationVector, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

const baseData: Omit<RecoveryRegistrationData, "channel"> = {
  email: "jean.dupont@example.com",
  telephone: "0600000000",
  nom: "Dupont",
  prenoms: "Jean",
  dateNaissance: "1990-01-15",
  lieuNaissance: "Paris",
  adresse: "1 rue de la Paix",
  codePostal: "75002",
  ville: "Paris",
  numeroPermis: "123456789012",
  typePieceIdentite: "carte_identite",
  session: { start: "2026-10-05", end: "2026-10-06" },
};

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getLastRequestBody(): Record<string, unknown> {
  const [, init] = fetchMock.mock.calls.at(-1) ?? [];
  return JSON.parse(String(init?.body)) as Record<string, unknown>;
}

beforeEach(() => {
  vi.stubEnv("REGISTRATION_ENCRYPTION_KEY", ENCRYPTION_KEY.toString("base64"));
  vi.stubEnv("REGISTRATION_STORE_URL", "https://store.test");
  vi.stubEnv("REGISTRATION_STORE_TOKEN", "test-token");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("recovery registration payload", () => {
  it("round-trips the channel through encryption", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    await savePendingRecoveryRegistration("recovery_20261005_test", {
      ...baseData,
      channel: "ecolegallieni",
    });

    const storedBody = getLastRequestBody();
    expect(storedBody).toMatchObject({
      identityDocumentType: "carte_identite",
      sessionStart: "2026-10-05",
    });
    expect(storedBody.payload).toEqual(expect.any(String));
    expect(storedBody.payload).not.toContain("ecolegallieni");
    expect(storedBody).not.toHaveProperty("channel");

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        registrations: [
          {
            reference: "recovery_20261005_test",
            payload: storedBody.payload,
            registrationCreatedAt: "2026-09-07T10:00:00.000Z",
            stripePaymentId: "pi_test",
            paymentSource: "payment_intent",
            paidAt: "2026-09-07T10:05:00.000Z",
            emailSentAt: null,
            documents: [],
          },
        ],
      }),
    );
    const [registration] = await getPaidRecoveryRegistrations();

    expect(registration.data.channel).toBe("ecolegallieni");
    expect(registration.data).toMatchObject(baseData);
  });

  it("attributes payloads stored without a channel to gpformation", async () => {
    const legacyPayload = encryptForTest({
      version: 1,
      createdAt: "2026-06-01T08:00:00.000Z",
      data: baseData,
    });
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        registrations: [
          {
            reference: "recovery_20261005_legacy",
            payload: legacyPayload,
            registrationCreatedAt: "2026-06-01T08:00:00.000Z",
            paymentIntentId: "pi_legacy",
            paymentStatus: "requires_capture",
            amount: 21_900,
            currency: "eur",
            authorizedAt: "2026-06-01T08:10:00.000Z",
            documents: [],
          },
        ],
      }),
    );

    const [registration] = await getPendingRecoveryRegistrations();

    expect(registration.data.channel).toBe("gpformation");
    expect(registration.createdAt).toBe("2026-06-01T08:00:00.000Z");
  });

  it("never trusts an unknown channel found in a stored payload", async () => {
    const tamperedPayload = encryptForTest({
      version: 1,
      createdAt: "2026-06-01T08:00:00.000Z",
      data: { ...baseData, channel: "<script>" },
    });
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        registrations: [
          {
            reference: "recovery_20261005_tampered",
            payload: tamperedPayload,
            registrationCreatedAt: "2026-06-01T08:00:00.000Z",
            stripePaymentId: "pi_tampered",
            paymentSource: "payment_intent",
            paidAt: "2026-06-01T08:10:00.000Z",
            emailSentAt: null,
            documents: [],
          },
        ],
      }),
    );

    const [registration] = await getPaidRecoveryRegistrations();

    expect(registration.data.channel).toBe("gpformation");
  });
});
