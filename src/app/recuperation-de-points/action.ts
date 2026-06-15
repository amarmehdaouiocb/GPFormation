"use server";

import {
  sendRecoveryRegistrationEmail,
  type RecoveryRegistrationEmailData,
} from "@/lib/email";

export type RecoveryRegistrationState = {
  success: boolean;
  message: string;
} | null;

const REQUIRED_FIELDS: Array<keyof RecoveryRegistrationEmailData> = [
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
  "categoriePermis",
  "dateObtentionCategorie",
];

function getField(formData: FormData, key: keyof RecoveryRegistrationEmailData): string {
  return ((formData.get(key) as string) ?? "").trim();
}

export async function submitRecoveryRegistration(
  _prevState: RecoveryRegistrationState,
  formData: FormData,
): Promise<RecoveryRegistrationState> {
  const data = Object.fromEntries(
    REQUIRED_FIELDS.map((field) => [field, getField(formData, field)]),
  ) as RecoveryRegistrationEmailData;
  const consentement = formData.get("consentement");

  if (REQUIRED_FIELDS.some((field) => !data[field])) {
    return {
      success: false,
      message: "Veuillez remplir tous les champs obligatoires avant de passer au paiement.",
    };
  }

  if (!consentement) {
    return {
      success: false,
      message:
        "Veuillez accepter l'utilisation de ces informations pour préparer votre inscription.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      message: "Veuillez entrer une adresse email valide.",
    };
  }

  try {
    await sendRecoveryRegistrationEmail(data);
    return {
      success: true,
      message: "Informations envoyées. Redirection vers le paiement sécurisé...",
    };
  } catch {
    return {
      success: false,
      message:
        "Une erreur est survenue. Veuillez réessayer ou nous appeler directement au 01 45 09 09 35.",
    };
  }
}
