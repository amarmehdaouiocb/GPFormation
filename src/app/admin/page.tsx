import Image from "next/image";
import {
  ArrowSquareOut,
  CalendarBlank,
  CheckCircle,
  ClockCounterClockwise,
  CreditCard,
  EnvelopeSimple,
  FileText,
  IdentificationCard,
  MapPin,
  PencilSimple,
  Phone,
  Plus,
  SignOut,
  Trash,
  UsersThree,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import {
  approveRecoveryPayment,
  createAdminRecoverySession,
  deleteAdminRecoverySession,
  logoutAdmin,
  rejectRecoveryPayment,
  updateAdminRecoverySession,
} from "@/app/admin/actions";
import AdminDocumentDownloadButton from "@/components/AdminDocumentDownloadButton";
import { requireAdminSession } from "@/lib/admin-auth";
import { formatRecoveryDateRange } from "@/lib/recovery-dates";
import {
  getIdentityDocumentLabel,
  getRequiredRecoveryDocuments,
} from "@/lib/recovery-documents";
import {
  getAllRecoverySessions,
  getPendingRecoveryRegistrations,
  getPaidRecoveryRegistrations,
  type PaidRecoveryRegistration,
  type PendingRecoveryRegistration,
} from "@/lib/recovery-registration";
import type { RecoverySession } from "@/lib/recovery-dates";

export const dynamic = "force-dynamic";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeZone: "Europe/Paris",
});

function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T12:00:00Z`));
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} Ko`;
  }

  return `${(sizeBytes / (1024 * 1024)).toLocaleString("fr-FR", {
    maximumFractionDigits: 1,
  })} Mo`;
}

