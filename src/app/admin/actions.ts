"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  requireAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import {
  isRecoveryDocumentKind,
  type RecoveryDocumentKind,
} from "@/lib/recovery-documents";
import { createRecoveryDocumentDownloadUrl } from "@/lib/recovery-registration";

export type AdminLoginState = {
  message: string;
} | null;

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password || username.length > 255 || password.length > 255) {
    return { message: "Renseignez votre identifiant et votre mot de passe." };
  }

  let authenticated = false;

  try {
    authenticated = verifyAdminCredentials(username, password);

    if (authenticated) {
      await createAdminSession(username);
    }
  } catch (error) {
    console.error("Admin authentication is not configured", error);
    return {
      message:
        "L’espace administrateur n’est pas encore configuré. Contactez le gestionnaire du site.",
    };
  }

  if (!authenticated) {
    return { message: "Identifiant ou mot de passe incorrect." };
  }

  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/connexion");
}

export type AdminDocumentDownloadResult =
  | { status: "ready"; downloadUrl: string }
  | { status: "error"; message: string };

const RECOVERY_REFERENCE_PATTERN =
  /^recovery_\d{8}_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createAdminDocumentDownload(
  reference: string,
  kind: RecoveryDocumentKind,
): Promise<AdminDocumentDownloadResult> {
  await requireAdminSession();

  if (
    !RECOVERY_REFERENCE_PATTERN.test(reference) ||
    !isRecoveryDocumentKind(kind)
  ) {
    return {
      status: "error",
      message: "Ce justificatif n’est pas disponible.",
    };
  }

  try {
    return {
      status: "ready",
      downloadUrl: createRecoveryDocumentDownloadUrl(reference, kind),
    };
  } catch (error) {
    console.error("Unable to create an admin document download", error);
    return {
      status: "error",
      message: "Le téléchargement est momentanément indisponible.",
    };
  }
}
