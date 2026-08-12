"use server";

import { isIdentityDocumentType } from "@/lib/recovery-documents";
import type { RecoverySession } from "@/lib/recovery-dates";
import {
  createRecoveryPaymentAuthorization,
  createRecoveryDocumentUploadTargets,
  createRecoveryRegistrationReference,
  getUpcomingRecoverySessions,
  savePendingRecoveryRegistration,
  verifyRecoveryDocuments,
  type RecoveryDocumentUploadTarget,
  type RecoveryRegistrantDetails,
} from "@/lib/recovery-registration";
import {
  getStripeClient,
  RECOVERY_PAYMENT_AMOUNT,
  RECOVERY_PAYMENT_CURRENCY,
} from "@/lib/stripe";

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
  | { status: "ready"; clientSecret: string }
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
  "typePieceIdentite",
];

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
  let availableSessions: RecoverySession[];

  try {
    availableSessions = await getUpcomingRecoverySessions();
  } catch (error) {
    console.error("Unable to load recovery sessions", error);
    return {
      status: "error",
      message:
        "Le calendrier est momentanément indisponible. Veuillez réessayer ou nous appeler au 01 45 09 09 35.",
    };
  }

  const selectedSession = availableSessions.find(
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

  if (!isIdentityDocumentType(details.typePieceIdentite)) {
    return {
      status: "error",
      message: "Veuillez choisir le type de pièce d’identité fourni.",
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

  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET ||
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ) {
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
      uploads: createRecoveryDocumentUploadTargets(
        reference,
        details.typePieceIdentite,
      ),
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
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
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

    const compactSessionStart = reference.slice("recovery_".length, 17);
    const sessionStart = `${compactSessionStart.slice(0, 4)}-${compactSessionStart.slice(4, 6)}-${compactSessionStart.slice(6, 8)}`;
    const availableSessions = await getUpcomingRecoverySessions();

    if (!availableSessions.some((session) => session.start === sessionStart)) {
      return {
        status: "error",
        message:
          "Cette session n’est plus disponible. Votre carte n’a pas été débitée.",
      };
    }

    const paymentIntent = await getStripeClient().paymentIntents.create(
      {
        amount: RECOVERY_PAYMENT_AMOUNT,
        currency: RECOVERY_PAYMENT_CURRENCY,
        capture_method: "manual",
        payment_method_types: ["card"],
        description: "Stage de récupération de points",
        metadata: {
          payment_type: "recovery_points",
          registration_reference: reference,
          session_start: sessionStart,
        },
      },
      { idempotencyKey: `recovery-registration/${reference}` },
    );

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe returned a PaymentIntent without a client secret");
    }

    await createRecoveryPaymentAuthorization({
      paymentIntentId: paymentIntent.id,
      reference,
      sessionStart,
      amount: RECOVERY_PAYMENT_AMOUNT,
      currency: RECOVERY_PAYMENT_CURRENCY,
    });

    return { status: "ready", clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Unable to prepare recovery payment", error);
    return {
      status: "error",
      message:
        "Impossible de vérifier vos justificatifs pour le moment. Veuillez réessayer.",
    };
  }
}
