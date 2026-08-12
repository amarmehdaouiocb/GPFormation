"use server";

import { revalidatePath } from "next/cache";
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
import {
  cancelRecoveryPaymentAuthorization,
  claimRecoveryPaymentApproval,
  createRecoverySession,
  deleteRecoverySession,
  releaseRecoveryPaymentApproval,
  updateRecoverySession,
} from "@/lib/recovery-registration";
import { processCapturedRecoveryPayment } from "@/lib/recovery-payment";
import { getRecoveryPaymentMetadata, getStripeClient } from "@/lib/stripe";

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
const PAYMENT_INTENT_PATTERN = /^pi_[A-Za-z0-9_]{8,255}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function redirectToAdmin(
  type: "success" | "error",
  message: string,
  anchor: "payments" | "sessions",
): never {
  const parameters = new URLSearchParams({ type, message, area: anchor });
  redirect(`/admin?${parameters.toString()}#${anchor}`);
}

function getSessionFormValues(formData: FormData) {
  const start = String(formData.get("start") ?? "").trim();
  const end = String(formData.get("end") ?? "").trim();
  const capacity = Number(formData.get("capacity"));
  const status = formData.get("status") === "closed" ? "closed" : "open";

  if (
    !DATE_PATTERN.test(start) ||
    !DATE_PATTERN.test(end) ||
    end < start ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 100
  ) {
    throw new Error("Vérifiez les dates et la capacité de la session.");
  }

  return { start, end, capacity, status } as const;
}

function getPaymentIdentifiers(formData: FormData) {
  const reference = String(formData.get("reference") ?? "");
  const paymentIntentId = String(formData.get("paymentIntentId") ?? "");

  if (
    !RECOVERY_REFERENCE_PATTERN.test(reference) ||
    !PAYMENT_INTENT_PATTERN.test(paymentIntentId)
  ) {
    throw new Error("Cette demande de paiement n’est pas valide.");
  }

  return { reference, paymentIntentId };
}

function getAdminErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("Session is full")) {
    return "La session est complète. Aucun paiement n’a été encaissé.";
  }
  if (message.includes("Session is closed")) {
    return "La session est fermée. Aucun paiement n’a été encaissé.";
  }
  if (message.includes("Dates cannot be changed")) {
    return "Les dates ne peuvent plus être modifiées car des dossiers existent déjà.";
  }
  if (message.includes("Capacity cannot be lower")) {
    return "La capacité ne peut pas être inférieure au nombre d’inscriptions confirmées.";
  }
  if (message.includes("already captured")) {
    return "Ce paiement avait déjà été encaissé : l’inscription a été conservée et synchronisée.";
  }

  return message || "L’opération a échoué. Veuillez réessayer.";
}

export async function createAdminRecoverySession(
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  try {
    await createRecoverySession(getSessionFormValues(formData));
    revalidatePath("/admin");
    revalidatePath("/recuperation-de-points");
  } catch (error) {
    redirectToAdmin("error", getAdminErrorMessage(error), "sessions");
  }

  redirectToAdmin("success", "La session a été ajoutée.", "sessions");
}

export async function updateAdminRecoverySession(
  originalStart: string,
  formData: FormData,
): Promise<void> {
  await requireAdminSession();

  if (!DATE_PATTERN.test(originalStart)) {
    redirectToAdmin("error", "Cette session n’est pas valide.", "sessions");
  }

  try {
    await updateRecoverySession(originalStart, getSessionFormValues(formData));
    revalidatePath("/admin");
    revalidatePath("/recuperation-de-points");
  } catch (error) {
    redirectToAdmin("error", getAdminErrorMessage(error), "sessions");
  }

  redirectToAdmin("success", "La session a été mise à jour.", "sessions");
}

export async function deleteAdminRecoverySession(
  start: string,
): Promise<void> {
  await requireAdminSession();

  if (!DATE_PATTERN.test(start)) {
    redirectToAdmin("error", "Cette session n’est pas valide.", "sessions");
  }

  try {
    await deleteRecoverySession(start);
    revalidatePath("/admin");
    revalidatePath("/recuperation-de-points");
  } catch (error) {
    redirectToAdmin("error", getAdminErrorMessage(error), "sessions");
  }

  redirectToAdmin("success", "La session a été supprimée du calendrier.", "sessions");
}

export async function approveRecoveryPayment(formData: FormData): Promise<void> {
  await requireAdminSession();

  let identifiers: ReturnType<typeof getPaymentIdentifiers>;
  try {
    identifiers = getPaymentIdentifiers(formData);
  } catch (error) {
    redirectToAdmin("error", getAdminErrorMessage(error), "payments");
  }

  let approvalClaimed = false;
  let paymentCaptured = false;

  try {
    await claimRecoveryPaymentApproval(
      identifiers.paymentIntentId,
      identifiers.reference,
    );
    approvalClaimed = true;

    const stripe = getStripeClient();
    let paymentIntent = await stripe.paymentIntents.retrieve(
      identifiers.paymentIntentId,
    );
    const metadata = getRecoveryPaymentMetadata(paymentIntent);
    if (!metadata || metadata.reference !== identifiers.reference) {
      throw new Error("Le paiement Stripe ne correspond pas à ce dossier.");
    }

    if (paymentIntent.status === "requires_capture") {
      paymentIntent = await stripe.paymentIntents.capture(
        identifiers.paymentIntentId,
        {},
        { idempotencyKey: `capture/${identifiers.paymentIntentId}` },
      );
    }

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Stripe n’a pas confirmé l’encaissement.");
    }

    paymentCaptured = true;
    await processCapturedRecoveryPayment(
      paymentIntent,
      identifiers.reference,
    );
    revalidatePath("/admin");
    revalidatePath("/recuperation-de-points");
  } catch (error) {
    if (approvalClaimed && !paymentCaptured) {
      try {
        await releaseRecoveryPaymentApproval(
          identifiers.paymentIntentId,
          identifiers.reference,
        );
      } catch (releaseError) {
        console.error("Unable to release payment approval", releaseError);
      }
    }
    redirectToAdmin("error", getAdminErrorMessage(error), "payments");
  }

  redirectToAdmin(
    "success",
    "Le paiement a été encaissé et l’inscription confirmée.",
    "payments",
  );
}

export async function rejectRecoveryPayment(formData: FormData): Promise<void> {
  await requireAdminSession();

  let identifiers: ReturnType<typeof getPaymentIdentifiers>;
  try {
    identifiers = getPaymentIdentifiers(formData);
  } catch (error) {
    redirectToAdmin("error", getAdminErrorMessage(error), "payments");
  }

  try {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(
      identifiers.paymentIntentId,
    );

    if (paymentIntent.status === "succeeded") {
      await processCapturedRecoveryPayment(
        paymentIntent,
        identifiers.reference,
      );
      revalidatePath("/admin");
      throw new Error("Payment was already captured");
    }

    if (paymentIntent.status !== "canceled") {
      await stripe.paymentIntents.cancel(identifiers.paymentIntentId);
    }
    await cancelRecoveryPaymentAuthorization(
      identifiers.paymentIntentId,
      identifiers.reference,
    );
    revalidatePath("/admin");
  } catch (error) {
    redirectToAdmin("error", getAdminErrorMessage(error), "payments");
  }

  redirectToAdmin(
    "success",
    "La demande a été refusée. Aucun paiement n’a été encaissé.",
    "payments",
  );
}

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
