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
  getRequiredRecoveryDocuments,
  isIdentityDocumentType,
  type IdentityDocumentType,
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
  typePieceIdentite: IdentityDocumentType;
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
  status: "ready" | "processed" | "processing";
  payload?: string;
}

interface StorePaidRegistration {
  reference: string;
  payload: string;
  registrationCreatedAt: string;
  stripePaymentId: string;
  paymentSource: "checkout" | "payment_intent";
  paidAt: string;
  emailSentAt: string | null;
  documents: RecoveryDocumentMetadata[];
}

interface StorePaidRegistrationsResponse {
  registrations: StorePaidRegistration[];
}

interface StorePendingRegistration {
  reference: string;
  payload: string;
  registrationCreatedAt: string;
  paymentIntentId: string;
  paymentStatus: "requires_capture" | "capturing";
  amount: number;
  currency: string;
  authorizedAt: string;
  documents: RecoveryDocumentMetadata[];
}

interface StorePendingRegistrationsResponse {
  registrations: StorePendingRegistration[];
}

interface StoreSessionsResponse {
  sessions: RecoverySession[];
}

export type RecoveryPaymentClaim =
  | { status: "processed" }
  | { status: "ready"; data: RecoveryRegistrationData };

export interface PaidRecoveryRegistration {
  reference: string;
  stripePaymentId: string;
  paymentSource: "checkout" | "payment_intent";
  createdAt: string;
  paidAt: string;
  emailSentAt: string | null;
  documents: RecoveryDocumentMetadata[];
  data: RecoveryRegistrationData;
}

export interface PendingRecoveryRegistration {
  reference: string;
  paymentIntentId: string;
  paymentStatus: "requires_capture" | "capturing";
  amount: number;
  currency: string;
  createdAt: string;
  authorizedAt: string;
  documents: RecoveryDocumentMetadata[];
  data: RecoveryRegistrationData;
}

export type CapturedPaymentEmailClaim =
  | { status: "processed" | "processing" }
  | { status: "ready"; data: RecoveryRegistrationData };

export type AuthorizedPaymentEmailClaim = CapturedPaymentEmailClaim;

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

  if (!isIdentityDocumentType(registration.data.typePieceIdentite)) {
    registration.data.typePieceIdentite = "carte_identite";
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
    body: JSON.stringify({
      payload: encryptRegistration(registration),
      identityDocumentType: data.typePieceIdentite,
      sessionStart: data.session.start,
    }),
  });
}

export function createRecoveryDocumentUploadTargets(
  reference: string,
  identityDocumentType: IdentityDocumentType,
): RecoveryDocumentUploadTarget[] {
  return getRequiredRecoveryDocuments(identityDocumentType).map(({ kind }) => ({
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

export async function getUpcomingRecoverySessions(): Promise<RecoverySession[]> {
  const response = await requestRegistrationStore<StoreSessionsResponse>(
    "/v1/sessions/upcoming",
    { method: "GET" },
  );
  return response.sessions;
}

export async function getAllRecoverySessions(): Promise<RecoverySession[]> {
  const response = await requestRegistrationStore<StoreSessionsResponse>(
    "/v1/sessions",
    { method: "GET" },
  );
  return response.sessions;
}

export async function createRecoverySession(
  session: Required<Pick<RecoverySession, "start" | "end" | "capacity" | "status">>,
): Promise<void> {
  await requestRegistrationStore("/v1/sessions", {
    method: "POST",
    body: JSON.stringify(session),
  });
}

export async function updateRecoverySession(
  originalStart: string,
  session: Required<Pick<RecoverySession, "start" | "end" | "capacity" | "status">>,
): Promise<void> {
  await requestRegistrationStore(
    `/v1/sessions/${encodeURIComponent(originalStart)}`,
    {
      method: "PATCH",
      body: JSON.stringify(session),
    },
  );
}

export async function deleteRecoverySession(start: string): Promise<void> {
  await requestRegistrationStore(
    `/v1/sessions/${encodeURIComponent(start)}`,
    { method: "DELETE" },
  );
}

export async function createRecoveryPaymentAuthorization(input: {
  paymentIntentId: string;
  reference: string;
  sessionStart: string;
  amount: number;
  currency: string;
}): Promise<void> {
  await requestRegistrationStore("/v1/payment-intents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function markRecoveryPaymentAuthorized(
  paymentIntentId: string,
  reference: string,
): Promise<void> {
  await requestRegistrationStore("/v1/payment-intents/authorized", {
    method: "POST",
    body: JSON.stringify({ paymentIntentId, reference }),
  });
}

export async function claimAuthorizedRecoveryPaymentEmail(
  paymentIntentId: string,
  reference: string,
): Promise<AuthorizedPaymentEmailClaim> {
  const claim = await requestRegistrationStore<StorePaymentClaimResponse>(
    "/v1/payment-intents/authorization/claim-email",
    {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, reference }),
    },
  );

  if (claim.status !== "ready") {
    return { status: claim.status };
  }
  if (!claim.payload) {
    throw new Error("Registration store returned an empty encrypted payload");
  }
  return {
    status: "ready",
    data: decryptRegistration(claim.payload).data,
  };
}

export async function completeAuthorizedRecoveryPaymentEmail(
  paymentIntentId: string,
  reference: string,
): Promise<void> {
  await requestRegistrationStore(
    "/v1/payment-intents/authorization/complete-email",
    {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, reference }),
    },
  );
}

export async function releaseAuthorizedRecoveryPaymentEmail(
  paymentIntentId: string,
  reference: string,
): Promise<void> {
  await requestRegistrationStore(
    "/v1/payment-intents/authorization/release-email",
    {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, reference }),
    },
  );
}

