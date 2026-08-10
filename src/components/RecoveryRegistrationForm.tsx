"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  FileArrowUp,
  Info,
  SpinnerGap,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import {
  finalizeRecoveryRegistration,
  submitRecoveryRegistration,
  type RecoveryRegistrationState,
} from "@/app/recuperation-de-points/action";
import {
  RECOVERY_DOCUMENT_ACCEPT,
  RECOVERY_DOCUMENT_MAX_BYTES,
  RECOVERY_DOCUMENTS,
  type RecoveryDocumentKind,
} from "@/lib/recovery-documents";
import {
  formatRecoveryDateRange,
  type RecoverySession,
} from "@/lib/recovery-dates";

interface RecoveryRegistrationFormProps {
  recoveryDates: RecoverySession[];
  initialSelectedSession?: string;
}

type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

const inputClass =
  "w-full rounded-none border-0 border-b-2 border-zinc-300 bg-transparent px-0 py-3 text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950";
const labelClass = "text-xs font-bold uppercase tracking-widest text-zinc-950";
const allowedFileExtension = /\.(?:jpe?g|png|pdf|heic|heif)$/i;

function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={inputClass}
      />
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1_024 * 1_024) {
    return `${Math.max(1, Math.round(bytes / 1_024))} Ko`;
  }

  return `${(bytes / (1_024 * 1_024)).toFixed(1).replace(".", ",")} Mo`;
}

function PermitNumberHelp({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="permit-help-title"
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-[#f7f7f2] shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-6 border-b border-zinc-200 bg-[#f7f7f2]/95 px-5 py-5 backdrop-blur sm:px-8">
          <div>
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#2E7D32]">
              Aide au remplissage
            </p>
            <h4
              id="permit-help-title"
              className="mt-2 text-2xl font-bold tracking-[-0.04em] text-zinc-950 sm:text-3xl"
            >
              Où trouver votre numéro de permis ?
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l’aide"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-300 bg-white text-zinc-700 transition-colors hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
          >
            <X size={19} />
          </button>
        </header>

        <div className="grid gap-px bg-zinc-200 lg:grid-cols-2">
          <article className="bg-white p-5 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-zinc-400">
                  Ancien modèle
                </span>
                <h5 className="mt-1 text-lg font-bold text-zinc-950">
                  Permis rose à trois volets
                </h5>
              </div>
              <span className="border border-[#4CAF50]/30 bg-[#edf8ed] px-3 py-1 font-mono text-[0.65rem] font-bold text-[#2E7D32]">
                REPÈRE 5
              </span>
            </div>
            <div className="mt-5 overflow-hidden border border-zinc-200 bg-[#f4d0d0]">
              <Image
                src="/images/permis/ancien-permis-recto.jpg"
                alt="Ancien permis français avec le numéro de permis identifié par le repère 5"
                width={1446}
                height={914}
                className="h-auto w-full"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Le numéro se trouve à côté de la photographie. Saisissez tous les
              caractères, sans espace ajouté.
            </p>
          </article>

          <article className="bg-white p-5 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-zinc-400">
                  Nouveau modèle
                </span>
                <h5 className="mt-1 text-lg font-bold text-zinc-950">
                  Permis au format carte
                </h5>
              </div>
              <span className="border border-[#4CAF50]/30 bg-[#edf8ed] px-3 py-1 font-mono text-[0.65rem] font-bold text-[#2E7D32]">
                AU VERSO
              </span>
            </div>
            <div className="relative mt-5 overflow-hidden border border-zinc-200 bg-[#f7eeee]">
              <Image
                src="/images/permis/nouveau-permis-verso.jpg"
                alt="Verso du nouveau permis français avec le numéro de dossier en haut à gauche"
                width={1600}
                height={1022}
                className="h-auto w-full"
              />
              <div className="pointer-events-none absolute left-[4.5%] top-[7%] h-[21%] w-[18%] border-2 border-[#178c35] bg-[#4CAF50]/10 shadow-[0_0_0_4px_rgba(255,255,255,.75)]">
                <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-2 border-white bg-[#178c35] shadow-lg" />
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Retournez la carte : le numéro de dossier apparaît en haut à
              gauche, généralement sur deux lignes à réunir sans espace.
            </p>
          </article>
        </div>

        <footer className="border-t border-zinc-200 bg-[#f7f7f2] px-5 py-4 text-xs leading-relaxed text-zinc-500 sm:px-8">
          Spécimens officiels de la Commission européenne — aucune donnée réelle
          de candidat n’est affichée.
        </footer>
      </section>
    </div>
  );
}

function DocumentField({
  kind,
  label,
  side,
  hint,
  file,
  status,
  disabled,
  onFileChange,
}: {
  kind: RecoveryDocumentKind;
  label: string;
  side: string;
  hint: string;
  file?: File;
  status: UploadStatus;
  disabled: boolean;
  onFileChange: (kind: RecoveryDocumentKind, file: File | undefined) => void;
}) {
  const inputId = `document-${kind}`;

  return (
    <div className="border border-zinc-200 bg-white p-4 transition-colors focus-within:border-zinc-950 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-zinc-950">{label}</p>
          <p className="mt-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[#2E7D32]">
            {side}
          </p>
        </div>
        {status === "uploaded" ? (
          <CheckCircle size={23} weight="fill" className="text-[#4CAF50]" />
        ) : status === "uploading" ? (
          <SpinnerGap size={23} className="animate-spin text-[#4CAF50]" />
        ) : (
          <FileArrowUp size={23} className="text-zinc-400" />
        )}
      </div>

      <p id={`${inputId}-hint`} className="mt-3 min-h-10 text-xs leading-relaxed text-zinc-500">
        {hint}
      </p>

      <input
        id={inputId}
        type="file"
        accept={RECOVERY_DOCUMENT_ACCEPT}
        required
        disabled={disabled}
        aria-describedby={`${inputId}-hint`}
        className="peer sr-only"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];

          if (
            selectedFile &&
            (selectedFile.size > RECOVERY_DOCUMENT_MAX_BYTES ||
              !allowedFileExtension.test(selectedFile.name))
          ) {
            event.target.setCustomValidity(
              selectedFile.size > RECOVERY_DOCUMENT_MAX_BYTES
                ? "Ce fichier dépasse la taille maximale de 8 Mo."
                : "Utilisez un fichier JPG, PNG, PDF, HEIC ou HEIF.",
            );
          } else {
            event.target.setCustomValidity("");
          }

          onFileChange(kind, selectedFile);
        }}
      />

      <label
        htmlFor={inputId}
        className="mt-4 flex min-h-12 cursor-pointer items-center justify-between gap-3 border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-[#4CAF50] hover:bg-[#f3faf3] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-950 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
      >
        <span className="min-w-0 truncate">
          {file ? file.name : "Choisir un fichier"}
        </span>
        <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-zinc-400">
          {file ? formatFileSize(file.size) : "8 Mo max."}
        </span>
      </label>

      {status === "error" ? (
        <p className="mt-2 text-xs font-medium text-red-600">Échec de l’envoi</p>
      ) : null}
    </div>
  );
}

