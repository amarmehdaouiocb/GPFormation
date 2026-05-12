import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

const GENERATED_IMAGE_BASE = "/images/gpformation-generated";

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-continue-taxi");
  const breadcrumbs = [
    { label: "Formations TAXI", href: "/formation-taxi" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="14 heures (2 jours)" certification="Attestation de suivi" tag="TAXI" heroImage={`${GENERATED_IMAGE_BASE}/taxis-stationnes-formation-taxi.webp`} photos={[`${GENERATED_IMAGE_BASE}/taxis-stationnes-formation-taxi.webp`, `${GENERATED_IMAGE_BASE}/taxi-classroom-training.webp`, `${GENERATED_IMAGE_BASE}/driver-training-navigation.webp`]} />;
}
