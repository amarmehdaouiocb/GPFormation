"use server";

import { redirect } from "next/navigation";
import { getUpcomingRecoverySessions } from "@/lib/recovery-dates";
import {
  createRecoveryRegistrationReference,
  savePendingRecoveryRegistration,
  type RecoveryRegistrantDetails,
} from "@/lib/recovery-registration";

export type RecoveryRegistrationState = {
  message: string;
} | null;

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
  "dateDelivranceTitre",
  "dateExpirationTitre",
  "autoriteDelivrance",
  "dateObtentionCategorie",
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
  const selectedSession = getUpcomingRecoverySessions().find(
    (session) => session.start === selectedSessionStart,
  );

  if (REQUIRED_FIELDS.some((field) => !details[field])) {
    return {
      message: "Veuillez remplir tous les champs obligatoires avant de passer au paiement.",
    };
  }

  if (REQUIRED_FIELDS.some((field) => details[field].length > 255)) {
    return {
      message: "Un ou plusieurs champs sont trop longs.",
    };
  }

  if (!selectedSession) {
    return {
      message: "Veuillez choisir une session de stage encore disponible.",
    };
  }

  if (!consentement) {
    return {
      message:
        "Veuillez accepter l'utilisation de ces informations pour préparer votre inscription.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(details.email)) {
    return {
      message: "Veuillez entrer une adresse email valide.",
    };
  }

  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_RECOVERY_LINK;
  const paymentWebhookReady = Boolean(
    process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_RECOVERY_PAYMENT_LINK_ID,
  );

  if (!paymentLink || !paymentWebhookReady) {
    return {
      message:
        "Le paiement en ligne est momentanément indisponible. Veuillez nous appeler au 01 45 09 09 35.",
    };
  }

  let paymentUrl: URL;

  try {
    const reference = createRecoveryRegistrationReference(selectedSession.start);
    await savePendingRecoveryRegistration(reference, {
      ...details,
      session: selectedSession,
    });

    paymentUrl = new URL(paymentLink);
    paymentUrl.searchParams.set("client_reference_id", reference);
  } catch {
    return {
      message:
        "Impossible de sécuriser votre inscription pour le moment. Veuillez réessayer ou nous appeler au 01 45 09 09 35.",
    };
  }

  redirect(paymentUrl.toString());
}
