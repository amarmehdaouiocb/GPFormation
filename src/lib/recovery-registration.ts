import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomUUID,
} from "node:crypto";
import type { RecoverySession } from "@/lib/recovery-dates";
import {
  RECOVERY_DOCUMENTS,
  type RecoveryDocumentKind,
} from "@/lib/recovery-documents";

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

interface StorePaidRegistration {
  reference: string;
  payload: string;
  registrationCreatedAt: string;
  checkoutSessionId: string;
  paidAt: string;
  emailSentAt: string | null;
  documents: RecoveryDocumentMetadata[];
}

interface StorePaidRegistrationsResponse {
  registrations: StorePaidRegistration[];
}

export type RecoveryPaymentClaim =
  | { status: "processed" }
  | { status: "ready"; data: RecoveryRegistrationData };

export interface PaidRecoveryRegistration {
  reference: string;
  checkoutSessionId: string;
  createdAt: string;
  paidAt: string;
  emailSentAt: string | null;
  documents: RecoveryDocumentMetadata[];
  data: RecoveryRegistrationData;
}

export interface RecoveryDocumentMetadata {
  kind: RecoveryDocumentKind;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface RecoveryDocumentUploadTarget {
  kind: RecoveryDocumentKind;
  uploadUrl: string;
}

interface StoreDocumentStatusResponse {
  complete: boolean;
  documents: RecoveryDocumentMetadata[];
}

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

function createDocumentAccessUrl(
  reference: string,
  kind: RecoveryDocumentKind,
  purpose: "upload" | "download",
): string {
  const expiresInSeconds = purpose === "upload" ? 15 * 60 : 2 * 60;
  const expires = Math.floor(Date.now() / 1_000) + expiresInSeconds;
  const signature = createHmac(
    "sha256",
    getRequiredEnvironmentVariable("REGISTRATION_STORE_TOKEN"),
  )
    .update(`${purpose}\n${reference}\n${kind}\n${expires}`, "utf8")
    .digest("hex");
  const route = purpose === "upload" ? "uploads" : "downloads";
  const url = new URL(
    getRegistrationStoreUrl(
      `/v1/${route}/${encodeURIComponent(reference)}/${encodeURIComponent(kind)}`,
    ),
  );

  url.searchParams.set("expires", String(expires));
  url.searchParams.set("signature", signature);
  return url.toString();
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

export function createRecoveryDocumentUploadTargets(
  reference: string,
): RecoveryDocumentUploadTarget[] {
  return RECOVERY_DOCUMENTS.map(({ kind }) => ({
    kind,
    uploadUrl: createDocumentAccessUrl(reference, kind, "upload"),
  }));
}

export async function verifyRecoveryDocuments(
  reference: string,
): Promise<StoreDocumentStatusResponse> {
  return requestRegistrationStore<StoreDocumentStatusResponse>(
    "/v1/documents/verify",
    {
      method: "POST",
      body: JSON.stringify({ reference }),
    },
  );
}

export function createRecoveryDocumentDownloadUrl(
  reference: string,
  kind: RecoveryDocumentKind,
): string {
  return createDocumentAccessUrl(reference, kind, "download");
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

export async function getPaidRecoveryRegistrations(): Promise<
  PaidRecoveryRegistration[]
> {
  const response =
    await requestRegistrationStore<StorePaidRegistrationsResponse>(
      "/v1/registrations/paid",
      { method: "GET" },
    );

  return response.registrations.map((registration) => {
    const decrypted = decryptRegistration(registration.payload);

    return {
      reference: registration.reference,
      checkoutSessionId: registration.checkoutSessionId,
      createdAt: decrypted.createdAt,
      paidAt: registration.paidAt,
      emailSentAt: registration.emailSentAt,
      documents: registration.documents,
      data: decrypted.data,
    };
  });
}
