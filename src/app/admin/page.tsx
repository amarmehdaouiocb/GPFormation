import Image from "next/image";
import {
  ArrowSquareOut,
  CalendarBlank,
  CheckCircle,
  ClockCounterClockwise,
  EnvelopeSimple,
  IdentificationCard,
  MapPin,
  Phone,
  SignOut,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { logoutAdmin } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin-auth";
import { formatRecoveryDateRange } from "@/lib/recovery-dates";
import {
  getPaidRecoveryRegistrations,
  type PaidRecoveryRegistration,
} from "@/lib/recovery-registration";

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

function StudentCard({
  registration,
  index,
}: {
  registration: PaidRecoveryRegistration;
  index: number;
}) {
  const { data } = registration;
  const initials = `${data.prenoms.charAt(0)}${data.nom.charAt(0)}`.toUpperCase();

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
              <div>
                <dt className="text-xs text-zinc-500">Autorité de délivrance</dt>
                <dd className="mt-1 font-medium">{data.autoriteDelivrance}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-zinc-500">Délivré le</dt>
                  <dd className="mt-1 font-medium">
                    {formatDate(data.dateDelivranceTitre)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Valable jusqu’au</dt>
                  <dd className="mt-1 font-medium">
                    {formatDate(data.dateExpirationTitre)}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Date d’obtention</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(data.dateObtentionCategorie)}
                </dd>
              </div>
            </dl>
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

export default async function AdminPage() {
  await requireAdminSession();

  let registrations: PaidRecoveryRegistration[] = [];
  let loadError = false;

  try {
    registrations = await getPaidRecoveryRegistrations();
  } catch (error) {
    console.error("Unable to load paid recovery registrations", error);
    loadError = true;
  }

  const sessionCount = new Set(
    registrations.map((registration) => registration.data.session.start),
  ).size;
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
              Inscriptions payées
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
              Seuls les élèves dont le paiement Stripe a été confirmé apparaissent
              dans cette liste.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-[#4CAF50] shadow-[0_0_12px_rgba(76,175,80,.6)]" />
            Données synchronisées avec le VPS
          </div>
        </div>

        <section className="mt-10 grid gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
          <div className="bg-white p-5 sm:p-6">
            <UsersThree size={24} className="text-[#4CAF50]" />
            <p className="mt-5 text-3xl font-bold tracking-[-0.04em]">
              {registrations.length}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Élèves inscrits et payés</p>
          </div>
          <div className="bg-white p-5 sm:p-6">
            <CalendarBlank size={24} className="text-[#4CAF50]" />
            <p className="mt-5 text-3xl font-bold tracking-[-0.04em]">
              {sessionCount}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Sessions représentées</p>
          </div>
          <div className="bg-white p-5 sm:p-6">
            <ClockCounterClockwise size={24} className="text-[#4CAF50]" />
            <p className="mt-5 text-base font-bold tracking-[-0.02em] sm:text-lg">
              {latestPayment ? formatDateTime(latestPayment) : "—"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Dernier paiement reçu</p>
          </div>
        </section>

        <section className="mt-10">
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
      </div>
    </main>
  );
}
