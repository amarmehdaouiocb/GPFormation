import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Formation Initiale VTC — Carte professionnelle",
  description:
    "Formation initiale VTC à Aulnay-sous-Bois : préparez l'examen et obtenez votre carte professionnelle de chauffeur VTC. Théorie et pratique. Éligible CPF.",
  alternates: { canonical: "/formation-vtc/formation-initiale" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation Initiale VTC",
    description:
      "Préparez l'examen et obtenez votre carte professionnelle de chauffeur VTC. Aulnay-sous-Bois, éligible CPF.",
    url: "/formation-vtc/formation-initiale",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-initiale-vtc");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: data.title || "Formation", href: "#" }
  ];
  const downloads = [
    { label: "Référentiel T3P", href: "/documents/referentiel-t3p.pdf" },
    { label: "Grille d'évaluation VTC", href: "/documents/vtc/grille-evaluation-vtc.pdf" },
    { label: "Dossier récapitulatif", href: "/documents/vtc/dossier-recapitulatif-formation-initiale-vtc.pdf" },
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="Nous consulter" tag="VTC" downloads={downloads} />;
}
