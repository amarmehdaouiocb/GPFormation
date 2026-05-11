import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

const continuePhotos = [
  "/images/formations/taxi-continue/photo-1.jpg",
  "/images/formations/taxi-continue/photo-2.jpg",
  "/images/formations/taxi-continue/photo-3.jpg",
];

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-continue-taxi");
  const breadcrumbs = [
    { label: "Formations TAXI", href: "/formation-taxi" },
    { label: data.title || "Formation", href: "#" }
  ];
  return (
    <FormationDetailTemplate
      title={data.title || "Programme"}
      content={content}
      breadcrumbs={breadcrumbs}
      duration="14 heures (2 jours)"
      certification="Attestation de suivi"
      tag="TAXI"
      financementProviders="FAFCEA ou Pôle Emploi"
      photos={continuePhotos}
    />
  );
}
