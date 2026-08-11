export const IDENTITY_DOCUMENT_TYPES = [
  {
    value: "carte_identite",
    label: "Carte d’identité",
    description: "Recto et verso",
  },
  {
    value: "passeport",
    label: "Passeport",
    description: "Page avec photo uniquement",
  },
  {
    value: "titre_sejour",
    label: "Titre de séjour",
    description: "Recto et verso",
  },
] as const;

export type IdentityDocumentType =
  (typeof IDENTITY_DOCUMENT_TYPES)[number]["value"];

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
    hint: "Face avec votre photographie et vos informations personnelles",
  },
  {
    kind: "identite_verso",
    label: "Pièce d’identité",
    side: "Verso",
    hint: "Face opposée du document présenté",
  },
] as const;

export type RecoveryDocumentKind = (typeof RECOVERY_DOCUMENTS)[number]["kind"];
export type RecoveryDocumentDefinition = {
  kind: RecoveryDocumentKind;
  label: string;
  side: string;
  hint: string;
};

export const RECOVERY_DOCUMENT_ACCEPT = ".jpg,.jpeg,.png,.pdf,.heic,.heif";
export const RECOVERY_DOCUMENT_MAX_BYTES = 8 * 1024 * 1024;

export function isIdentityDocumentType(
  value: string,
): value is IdentityDocumentType {
  return IDENTITY_DOCUMENT_TYPES.some((type) => type.value === value);
}

export function getIdentityDocumentLabel(type: IdentityDocumentType): string {
  return (
    IDENTITY_DOCUMENT_TYPES.find((documentType) => documentType.value === type)
      ?.label ?? "Pièce d’identité"
  );
}

export function getRequiredRecoveryDocuments(
  identityDocumentType: IdentityDocumentType,
): RecoveryDocumentDefinition[] {
  const permitDocuments = RECOVERY_DOCUMENTS.slice(0, 2);
  const identityFront = RECOVERY_DOCUMENTS[2];
  const identityBack = RECOVERY_DOCUMENTS[3];
  const identityLabel = getIdentityDocumentLabel(identityDocumentType);

  if (identityDocumentType === "passeport") {
    return [
      ...permitDocuments,
      {
        ...identityFront,
        label: identityLabel,
        side: "Page d’identité",
        hint: "Page avec votre photographie et vos informations personnelles",
      },
    ];
  }

  return [
    ...permitDocuments,
    { ...identityFront, label: identityLabel },
    { ...identityBack, label: identityLabel },
  ];
}

export function isRecoveryDocumentKind(
  value: string,
): value is RecoveryDocumentKind {
  return RECOVERY_DOCUMENTS.some((document) => document.kind === value);
}
