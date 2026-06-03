import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Devenir Chauffeur VTC — Le guide complet",
  description:
    "Devenir chauffeur VTC : démarches, carte professionnelle, formation et financement. GP Formation vous accompagne de A à Z en Île-de-France.",
  alternates: { canonical: "/devenir-chauffeur-vtc" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Devenir Chauffeur VTC — Le guide complet",
    description:
      "Démarches, carte professionnelle, formation et financement : devenez chauffeur VTC avec GP Formation.",
    url: "/devenir-chauffeur-vtc",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("devenir-chauffeur-vtc");
  const breadcrumbs = [
    { label: "Devenir Chauffeur VTC", href: "#" }
  ];
  return <FormationDetailTemplate title="Devenir Chauffeur VTC" content={content} breadcrumbs={breadcrumbs} tag="VTC" duration="Nous consulter" location="Aulnay-sous-Bois" certification="Carte professionnelle VTC" />;
}
