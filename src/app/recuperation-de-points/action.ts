"use server";

import { getUpcomingRecoverySessions } from "@/lib/recovery-dates";
import {
  createRecoveryDocumentUploadTargets,
  createRecoveryRegistrationReference,
  savePendingRecoveryRegistration,
  verifyRecoveryDocuments,
  type RecoveryDocumentUploadTarget,
  type RecoveryRegistrantDetails,
} from "@/lib/recovery-registration";

export type RecoveryRegistrationState =
  | {
      status: "error";
      message: string;
    }
  | {
      status: "upload";
      reference: string;
      uploads: RecoveryDocumentUploadTarget[];
    }
  | null;

export type RecoveryRegistrationFinalization =
  | { status: "ready"; paymentUrl: string }
  | { status: "error"; message: string };

const REQUIRED_FIELDS: Array<keyof RecoveryRegistrantDetails> = [
  "email",
  "telephone",
  "nom",
  "prenoms",
  "dateNaissance",
  "lieuNaissance",
  "adresse",
  "codePostal",
  "ville",
  "numeroPermis",
];

function getPaymentLink(): string | null {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_RECOVERY_LINK;
  const paymentWebhookReady = Boolean(
    process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_RECOVERY_PAYMENT_LINK_ID,
  );

  return paymentLink && paymentWebhookReady ? paymentLink : null;
}

function getField(
  formData: FormData,
  key: keyof RecoveryRegistrantDetails,
): string {
  return ((formData.get(key) as string) ?? "").trim();
}

export async function submitRecoveryRegistration(
  _prevState: RecoveryRegistrationState,
  formData: FormData,
): Promise<RecoveryRegistrationState> {
  const details = Object.fromEntries(
    REQUIRED_FIELDS.map((field) => [field, getField(formData, field)]),
  ) as unknown as RecoveryRegistrantDetails;
  const consentement = formData.get("consentement");
  const selectedSessionStart = ((formData.get("sessionStart") as string) ?? "").trim();
  const selectedSession = getUpcomingRecoverySessions().find(
    (session) => session.start === selectedSessionStart,
  );

  if (REQUIRED_FIELDS.some((field) => !details[field])) {
    return {
      status: "error",
      message: "Veuillez remplir tous les champs obligatoires avant de passer au paiement.",
    };
  }

  if (REQUIRED_FIELDS.some((field) => details[field].length > 255)) {
    return {
      status: "error",
      message: "Un ou plusieurs champs sont trop longs.",
    };
  }

  if (!selectedSession) {
    return {
      status: "error",
      message: "Veuillez choisir une session de stage encore disponible.",
    };
  }

  if (!consentement) {
    return {
      status: "error",
      message:
        "Veuillez accepter l'utilisation de ces informations pour préparer votre inscription.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(details.email)) {
    return {
      status: "error",
      message: "Veuillez entrer une adresse email valide.",
    };
  }

  const paymentLink = getPaymentLink();

  if (!paymentLink) {
    return {
      status: "error",
      message:
        "Le paiement en ligne est momentanément indisponible. Veuillez nous appeler au 01 45 09 09 35.",
    };
  }

  try {
    const reference = createRecoveryRegistrationReference(selectedSession.start);
    await savePendingRecoveryRegistration(reference, {
      ...details,
      session: selectedSession,
    });

    return {
      status: "upload",
      reference,
      uploads: createRecoveryDocumentUploadTargets(reference),
    };
  } catch {
    return {
      status: "error",
      message:
        "Impossible de sécuriser votre inscription pour le moment. Veuillez réessayer ou nous appeler au 01 45 09 09 35.",
    };
  }
}

export async function finalizeRecoveryRegistration(
  reference: string,
): Promise<RecoveryRegistrationFinalization> {
  const paymentLink = getPaymentLink();

  if (!paymentLink) {
    return {
      status: "error",
      message:
        "Le paiement en ligne est momentanément indisponible. Veuillez nous appeler au 01 45 09 09 35.",
    };
  }

  try {
    const documentStatus = await verifyRecoveryDocuments(reference);

    if (!documentStatus.complete) {
      return {
        status: "error",
        message:
          "Un ou plusieurs justificatifs n’ont pas été reçus. Vérifiez vos fichiers puis réessayez.",
      };
    }

    const paymentUrl = new URL(paymentLink);
    paymentUrl.searchParams.set("client_reference_id", reference);

    return { status: "ready", paymentUrl: paymentUrl.toString() };
  } catch {
    return {
      status: "error",
      message:
        "Impossible de vérifier vos justificatifs pour le moment. Veuillez réessayer.",
    };
  }
}
