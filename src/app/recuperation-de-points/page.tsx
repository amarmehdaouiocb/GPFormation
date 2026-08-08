import { getMarkdownContent } from "@/lib/markdown";
import { getUpcomingRecoverySessions } from "@/lib/recovery-dates";
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
  const recoveryDates = getUpcomingRecoverySessions();
  const requestedSession = (await searchParams).session;
  const selectedRecoverySession =
    typeof requestedSession === "string" &&
    recoveryDates.some((session) => session.start === requestedSession)
      ? requestedSession
      : undefined;
  const breadcrumbs = [
    { label: "Stage de Récupération de points", href: "#" }
  ];
  return <FormationDetailTemplate title="Stage de Récupération de points" content={content} breadcrumbs={breadcrumbs} duration="14 heures (2 jours)" location="Aulnay-sous-Bois" certification="Attestation de suivi" tag="PERMIS" stripePaymentLink={process.env.NEXT_PUBLIC_STRIPE_RECOVERY_LINK} financementVariant="points" recoveryDates={recoveryDates} selectedRecoverySession={selectedRecoverySession} />;
}
