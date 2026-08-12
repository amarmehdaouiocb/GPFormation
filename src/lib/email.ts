import { Resend } from "resend";
import { formatRecoveryDateRange } from "@/lib/recovery-dates";
import {
  getIdentityDocumentLabel,
  getRequiredRecoveryDocuments,
} from "@/lib/recovery-documents";
import type { RecoveryRegistrationData } from "@/lib/recovery-registration";

let resendClient: Resend | undefined;

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required to send emails");
  }

  resendClient ??= new Resend(apiKey);
  return resendClient;
}

type ContactEmailData = {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  message: string;
};

interface RecoveryPaymentDetails {
  stripePaymentId: string;
  amountTotal: number | null;
  currency: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildContactEmailHtml(data: ContactEmailData): string {
  const now = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fullName = `${data.prenom} ${data.nom}`.trim();

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background-color:#F4F4F5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr><td style="background-color:#18181B;padding:28px 32px;border-radius:12px 12px 0 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                GP Formation
              </td>
              <td align="right" style="color:rgba(255,255,255,0.7);font-size:13px;">
                Nouveau contact
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ACCENT BAR -->
        <tr><td style="height:3px;background-color:#4CAF50;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- BODY -->
        <tr><td style="background-color:#ffffff;padding:32px;">

          <p style="margin:0 0 24px;color:#18181B;font-size:18px;font-weight:600;">
            Demande de contact depuis le site web
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F8F1;border-radius:8px;border-left:4px solid #4CAF50;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#71717A;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;width:110px;vertical-align:top;">Nom</td>
                  <td style="padding:6px 0;color:#1F2937;font-size:15px;font-weight:600;">${escapeHtml(fullName)}</td>
                </tr>
                <tr><td colspan="2" style="height:1px;background-color:#DCEFDC;font-size:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:6px 0;color:#71717A;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;vertical-align:top;">Email</td>
                  <td style="padding:6px 0;">
                    <a href="mailto:${escapeHtml(data.email)}" style="color:#2E7D32;font-size:15px;text-decoration:none;">${escapeHtml(data.email)}</a>
                  </td>
                </tr>
                <tr><td colspan="2" style="height:1px;background-color:#DCEFDC;font-size:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:6px 0;color:#71717A;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;vertical-align:top;">Téléphone</td>
                  <td style="padding:6px 0;color:#1F2937;font-size:15px;">${escapeHtml(data.telephone)}</td>
                </tr>
              </table>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;color:#71717A;font-size:13px;text-transform:uppercase;letter-spacing:0.8px;">Message</p>

          <div style="background-color:#FAFAFA;border:1px solid #E4E4E7;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">
              ${escapeHtml(data.message).replace(/\n/g, "<br />")}
            </p>
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="mailto:${escapeHtml(data.email)}" style="display:inline-block;background-color:#18181B;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:6px;">
                Répondre à ${escapeHtml(data.prenom)}
              </a>
            </td></tr>
          </table>

        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background-color:#FAFAFA;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #E4E4E7;">
          <p style="margin:0;color:#A1A1AA;font-size:12px;text-align:center;">
            Envoyé le ${now} via le formulaire de contact &mdash; gpformation.fr
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function formatPaymentAmount(payment: RecoveryPaymentDetails): string {
  if (payment.amountTotal === null || !payment.currency) {
    return "Paiement validé";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: payment.currency.toUpperCase(),
  }).format(payment.amountTotal / 100);
}

function buildRecoveryRegistrationEmailHtml(
  data: RecoveryRegistrationData,
  payment: RecoveryPaymentDetails,
): string {
  const now = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const requiredDocumentCount = getRequiredRecoveryDocuments(
    data.typePieceIdentite,
  ).length;
  const rows = [
    ["Session choisie", formatRecoveryDateRange(data.session)],
    ["Paiement Stripe", formatPaymentAmount(payment)],
    ["Référence Stripe", payment.stripePaymentId],
    ["Email", data.email],
    ["Téléphone", data.telephone],
    ["Nom", data.nom],
    ["Prénom(s)", data.prenoms],
    ["Date de naissance", data.dateNaissance],
    ["Lieu de naissance", data.lieuNaissance],
    ["Adresse actuelle", data.adresse],
    ["Code postal", data.codePostal],
    ["Ville", data.ville],
    ["Numéro de permis", data.numeroPermis],
    ["Pièce d’identité", getIdentityDocumentLabel(data.typePieceIdentite)],
    [
      "Pièces justificatives",
      `${requiredDocumentCount} fichiers disponibles dans l’espace administrateur`,
    ],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
                <tr>
                  <td style="padding:9px 0;color:#71717A;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;width:220px;vertical-align:top;">${escapeHtml(label)}</td>
                  <td style="padding:9px 0;color:#18181B;font-size:15px;font-weight:600;">${escapeHtml(value)}</td>
                </tr>
                <tr><td colspan="2" style="height:1px;background-color:#E4E4E7;font-size:0;">&nbsp;</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background-color:#F4F4F5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="680" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;">
        <tr><td style="background-color:#18181B;padding:28px 32px;border-radius:12px 12px 0 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">GP Formation</td>
              <td align="right" style="color:rgba(255,255,255,0.7);font-size:13px;">Stage récupération de points</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="height:3px;background-color:#4CAF50;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="background-color:#ffffff;padding:32px;">
          <p style="margin:0 0 8px;color:#18181B;font-size:20px;font-weight:700;">
            Paiement validé — nouvelle inscription
          </p>
          <p style="margin:0 0 24px;color:#71717A;font-size:14px;line-height:1.6;">
            Stripe a confirmé le paiement. Voici les informations d'inscription saisies par le candidat pour la session sélectionnée.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAFA;border:1px solid #E4E4E7;border-radius:8px;padding:0 20px;">
            ${rowsHtml}
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
            <tr><td align="center">
              <a href="mailto:${escapeHtml(data.email)}" style="display:inline-block;background-color:#18181B;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:6px;">
                Contacter le candidat
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background-color:#FAFAFA;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #E4E4E7;">
          <p style="margin:0;color:#A1A1AA;font-size:12px;text-align:center;">
            Envoyé le ${now} via le formulaire d'inscription récupération de points - gpformation.fr
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendContactEmail(data: ContactEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set, logging email:", data);
    return;
  }

  await getResendClient().emails.send({
    from: "GP Formation <noreply@gpformation.fr>",
    to: "contact@gpformation.fr",
    replyTo: data.email,
    subject: `Nouveau contact : ${data.prenom} ${data.nom}`.trim(),
    html: buildContactEmailHtml(data),
  });
}

export async function sendRecoveryRegistrationEmail(
  data: RecoveryRegistrationData,
  payment: RecoveryPaymentDetails,
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required for paid recovery registrations");
  }

  const { error } = await getResendClient().emails.send(
    {
      from: "GP Formation <noreply@gpformation.fr>",
      to: "contact@gpformation.fr",
      replyTo: data.email,
      subject: `Paiement validé — stage récupération de points : ${data.prenoms} ${data.nom}`.trim(),
      html: buildRecoveryRegistrationEmailHtml(data, payment),
    },
    {
      idempotencyKey: `recovery-payment/${payment.stripePaymentId}`,
    },
  );

  if (error) {
    throw new Error(`Resend failed to send the paid registration email: ${error.message}`);
  }
}
