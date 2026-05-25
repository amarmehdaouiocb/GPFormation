"use server";

import { sendContactEmail } from "@/lib/email";

export type ContactState = {
  success: boolean;
  message: string;
} | null;

export async function submitContact(
  prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const prenom = (formData.get("prenom") as string)?.trim();
  const nom = (formData.get("nom") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const consentement = formData.get("consentement");

  if (!prenom || !nom || !telephone || !email || !message) {
    return {
      success: false,
      message: "Veuillez remplir tous les champs obligatoires.",
    };
  }

  if (!consentement) {
    return {
      success: false,
      message:
        "Veuillez accepter le traitement de vos informations pour envoyer votre message.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: "Veuillez entrer une adresse email valide.",
    };
  }

  try {
    await sendContactEmail({ prenom, nom, telephone, email, message });
    return {
      success: true,
      message:
        "Votre message a bien été envoyé. Nous vous recontacterons rapidement.",
    };
  } catch {
    return {
      success: false,
      message:
        "Une erreur est survenue. Veuillez réessayer ou nous appeler directement au 01 45 09 09 35.",
    };
  }
}