export async function claimRecoveryPaymentApproval(
  paymentIntentId: string,
  reference: string,
): Promise<"capturing" | "paid"> {
  const response = await requestRegistrationStore<{ status: "capturing" | "paid" }>(
    "/v1/payment-intents/approval/claim",
    {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, reference }),
    },
  );
  return response.status;
}

export async function releaseRecoveryPaymentApproval(
  paymentIntentId: string,
  reference: string,
): Promise<void> {
  await requestRegistrationStore("/v1/payment-intents/approval/release", {
    method: "POST",
    body: JSON.stringify({ paymentIntentId, reference }),
  });
}

export async function claimCapturedRecoveryPaymentEmail(
  paymentIntentId: string,
  reference: string,
): Promise<CapturedPaymentEmailClaim> {
  const claim = await requestRegistrationStore<StorePaymentClaimResponse>(
    "/v1/payment-intents/capture/claim-email",
    {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, reference }),
    },
  );

  if (claim.status !== "ready") {
    return { status: claim.status };
  }
  if (!claim.payload) {
    throw new Error("Registration store returned an empty encrypted payload");
  }
  return {
    status: "ready",
    data: decryptRegistration(claim.payload).data,
  };
}

export async function completeCapturedRecoveryPaymentEmail(
  paymentIntentId: string,
  reference: string,
): Promise<void> {
  await requestRegistrationStore("/v1/payment-intents/capture/complete-email", {
    method: "POST",
    body: JSON.stringify({ paymentIntentId, reference }),
  });
}

export async function releaseCapturedRecoveryPaymentEmail(
  paymentIntentId: string,
  reference: string,
): Promise<void> {
  await requestRegistrationStore("/v1/payment-intents/capture/release-email", {
    method: "POST",
    body: JSON.stringify({ paymentIntentId, reference }),
  });
}

export async function cancelRecoveryPaymentAuthorization(
  paymentIntentId: string,
  reference: string,
): Promise<void> {
  await requestRegistrationStore("/v1/payment-intents/cancel", {
    method: "POST",
    body: JSON.stringify({ paymentIntentId, reference }),
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
      stripePaymentId: registration.stripePaymentId,
      paymentSource: registration.paymentSource,
      createdAt: decrypted.createdAt,
      paidAt: registration.paidAt,
      emailSentAt: registration.emailSentAt,
      documents: registration.documents,
      data: decrypted.data,
    };
  });
}

export async function getPendingRecoveryRegistrations(): Promise<
  PendingRecoveryRegistration[]
> {
  const response =
    await requestRegistrationStore<StorePendingRegistrationsResponse>(
      "/v1/registrations/pending",
      { method: "GET" },
    );

  return response.registrations.map((registration) => {
    const decrypted = decryptRegistration(registration.payload);

    return {
      reference: registration.reference,
      paymentIntentId: registration.paymentIntentId,
      paymentStatus: registration.paymentStatus,
      amount: registration.amount,
      currency: registration.currency,
      createdAt: decrypted.createdAt,
      authorizedAt: registration.authorizedAt,
      documents: registration.documents,
      data: decrypted.data,
    };
  });
}
