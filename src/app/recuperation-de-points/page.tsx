import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("recuperation-de-points");
  const breadcrumbs = [
    { label: "Stage de Récupération de points", href: "#" }
  ];
  return <FormationDetailTemplate title="Stage de Récupération de points" content={content} breadcrumbs={breadcrumbs} duration="14 heures (2 jours)" location="Aulnay-sous-Bois" certification="Attestation de suivi" tag="PERMIS" stripePaymentLink={process.env.NEXT_PUBLIC_STRIPE_RECOVERY_LINK} financementVariant="points" />;
}
