import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Formation VTC en Cours du Soir",
  description:
    "Formation VTC en cours du soir à Aulnay-sous-Bois : préparez votre carte professionnelle VTC tout en restant en activité la journée. Éligible CPF.",
  alternates: { canonical: "/formation-vtc/cours-du-soir" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation VTC en Cours du Soir",
    description:
      "Préparez votre carte VTC en cours du soir, tout en restant en activité la journée. Aulnay-sous-Bois.",
    url: "/formation-vtc/cours-du-soir",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-vtc-cours-du-soir");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="6 semaines (18h-21h)" tag="VTC" />;
}