export default function RecoveryRegistrationForm({
  recoveryDates,
  initialSelectedSession,
}: RecoveryRegistrationFormProps) {
  const [state, formAction, isPending] = useActionState<
    RecoveryRegistrationState,
    FormData
  >(submitRecoveryRegistration, null);
  const [selectedSession, setSelectedSession] = useState(
    initialSelectedSession ?? "",
  );
  const [selectedFiles, setSelectedFiles] = useState<
    Partial<Record<RecoveryDocumentKind, File>>
  >({});
  const [uploadStatuses, setUploadStatuses] = useState<
    Partial<Record<RecoveryDocumentKind, UploadStatus>>
  >({});
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const startedReference = useRef("");

  useEffect(() => {
    if (state?.status !== "upload" || startedReference.current === state.reference) {
      return;
    }

    startedReference.current = state.reference;

    const uploadDocuments = async () => {
      setIsUploading(true);
      setUploadError("");

      try {
        for (const target of state.uploads) {
          const file = selectedFiles[target.kind];

          if (!file) {
            throw new Error("Sélectionnez les quatre justificatifs demandés.");
          }

          setUploadStatuses((current) => ({
            ...current,
            [target.kind]: "uploading",
          }));

          const response = await fetch(target.uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
          });

          if (!response.ok) {
            setUploadStatuses((current) => ({
              ...current,
              [target.kind]: "error",
            }));
            throw new Error(
              "L’un des justificatifs n’a pas pu être envoyé. Vérifiez son format et sa taille.",
            );
          }

          setUploadStatuses((current) => ({
            ...current,
            [target.kind]: "uploaded",
          }));
        }

        const finalization = await finalizeRecoveryRegistration(state.reference);

        if (finalization.status === "error") {
          throw new Error(finalization.message);
        }

        window.location.assign(finalization.paymentUrl);
      } catch (error) {
        setUploadError(
          error instanceof Error
            ? error.message
            : "Impossible d’envoyer les justificatifs. Veuillez réessayer.",
        );
        setIsUploading(false);
      }
    };

    void uploadDocuments();
  }, [selectedFiles, state]);

  const isBusy = isPending || isUploading;
  const errorMessage =
    uploadError || (state?.status === "error" ? state.message : "");

  return (
    <section
      id="inscription-points"
      className="mt-16 scroll-mt-28 border border-zinc-200 bg-zinc-50 p-6 md:p-8 lg:p-10"
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow mb-2 block text-[0.7rem] text-[#4CAF50]">
            Inscription avant paiement
          </span>
          <h3 className="text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl">
            Votre dossier d’inscription
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base">
            Renseignez vos informations et ajoutez les quatre justificatifs. Le
            dossier est conservé de manière sécurisée et transmis à GP Formation
            uniquement après confirmation de votre paiement.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <CreditCard size={20} weight="duotone" className="text-[#4CAF50]" />
          Paiement sécurisé Stripe
        </div>
      </div>

      <form
        action={formAction}
        className="space-y-8"
        onSubmit={() => {
          setUploadError("");
          setUploadStatuses({});
        }}
      >
        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-3 border border-red-200 bg-red-50 p-4"
          >
            <WarningCircle
              size={22}
              weight="fill"
              className="mt-0.5 shrink-0 text-red-500"
            />
            <p className="text-sm leading-relaxed text-red-700">{errorMessage}</p>
          </div>
        ) : null}

        <div className="border border-[#4CAF50]/25 bg-white p-5 md:p-6">
          <label htmlFor="sessionStart" className={labelClass}>
            Session souhaitée
          </label>
          <select
            id="sessionStart"
            name="sessionStart"
            required
            disabled={isBusy}
            value={selectedSession}
            onChange={(event) => setSelectedSession(event.target.value)}
            className="mt-3 w-full border border-zinc-300 bg-white px-4 py-4 text-base font-semibold text-zinc-950 outline-none transition-colors focus:border-[#4CAF50] disabled:opacity-60"
          >
            <option value="">Choisir une session</option>
            {recoveryDates.map((session) => (
              <option key={session.start} value={session.start}>
                {formatRecoveryDateRange(session)}
              </option>
            ))}
          </select>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Le stage se déroule sur les deux journées indiquées. Vous pourrez
            modifier ce choix avant de continuer vers le paiement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
          />
          <Field
            id="telephone"
            label="Téléphone"
            type="tel"
            placeholder="06 12 34 56 78"
            autoComplete="tel"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field id="nom" label="Nom" autoComplete="family-name" />
          <Field id="prenoms" label="Prénom(s)" autoComplete="given-name" />
          <Field id="dateNaissance" label="Date de naissance" type="date" />
          <Field id="lieuNaissance" label="Lieu de naissance" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-3">
            <Field
              id="adresse"
              label="Adresse actuelle"
              autoComplete="street-address"
            />
          </div>
          <Field id="codePostal" label="Code postal" autoComplete="postal-code" />
          <div className="md:col-span-2">
            <Field id="ville" label="Ville" autoComplete="address-level2" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="numeroPermis" className={labelClass}>
              Numéro de permis
            </label>
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              aria-label="Afficher où trouver le numéro de permis"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#4CAF50]/40 bg-[#edf8ed] text-[#2E7D32] transition-colors hover:border-[#2E7D32] hover:bg-[#2E7D32] hover:text-white"
            >
              <Info size={16} weight="bold" />
            </button>
          </div>
          <input
            id="numeroPermis"
            name="numeroPermis"
            type="text"
            required
            className={inputClass}
          />
        </div>

        <section aria-labelledby="documents-title" className="border border-zinc-200 bg-[#f4f4ef] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#2E7D32]">
                Pièces justificatives
              </p>
              <h4 id="documents-title" className="mt-2 text-xl font-bold tracking-[-0.03em] text-zinc-950">
                Les quatre faces de votre dossier
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 sm:max-w-xs sm:text-right">
              JPG, PNG, PDF, HEIC ou HEIF — 8 Mo maximum par fichier
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {RECOVERY_DOCUMENTS.map((document) => (
              <DocumentField
                key={document.kind}
                {...document}
                file={selectedFiles[document.kind]}
                status={uploadStatuses[document.kind] ?? "idle"}
                disabled={isBusy}
                onFileChange={(kind, file) => {
                  setSelectedFiles((current) => ({ ...current, [kind]: file }));
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex items-start gap-3 border-l-2 border-[#4CAF50] bg-white px-4 py-3 text-xs leading-relaxed text-zinc-600">
            <Info size={17} className="mt-0.5 shrink-0 text-[#2E7D32]" />
            Les fichiers sont chiffrés sur le VPS. Ils ne sont jamais joints aux
            e-mails et ne deviennent visibles dans l’administration qu’après le
            paiement validé.
          </div>
        </section>

        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            id="consentement"
            name="consentement"
            required
            disabled={isBusy}
            className="mt-1 h-5 w-5 cursor-pointer accent-zinc-950 disabled:cursor-not-allowed"
          />
          <label
            htmlFor="consentement"
            className="cursor-pointer select-none text-sm leading-snug text-zinc-600"
          >
            J&apos;accepte que ces informations et justificatifs soient transmis à
            GP Formation après validation de mon paiement afin de préparer mon
            inscription au stage de récupération de points.
          </label>
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="group flex w-full items-center justify-between bg-zinc-950 px-6 py-5 font-bold uppercase tracking-wide text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>
            {isUploading
              ? "Envoi sécurisé des justificatifs..."
              : isPending
                ? "Sécurisation de l’inscription..."
                : "Continuer vers le paiement"}
          </span>
          {isBusy ? (
            <SpinnerGap size={20} className="animate-spin" />
          ) : (
            <ArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          )}
        </button>
      </form>

      {isHelpOpen ? <PermitNumberHelp onClose={() => setIsHelpOpen(false)} /> : null}
    </section>
  );
}
