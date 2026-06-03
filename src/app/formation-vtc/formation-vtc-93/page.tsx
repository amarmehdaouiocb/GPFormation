import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Formation VTC dans le 93 (Seine-Saint-Denis)",
  description:
    "Formation VTC en Seine-Saint-Denis (93) à Aulnay-sous-Bois : obtenez votre carte professionnelle de chauffeur VTC près de chez vous. Éligible CPF.",
  alternates: { canonical: "/formation-vtc/formation-vtc-93" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation VTC dans le 93 (Seine-Saint-Denis)",
    description:
      "Obtenez votre carte professionnelle VTC en Seine-Saint-Denis, à Aulnay-sous-Bois. Éligible CPF.",
    url: "/formation-vtc/formation-vtc-93",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-vtc-93");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: "Formation VTC 93", href: "#" }
  ];
  return <FormationDetailTemplate title="Formation VTC dans le 93" content={content} breadcrumbs={breadcrumbs} tag="VTC" duration="Nous consulter" location="Aulnay-sous-Bois (93)" certification="Carte professionnelle VTC" />;
}
