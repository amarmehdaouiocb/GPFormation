import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

const GENERATED_IMAGE_BASE = "/images/gpformation-generated";

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