function StudentCard({
  registration,
  index,
}: {
  registration: PaidRecoveryRegistration;
  index: number;
}) {
  const { data } = registration;
  const initials = `${data.prenoms.charAt(0)}${data.nom.charAt(0)}`.toUpperCase();
  const requiredDocuments = getRequiredRecoveryDocuments(
    data.typePieceIdentite,
  );

  return (
    <article className="border border-zinc-200 bg-white shadow-[0_16px_50px_rgba(24,24,27,0.035)]">
      <div className="grid gap-6 p-5 md:grid-cols-[64px_minmax(200px,1.2fr)_minmax(220px,1fr)_minmax(190px,0.8fr)] md:items-center md:p-6">
        <div className="flex items-center gap-4 md:block">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold tracking-[0.08em] text-white">
            {initials}
          </div>
          <span className="font-mono text-[0.65rem] text-zinc-400 md:mt-3 md:block">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#2E7D32]">
            Élève inscrit
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-zinc-950">
            {data.prenoms} {data.nom}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
            <CalendarBlank size={17} className="text-[#4CAF50]" />
            {formatRecoveryDateRange(data.session)}
          </p>
        </div>

        <div className="space-y-2.5 text-sm">
          <a
            href={`mailto:${data.email}`}
            className="flex items-center gap-2.5 text-zinc-700 transition-colors hover:text-[#2E7D32]"
          >
            <EnvelopeSimple size={18} className="shrink-0 text-zinc-400" />
            <span className="truncate">{data.email}</span>
          </a>
          <a
            href={`tel:${data.telephone}`}
            className="flex items-center gap-2.5 text-zinc-700 transition-colors hover:text-[#2E7D32]"
          >
            <Phone size={18} className="shrink-0 text-zinc-400" />
            {data.telephone}
          </a>
        </div>

        <div className="md:text-right">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf8ed] px-3 py-1.5 text-xs font-bold text-[#2E7D32]">
            <CheckCircle size={16} weight="fill" />
            Paiement validé
          </span>
          <p className="mt-3 text-xs text-zinc-500">
            {formatDateTime(registration.paidAt)}
          </p>
        </div>
      </div>

      <details className="group border-t border-zinc-100">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 md:px-6">
          Voir le dossier complet
          <ArrowSquareOut
            size={17}
            className="transition-transform group-open:rotate-45"
          />
        </summary>

        <div className="grid gap-px border-t border-zinc-100 bg-zinc-200 md:grid-cols-3">
          <div className="bg-[#fafaf8] p-5 md:p-6">
            <IdentificationCard size={22} className="text-[#4CAF50]" />
            <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.08em]">
              Identité
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-zinc-500">Date de naissance</dt>
                <dd className="mt-1 font-medium">{formatDate(data.dateNaissance)}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Lieu de naissance</dt>
                <dd className="mt-1 font-medium">{data.lieuNaissance}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Pièce d’identité</dt>
                <dd className="mt-1 font-medium">
                  {getIdentityDocumentLabel(data.typePieceIdentite)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-[#fafaf8] p-5 md:p-6">
            <MapPin size={22} className="text-[#4CAF50]" />
            <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.08em]">
              Adresse
            </h3>
            <address className="mt-4 text-sm not-italic leading-relaxed text-zinc-700">
              {data.adresse}
              <br />
              {data.codePostal} {data.ville}
            </address>
          </div>

          <div className="bg-[#fafaf8] p-5 md:p-6">
            <IdentificationCard size={22} className="text-[#4CAF50]" />
            <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.08em]">
              Permis de conduire
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-zinc-500">Numéro</dt>
                <dd className="mt-1 font-mono text-xs font-semibold">
                  {data.numeroPermis}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="border-t border-zinc-200 bg-[#fafaf8] p-5 md:p-6">
          <div className="flex items-start gap-3">
            <FileText size={22} className="shrink-0 text-[#4CAF50]" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.08em]">
                Pièces justificatives
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Fichiers chiffrés sur le VPS, accessibles uniquement depuis cet espace.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {requiredDocuments.map((document) => {
              const uploadedDocument = registration.documents.find(
                ({ kind }) => kind === document.kind,
              );

              return uploadedDocument ? (
                <AdminDocumentDownloadButton
                  key={document.kind}
                  reference={registration.reference}
                  kind={document.kind}
                  label={`${document.label} — ${document.side}`}
                  detail={`Télécharger · ${formatFileSize(uploadedDocument.sizeBytes)}`}
                />
              ) : (
                <div
                  key={document.kind}
                  className="border border-dashed border-zinc-300 bg-white px-4 py-3"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
                    {document.label} — {document.side}
                  </p>
                  <p className="mt-1 font-mono text-[0.6rem] text-red-600">
                    Fichier indisponible
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-200 bg-zinc-950 px-5 py-4 font-mono text-[0.62rem] text-zinc-500 md:flex-row md:items-center md:justify-between md:px-6">
          <span>Référence : {registration.reference}</span>
          <span>Dossier créé le {formatDateTime(registration.createdAt)}</span>
        </div>
      </details>
    </article>
  );
}

function PendingRegistrationCard({
  registration,
}: {
  registration: PendingRecoveryRegistration;
}) {
  const { data } = registration;
  const requiredDocuments = getRequiredRecoveryDocuments(
    data.typePieceIdentite,
  );
  const amount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: registration.currency.toUpperCase(),
  }).format(registration.amount / 100);

  return (
    <article className="border border-amber-200 bg-white shadow-[0_16px_50px_rgba(24,24,27,0.035)]">
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(220px,1.2fr)_minmax(220px,1fr)_auto] lg:items-center lg:p-6">
        <div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-amber-700">
            Autorisation bancaire reçue
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-zinc-950">
            {data.prenoms} {data.nom}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
            <CalendarBlank size={17} className="text-[#4CAF50]" />
            {formatRecoveryDateRange(data.session)}
          </p>
        </div>

        <div className="space-y-2 text-sm text-zinc-600">
          <p>{data.email}</p>
          <p>{data.telephone}</p>
          <p className="font-semibold text-zinc-950">Montant autorisé : {amount}</p>
          <p className="text-xs text-zinc-500">
            Reçue le {formatDateTime(registration.authorizedAt)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <form action={approveRecoveryPayment}>
            <input type="hidden" name="reference" value={registration.reference} />
            <input
              type="hidden"
              name="paymentIntentId"
              value={registration.paymentIntentId}
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 bg-[#2E7D32] px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#246428]"
            >
              <CheckCircle size={17} weight="fill" />
              Valider et encaisser
            </button>
          </form>
          <form action={rejectRecoveryPayment}>
            <input type="hidden" name="reference" value={registration.reference} />
            <input
              type="hidden"
              name="paymentIntentId"
              value={registration.paymentIntentId}
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 border border-zinc-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle size={17} />
              Refuser
            </button>
          </form>
        </div>
      </div>

      <details className="group border-t border-zinc-100">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 hover:bg-zinc-50 lg:px-6">
          Vérifier le dossier avant validation
          <ArrowSquareOut
            size={17}
            className="transition-transform group-open:rotate-45"
          />
        </summary>
        <div className="grid gap-px border-t border-zinc-100 bg-zinc-200 md:grid-cols-3">
          <div className="bg-[#fafaf8] p-5">
            <p className="text-xs text-zinc-500">Naissance</p>
            <p className="mt-1 text-sm font-semibold">
              {formatDate(data.dateNaissance)} · {data.lieuNaissance}
            </p>
          </div>
          <div className="bg-[#fafaf8] p-5">
            <p className="text-xs text-zinc-500">Adresse</p>
            <p className="mt-1 text-sm font-semibold">
              {data.adresse}, {data.codePostal} {data.ville}
            </p>
          </div>
          <div className="bg-[#fafaf8] p-5">
            <p className="text-xs text-zinc-500">Permis</p>
            <p className="mt-1 font-mono text-sm font-semibold">
              {data.numeroPermis}
            </p>
          </div>
        </div>
        <div className="grid gap-3 border-t border-zinc-200 bg-[#fafaf8] p-5 sm:grid-cols-2 xl:grid-cols-4 lg:p-6">
          {requiredDocuments.map((document) => {
            const uploadedDocument = registration.documents.find(
              ({ kind }) => kind === document.kind,
            );

            return uploadedDocument ? (
              <AdminDocumentDownloadButton
                key={document.kind}
                reference={registration.reference}
                kind={document.kind}
                label={`${document.label} — ${document.side}`}
                detail={`Télécharger · ${formatFileSize(uploadedDocument.sizeBytes)}`}
              />
            ) : (
              <div
                key={document.kind}
                className="border border-dashed border-red-200 bg-white px-4 py-3 text-xs text-red-600"
              >
                {document.label} indisponible
              </div>
            );
          })}
        </div>
      </details>
    </article>
  );
}

type AdminNotice = {
  type?: string;
  message?: string;
  area?: string;
};

function SessionManager({
  sessions,
  notice,
}: {
  sessions: RecoverySession[];
  notice: AdminNotice;
}) {
  const activeSessions = sessions.filter((session) => !session.deletedAt);
  const archivedSessions = sessions.filter((session) => session.deletedAt);
  const inputClass =
    "h-11 w-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-[#4CAF50]";

  return (
    <section id="sessions" className="mt-16 scroll-mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#2E7D32]">
            Calendrier public
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-zinc-950">
            Sessions et capacités
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-relaxed text-zinc-500">
          Les cinq prochaines sessions ouvertes et non complètes sont affichées
          automatiquement sur le site.
        </p>
      </div>

      <form
        action={createAdminRecoverySession}
        className="mt-6 grid gap-3 border border-[#4CAF50]/25 bg-[#f4faf4] p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_130px_150px_auto] lg:items-end"
      >
        <label className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
          Début
          <input type="date" name="start" required className={`mt-2 ${inputClass}`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
          Fin
          <input type="date" name="end" required className={`mt-2 ${inputClass}`} />
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
          Capacité
          <input
            type="number"
            name="capacity"
            min="1"
            max="100"
            defaultValue="20"
            required
            className={`mt-2 ${inputClass}`}
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-600">
          État
          <select name="status" defaultValue="open" className={`mt-2 ${inputClass}`}>
            <option value="open">Ouverte</option>
            <option value="closed">Fermée</option>
          </select>
        </label>
        <button
          type="submit"
          className="flex h-11 items-center justify-center gap-2 bg-zinc-950 px-5 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-zinc-800"
        >
          <Plus size={17} /> Ajouter
        </button>
      </form>

      {notice.area === "sessions" && notice.message ? (
        <div
          role="status"
          className={`mt-4 border px-5 py-4 text-sm font-medium ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#4CAF50]/30 bg-[#edf8ed] text-[#2E7D32]"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {activeSessions.map((session) => {
          const formId = `session-${session.start}`;
          const paidCount = session.paidCount ?? 0;
          const pendingCount = session.pendingCount ?? 0;
          const capacity = session.capacity ?? 20;

          return (
            <article
              key={session.start}
              className="border border-zinc-200 bg-white shadow-[0_12px_35px_rgba(24,24,27,0.025)]"
            >
              <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-zinc-900">
                  {formatRecoveryDateRange(session)}
                </p>
                <span
                  className={`w-fit px-2.5 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] ${
                    session.status === "closed"
                      ? "bg-zinc-100 text-zinc-600"
                      : "bg-[#edf8ed] text-[#2E7D32]"
                  }`}
                >
                  {session.status === "closed" ? "Fermée" : "Ouverte"}
                </span>
              </div>

              <form
                id={formId}
                action={updateAdminRecoverySession.bind(null, session.start)}
                className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_120px_150px] lg:items-end"
              >
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
                  Début
                  <input
                    type="date"
                    name="start"
                    defaultValue={session.start}
                    required
                    className={`mt-2 ${inputClass}`}
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
                  Fin
                  <input
                    type="date"
                    name="end"
                    defaultValue={session.end}
                    required
                    className={`mt-2 ${inputClass}`}
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
                  Capacité
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    max="100"
                    defaultValue={capacity}
                    required
                    className={`mt-2 ${inputClass}`}
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
                  État
                  <select
                    name="status"
                    defaultValue={session.status ?? "open"}
                    className={`mt-2 ${inputClass}`}
                  >
                    <option value="open">Ouverte</option>
                    <option value="closed">Fermée</option>
                  </select>
                </label>
              </form>

              <div className="flex flex-col gap-4 border-t border-zinc-100 bg-zinc-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid w-full grid-cols-2 gap-px border border-zinc-200 bg-zinc-200 sm:w-auto sm:min-w-[300px]">
                  <div className="min-w-0 bg-white px-4 py-3">
                    <strong className="block text-lg leading-none text-zinc-950">
                      {paidCount}/{capacity}
                    </strong>
                    <span className="mt-1.5 block text-xs leading-snug text-zinc-500">
                      places confirmées
                    </span>
                  </div>
                  <div className="min-w-0 bg-white px-4 py-3">
                    <strong className="block text-lg leading-none text-zinc-950">
                      {pendingCount}
                    </strong>
                    <span className="mt-1.5 block text-xs leading-snug text-zinc-500">
                      demande{pendingCount > 1 ? "s" : ""} en attente
                    </span>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <button
                    form={formId}
                    type="submit"
                    className="flex min-h-11 items-center justify-center gap-2 bg-zinc-950 px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-zinc-800"
                  >
                    <PencilSimple size={17} /> Enregistrer
                  </button>
                  <form action={deleteAdminRecoverySession.bind(null, session.start)}>
                    <button
                      type="submit"
                      className="flex min-h-11 w-full items-center justify-center gap-2 border border-red-200 bg-white px-5 text-xs font-bold uppercase tracking-[0.08em] text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash size={17} /> Supprimer
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {archivedSessions.length > 0 ? (
        <details className="mt-4 border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
          <summary className="cursor-pointer font-semibold text-zinc-700">
            {archivedSessions.length} session
            {archivedSessions.length > 1 ? "s" : ""} supprimée
            {archivedSessions.length > 1 ? "s" : ""}
          </summary>
          <ul className="mt-3 space-y-1 font-mono text-xs">
            {archivedSessions.map((session) => (
              <li key={session.start}>{formatRecoveryDateRange(session)}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

interface AdminPageProps {
  searchParams: Promise<AdminNotice>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdminSession();

  let registrations: PaidRecoveryRegistration[] = [];
  let pendingRegistrations: PendingRecoveryRegistration[] = [];
  let sessions: RecoverySession[] = [];
  let loadError = false;

  try {
    [registrations, pendingRegistrations, sessions] = await Promise.all([
      getPaidRecoveryRegistrations(),
      getPendingRecoveryRegistrations(),
      getAllRecoverySessions(),
    ]);
  } catch (error) {
    console.error("Unable to load recovery administration", error);
    loadError = true;
  }

  const notice = await searchParams;

  const latestPayment = registrations[0]?.paidAt;

  return (
    <main className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-5">
            <Image
              src="/logo_gpformation_clean.png"
              alt="Grand Paris Formation"
              width={320}
              height={90}
              priority
              className="h-auto w-44 object-contain object-left sm:w-52"
            />
            <div className="hidden h-10 w-px bg-zinc-200 sm:block" />
            <div className="hidden sm:block">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-zinc-400">
                Espace interne
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-800">
                Récupération de points
              </p>
            </div>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              aria-label="Se déconnecter"
              className="flex items-center gap-2 border border-zinc-200 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-zinc-700 transition-colors hover:border-zinc-950 hover:bg-zinc-950 hover:text-white sm:px-4"
            >
              <SignOut size={17} />
              <span className="hidden sm:inline">Se déconnecter</span>
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#2E7D32]">
              Administration / Stages
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.05em] text-zinc-950 sm:text-5xl lg:text-6xl">
              Pilotage des inscriptions
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
              Contrôlez les dossiers, confirmez les paiements et gérez les dates
              affichées sur le site depuis un seul espace.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-[#4CAF50] shadow-[0_0_12px_rgba(76,175,80,.6)]" />
            Données synchronisées avec le VPS
          </div>
        </div>

        {notice.message && notice.area !== "sessions" ? (
          <div
            role="status"
            className={`mt-8 border px-5 py-4 text-sm font-medium ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#4CAF50]/30 bg-[#edf8ed] text-[#2E7D32]"
            }`}
          >
            {notice.message}
          </div>
        ) : null}

        <section className="mt-10 grid gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
          <div className="bg-white p-5 sm:p-6">
            <UsersThree size={24} className="text-[#4CAF50]" />
            <p className="mt-5 text-3xl font-bold tracking-[-0.04em]">
              {pendingRegistrations.length}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Paiements à valider</p>
          </div>
          <div className="bg-white p-5 sm:p-6">
            <CalendarBlank size={24} className="text-[#4CAF50]" />
            <p className="mt-5 text-3xl font-bold tracking-[-0.04em]">
              {registrations.length}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Élèves inscrits et payés</p>
          </div>
          <div className="bg-white p-5 sm:p-6">
            <ClockCounterClockwise size={24} className="text-[#4CAF50]" />
            <p className="mt-5 text-base font-bold tracking-[-0.02em] sm:text-lg">
              {latestPayment ? formatDateTime(latestPayment) : "—"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Dernier paiement reçu</p>
          </div>
        </section>

        <section id="payments" className="mt-10 scroll-mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
                Paiements à valider
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                La carte du candidat est autorisée mais pas débitée. Vérifiez le
                dossier et la place disponible avant d’encaisser.
              </p>
            </div>
            <span className="font-mono text-[0.65rem] text-zinc-400">
              {pendingRegistrations.length} en attente
            </span>
          </div>

          {loadError ? (
            <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Impossible de charger les paiements en attente.
            </div>
          ) : pendingRegistrations.length === 0 ? (
            <div className="border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
              <CreditCard size={34} className="mx-auto text-zinc-300" />
              <p className="mt-4 text-sm font-semibold text-zinc-600">
                Aucun paiement en attente de validation
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map((registration) => (
                <PendingRegistrationCard
                  key={registration.reference}
                  registration={registration}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-16">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
              Liste des élèves
            </h2>
            <span className="font-mono text-[0.65rem] text-zinc-400">
              {registrations.length} dossier{registrations.length > 1 ? "s" : ""}
            </span>
          </div>

          {loadError ? (
            <div className="border border-red-200 bg-red-50 p-6 text-sm leading-relaxed text-red-700">
              Impossible de charger les inscriptions pour le moment. Réessayez dans
              quelques instants.
            </div>
          ) : registrations.length === 0 ? (
            <div className="border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
              <UsersThree size={36} className="mx-auto text-zinc-300" />
              <h3 className="mt-5 text-xl font-bold text-zinc-800">
                Aucun élève inscrit pour l’instant
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                Un dossier apparaîtra ici dès qu’un paiement Stripe aura été validé.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration, index) => (
                <StudentCard
                  key={registration.reference}
                  registration={registration}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        <SessionManager sessions={sessions} notice={notice} />
      </div>
    </main>
  );
}
