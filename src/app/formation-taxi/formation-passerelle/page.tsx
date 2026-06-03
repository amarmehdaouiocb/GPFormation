import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

const GENERATED_IMAGE_BASE = "/images/gpformation-generated";

export const metadata: import("next").Metadata = {
  title: "Passerelle VTC vers TAXI",
  description:
    "Formation passerelle VTC → TAXI : capitalisez sur votre expérience de chauffeur VTC pour obtenir la carte de taxi. Réglementation, connaissance du territoire et pratique.",
  alternates: { canonical: "/formation-taxi/formation-passerelle" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Passerelle VTC vers TAXI",
    description:
      "Devenez chauffeur de taxi en capitalisant sur votre expérience VTC. Réglementation, territoire et pratique.",
    url: "/formation-taxi/formation-passerelle",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-passerelle-vtc-vers-taxi");
  const breadcrumbs = [
    { label: "Formations TAXI", href: "/formation-taxi" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="Nous consulter" tag="TAXI" heroImage={`${GENERATED_IMAGE_BASE}/reussite-carte-professionnelle.webp`} photos={[`${GENERATED_IMAGE_BASE}/formation-taxi-card.webp`, `${GENERATED_IMAGE_BASE}/driver-training-navigation.webp`, `${GENERATED_IMAGE_BASE}/reussite-carte-professionnelle.webp`]} />;
}
