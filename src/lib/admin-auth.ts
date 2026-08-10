import "server-only";

import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "gpformation_admin_session";
const ADMIN_SESSION_DURATION_SECONDS = 8 * 60 * 60;

interface AdminSessionPayload {
  username: string;
  expiresAt: number;
}

function getRequiredAdminVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required admin environment variable: ${name}`);
  }

  return value;
}

function getSessionSecret(): string {
  const secret = getRequiredAdminVariable("ADMIN_SESSION_SECRET");

  if (secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");
  }

  return secret;
}

function hash(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function compareValues(value: string, expected: string): boolean {
  return timingSafeEqual(hash(value), hash(expected));
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(payload, "utf8")
    .digest("base64url");
}

function createSessionToken(payload: AdminSessionPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

function parseSessionToken(token: string): AdminSessionPayload | null {
  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = signPayload(encodedPayload);

  if (!compareValues(providedSignature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as AdminSessionPayload;

    if (
      typeof payload.username !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now() ||
      !compareValues(
        payload.username,
        getRequiredAdminVariable("ADMIN_USERNAME"),
      )
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(
  username: string,
  password: string,
): boolean {
  return (
    compareValues(username, getRequiredAdminVariable("ADMIN_USERNAME")) &&
    compareValues(password, getRequiredAdminVariable("ADMIN_PASSWORD"))
  );
}

export async function createAdminSession(username: string): Promise<void> {
  const expiresAt = Date.now() + ADMIN_SESSION_DURATION_SECONDS * 1_000;
  const cookieStore = await cookies();

  cookieStore.set(
    ADMIN_COOKIE_NAME,
    createSessionToken({ username, expiresAt }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/admin",
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
    },
  );
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    return Boolean(token && parseSessionToken(token));
  } catch {
    return false;
  }
}

export async function requireAdminSession(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/connexion");
  }
}
