import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Formation VTC en Île-de-France",
  description:
    "Formation VTC en Île-de-France à Aulnay-sous-Bois : préparez et obtenez votre carte professionnelle de chauffeur VTC. Accompagnement complet, éligible CPF.",
  alternates: { canonical: "/formation-vtc/formation-vtc-en-ile-de-france" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation VTC en Île-de-France",
    description:
      "Préparez et obtenez votre carte professionnelle VTC en Île-de-France. Accompagnement complet, éligible CPF.",
    url: "/formation-vtc/formation-vtc-en-ile-de-france",
  },
};

export default async function Page() {
  const { content } = getMarkdownContent("formation-vtc-ile-de-france");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: "Formation VTC Île-de-France", href: "#" }
  ];
  return <FormationDetailTemplate title="Formation VTC en Île-de-France" content={content} breadcrumbs={breadcrumbs} tag="VTC" duration="Nous consulter" location="Aulnay-sous-Bois" certification="Carte professionnelle VTC" />;
}
