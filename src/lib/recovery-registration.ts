import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from "node:crypto";
import type { RecoverySession } from "@/lib/recovery-dates";

export interface RecoveryRegistrantDetails {
  email: string;
  telephone: string;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  codePostal: string;
  ville: string;
  numeroPermis: string;
  dateDelivranceTitre: string;
  dateExpirationTitre: string;
  autoriteDelivrance: string;
  dateObtentionCategorie: string;
}

export interface RecoveryRegistrationData extends RecoveryRegistrantDetails {
  session: RecoverySession;
}

interface StoredRecoveryRegistration {
  version: 1;
  createdAt: string;
  data: RecoveryRegistrationData;
}

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const STORE_REQUEST_TIMEOUT_MS = 8_000;

interface StorePaymentClaimResponse {
  status: "ready" | "processed";
  payload?: string;
}

export type RecoveryPaymentClaim =
  | { status: "processed" }
  | { status: "ready"; data: RecoveryRegistrationData };

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getRegistrationStoreUrl(path: string): string {
  const baseUrl = new URL(
    getRequiredEnvironmentVariable("REGISTRATION_STORE_URL"),
  );

  if (process.env.NODE_ENV === "production" && baseUrl.protocol !== "https:") {
    throw new Error("REGISTRATION_STORE_URL must use HTTPS in production");
  }

  return `${baseUrl.toString().replace(/\/$/, "")}${path}`;
}

async function requestRegistrationStore<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(getRegistrationStoreUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${getRequiredEnvironmentVariable("REGISTRATION_STORE_TOKEN")}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(STORE_REQUEST_TIMEOUT_MS),
  });
  const body = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(
      `Registration store request failed (${response.status}): ${body.message ?? "unknown error"}`,
    );
  }

  return body;
}

function getEncryptionKey(): Buffer {
  const key = Buffer.from(
    getRequiredEnvironmentVariable("REGISTRATION_ENCRYPTION_KEY"),
    "base64",
  );

  if (key.length !== 32) {
    throw new Error("REGISTRATION_ENCRYPTION_KEY must contain 32 base64-encoded bytes");
  }

  return key;
}

function encryptRegistration(registration: StoredRecoveryRegistration): string {
  const initializationVector = randomBytes(12);
  const cipher = createCipheriv(
    ENCRYPTION_ALGORITHM,
    getEncryptionKey(),
    initializationVector,
  );
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(registration), "utf8"),
    cipher.final(),
  ]);
  const authenticationTag = cipher.getAuthTag();

  return [initializationVector, authenticationTag, encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

function decryptRegistration(payload: string): StoredRecoveryRegistration {
  const [initializationVector, authenticationTag, encrypted] = payload
    .split(".")
    .map((part) => Buffer.from(part, "base64url"));

  if (!initializationVector || !authenticationTag || !encrypted) {
    throw new Error("Invalid encrypted recovery registration");
  }

  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    getEncryptionKey(),
    initializationVector,
  );
  decipher.setAuthTag(authenticationTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
  const registration = JSON.parse(decrypted) as StoredRecoveryRegistration;

  if (registration.version !== 1) {
    throw new Error("Unsupported recovery registration version");
  }

  return registration;
}

export function createRecoveryRegistrationReference(sessionStart: string): string {
  return `recovery_${sessionStart.replaceAll("-", "")}_${randomUUID()}`;
}

export async function savePendingRecoveryRegistration(
  reference: string,
  data: RecoveryRegistrationData,
): Promise<void> {
  const registration: StoredRecoveryRegistration = {
    version: 1,
    createdAt: new Date().toISOString(),
    data,
  };

  await requestRegistrationStore(`/v1/registrations/${encodeURIComponent(reference)}`, {
    method: "PUT",
    body: JSON.stringify({ payload: encryptRegistration(registration) }),
  });
}

export async function claimRecoveryPayment(
  checkoutSessionId: string,
  reference: string,
): Promise<RecoveryPaymentClaim> {
  const claim = await requestRegistrationStore<StorePaymentClaimResponse>(
    "/v1/payments/claim",
    {
      method: "POST",
      body: JSON.stringify({ checkoutSessionId, reference }),
    },
  );

  if (claim.status === "processed") {
    return { status: "processed" };
  }

  if (!claim.payload) {
    throw new Error("Registration store returned an empty encrypted payload");
  }

  return {
    status: "ready",
    data: decryptRegistration(claim.payload).data,
  };
}

export async function completeRecoveryPayment(
  checkoutSessionId: string,
  reference: string,
): Promise<void> {
  await requestRegistrationStore("/v1/payments/complete", {
    method: "POST",
    body: JSON.stringify({ checkoutSessionId, reference }),
  });
}
