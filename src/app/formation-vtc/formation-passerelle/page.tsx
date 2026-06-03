import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Passerelle TAXI vers VTC",
  description:
    "Formation passerelle TAXI → VTC : passez de chauffeur de taxi à VTC facilement. Développement commercial et réglementation nationale spécifique. Aulnay-sous-Bois.",
  alternates: { canonical: "/formation-vtc/formation-passerelle" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Passerelle TAXI vers VTC",
    description:
      "Passez de chauffeur de taxi à VTC : développement commercial et réglementation nationale spécifique.",
    url: "/formation-vtc/formation-passerelle",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-passerelle-taxi-vers-vtc");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="Nous consulter" tag="VTC" />;
}
