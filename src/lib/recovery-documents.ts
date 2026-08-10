export const RECOVERY_DOCUMENTS = [
  {
    kind: "permis_recto",
    label: "Permis de conduire",
    side: "Recto",
    hint: "Face avec votre identité ou votre photographie",
  },
  {
    kind: "permis_verso",
    label: "Permis de conduire",
    side: "Verso",
    hint: "Face opposée avec les catégories ou le numéro de dossier",
  },
  {
    kind: "identite_recto",
    label: "Pièce d’identité",
    side: "Recto",
    hint: "Carte d’identité, passeport ou titre de séjour",
  },
  {
    kind: "identite_verso",
    label: "Pièce d’identité",
    side: "Verso",
    hint: "Face opposée du document présenté",
  },
] as const;

export type RecoveryDocumentKind = (typeof RECOVERY_DOCUMENTS)[number]["kind"];

export const RECOVERY_DOCUMENT_ACCEPT = ".jpg,.jpeg,.png,.pdf,.heic,.heif";
export const RECOVERY_DOCUMENT_MAX_BYTES = 8 * 1024 * 1024;

export function isRecoveryDocumentKind(
  value: string,
): value is RecoveryDocumentKind {
  return RECOVERY_DOCUMENTS.some((document) => document.kind === value);
}
