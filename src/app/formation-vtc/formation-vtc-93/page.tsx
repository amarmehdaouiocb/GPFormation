import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-vtc-93");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: "Formation VTC 93", href: "#" }
  ];
  return <FormationDetailTemplate title="Formation VTC dans le 93" content={content} breadcrumbs={breadcrumbs} tag="VTC" duration="Nous consulter" location="Aulnay-sous-Bois (93)" certification="Carte professionnelle VTC" />;
}
