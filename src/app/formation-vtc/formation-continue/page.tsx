import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Formation Continue VTC — Renouvellement de carte",
  description:
    "Formation continue VTC (14h sur 2 jours) pour le renouvellement obligatoire de votre carte VTC tous les 5 ans. Centre à Aulnay-sous-Bois.",
  alternates: { canonical: "/formation-vtc/formation-continue" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation Continue VTC",
    description:
      "Renouvellement obligatoire de la carte VTC : 14h sur 2 jours à Aulnay-sous-Bois.",
    url: "/formation-vtc/formation-continue",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-continue-vtc");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="14 heures (2 jours)" certification="Attestation de suivi" tag="VTC" />;
}
