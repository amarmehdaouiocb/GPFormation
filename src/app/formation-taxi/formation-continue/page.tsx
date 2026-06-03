import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

const GENERATED_IMAGE_BASE = "/images/gpformation-generated";

export const metadata: import("next").Metadata = {
  title: "Formation Continue TAXI — Renouvellement de carte",
  description:
    "Formation continue TAXI (14h sur 2 jours) pour le renouvellement obligatoire de votre carte professionnelle de taxi tous les 5 ans. Centre à Aulnay-sous-Bois.",
  alternates: { canonical: "/formation-taxi/formation-continue" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation Continue TAXI",
    description:
      "Renouvellement obligatoire de la carte de taxi : 14h sur 2 jours à Aulnay-sous-Bois.",
    url: "/formation-taxi/formation-continue",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-continue-taxi");
  const breadcrumbs = [
    { label: "Formations TAXI", href: "/formation-taxi" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="14 heures (2 jours)" certification="Attestation de suivi" tag="TAXI" heroImage={`${GENERATED_IMAGE_BASE}/taxis-stationnes-formation-taxi.webp`} photos={[`${GENERATED_IMAGE_BASE}/taxis-stationnes-formation-taxi.webp`, `${GENERATED_IMAGE_BASE}/taxi-classroom-training.webp`, `${GENERATED_IMAGE_BASE}/driver-training-navigation.webp`]} financementVariant="fafcea" />;
}
