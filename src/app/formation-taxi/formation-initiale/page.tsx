import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

const GENERATED_IMAGE_BASE = "/images/gpformation-generated";

export const metadata: import("next").Metadata = {
  title: "Formation Initiale TAXI — Préparation à l'examen T3P",
  description:
    "Formation initiale TAXI à Aulnay-sous-Bois : préparez l'examen T3P et obtenez votre carte professionnelle de chauffeur de taxi. Théorie, pratique et accompagnement. Éligible CPF.",
  alternates: { canonical: "/formation-taxi/formation-initiale" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation Initiale TAXI — Examen T3P",
    description:
      "Préparez l'examen T3P et obtenez votre carte professionnelle de chauffeur de taxi. Aulnay-sous-Bois, éligible CPF.",
    url: "/formation-taxi/formation-initiale",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-initiale-taxi");
  const breadcrumbs = [
    { label: "Formations TAXI", href: "/formation-taxi" },
    { label: data.title || "Formation", href: "#" }
  ];
  const downloads = [
    { label: "Référentiel T3P", href: "/documents/referentiel-t3p.pdf" },
    { label: "Grille d'évaluation pratique", href: "/documents/taxi/grille-evaluation-pratique-taxi.pdf" },
    { label: "Dossier récapitulatif", href: "/documents/taxi/dossier-recapitulatif-formation-initiale-taxi.pdf" },
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} tag="TAXI" heroImage={`${GENERATED_IMAGE_BASE}/taxis-stationnes-formation-taxi.webp`} photos={[`${GENERATED_IMAGE_BASE}/taxis-stationnes-formation-taxi.webp`, `${GENERATED_IMAGE_BASE}/taxi-hero-practical-training.webp`, `${GENERATED_IMAGE_BASE}/taxi-classroom-training.webp`]} downloads={downloads} />;
}
