import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

const initialeDownloads = [
  { label: "Télécharger le référentiel", href: "/downloads/taxi-initiale-referentiel.pdf" },
  { label: "Télécharger la grille d'évaluation", href: "/downloads/taxi-initiale-grille-evaluation.pdf" },
  { label: "Télécharger le dossier récapitulatif", href: "/downloads/taxi-initiale-dossier-recapitulatif.pdf" },
];

const initialePhotos = [
  "/images/formations/taxi-initiale/photo-1.jpg",
  "/images/formations/taxi-initiale/photo-2.jpg",
  "/images/formations/taxi-initiale/photo-3.jpg",
];

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-initiale-taxi");
  const breadcrumbs = [
    { label: "Formations TAXI", href: "/formation-taxi" },
    { label: data.title || "Formation", href: "#" }
  ];
  return (
    <FormationDetailTemplate
      title={data.title || "Programme"}
      content={content}
      breadcrumbs={breadcrumbs}
      tag="TAXI"
      downloads={initialeDownloads}
      photos={initialePhotos}
    />
  );
}
