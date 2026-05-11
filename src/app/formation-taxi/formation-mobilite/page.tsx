import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

const mobilitePhotos = [
  "/images/formations/taxi-mobilite/photo-1.jpg",
  "/images/formations/taxi-mobilite/photo-2.jpg",
  "/images/formations/taxi-mobilite/photo-3.jpg",
];

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-mobilite");
  const breadcrumbs = [
    { label: "Formations TAXI", href: "/formation-taxi" },
    { label: data.title || "Formation", href: "#" }
  ];
  return (
    <FormationDetailTemplate
      title={data.title || "Programme"}
      content={content}
      breadcrumbs={breadcrumbs}
      duration="14 heures"
      certification="Attestation de suivi"
      tag="TAXI"
      financementProviders="FAFCEA ou Pôle Emploi"
      photos={mobilitePhotos}
    />
  );
}
