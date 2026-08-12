import { getMarkdownContent } from "@/lib/markdown";
import type { RecoverySession } from "@/lib/recovery-dates";
import { getUpcomingRecoverySessions } from "@/lib/recovery-registration";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const dynamic = "force-dynamic";

export const metadata: import("next").Metadata = {
  title: "Stage de Récupération de Points du permis",
  description:
    "Stage de récupération de points (jusqu'à 4 points) : 14h sur 2 jours à Aulnay-sous-Bois. Sensibilisation à la sécurité routière animée par un psychologue et un expert BAFM.",
  alternates: { canonical: "/recuperation-de-points" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Stage de Récupération de Points du permis",
    description:
      "Récupérez jusqu'à 4 points : stage de 14h sur 2 jours à Aulnay-sous-Bois. Inscription en ligne.",
    url: "/recuperation-de-points",
  },
};

interface RecoveryPointsPageProps {
  searchParams: Promise<{ session?: string | string[] }>;
}

export default async function Page({ searchParams }: RecoveryPointsPageProps) {
  const { content } = getMarkdownContent("recuperation-de-points");
  let recoveryDates: RecoverySession[] = [];

  try {
    recoveryDates = await getUpcomingRecoverySessions();
  } catch (error) {
    console.error("Unable to load public recovery sessions", error);
  }
  const requestedSession = (await searchParams).session;
  const selectedRecoverySession =
    typeof requestedSession === "string" &&
    recoveryDates.some((session) => session.start === requestedSession)
      ? requestedSession
      : undefined;
  const breadcrumbs = [
    { label: "Stage de Récupération de points", href: "#" }
  ];
  const recoveryPaymentEnabled = Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  return <FormationDetailTemplate title="Stage de Récupération de points" content={content} breadcrumbs={breadcrumbs} duration="14 heures (2 jours)" location="Aulnay-sous-Bois" certification="Attestation de suivi" tag="PERMIS" financementVariant="points" recoveryDates={recoveryDates} selectedRecoverySession={selectedRecoverySession} recoveryPaymentEnabled={recoveryPaymentEnabled} />;
}
