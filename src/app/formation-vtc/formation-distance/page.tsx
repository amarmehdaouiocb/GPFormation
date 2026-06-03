import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Formation VTC à Distance (E-learning)",
  description:
    "Formation VTC à distance en e-learning : cours théoriques en ligne à votre rythme et à moindre coût. Préparez votre carte professionnelle VTC depuis chez vous.",
  alternates: { canonical: "/formation-vtc/formation-distance" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation VTC à Distance (E-learning)",
    description:
      "Cours théoriques VTC en ligne, à votre rythme et à moindre coût. Préparez votre carte VTC depuis chez vous.",
    url: "/formation-vtc/formation-distance",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-vtc-distance");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="Au rythme du candidat" location="En ligne" tag="VTC" />;
}
