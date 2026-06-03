import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

const GENERATED_IMAGE_BASE = "/images/gpformation-generated";

export const metadata: import("next").Metadata = {
  title: "Formation à la Mobilité TAXI",
  description:
    "Formation à la mobilité TAXI (14h) pour exercer dans un nouveau département : connaissance du territoire et réglementation locale. Centre à Aulnay-sous-Bois.",
  alternates: { canonical: "/formation-taxi/formation-mobilite" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation à la Mobilité TAXI",
    description:
      "Exercez l'activité de taxi dans un nouveau département : connaissance du territoire et réglementation locale.",
    url: "/formation-taxi/formation-mobilite",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-mobilite");
  const breadcrumbs = [
    { label: "Formations TAXI", href: "/formation-taxi" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="14 heures" certification="Attestation de suivi" tag="TAXI" heroImage={`${GENERATED_IMAGE_BASE}/taxi-hero-practical-training.webp`} photos={[`${GENERATED_IMAGE_BASE}/driver-training-navigation.webp`, `${GENERATED_IMAGE_BASE}/taxi-hero-practical-training.webp`, `${GENERATED_IMAGE_BASE}/reussite-carte-professionnelle.webp`]} financementVariant="fafcea" />;
}
