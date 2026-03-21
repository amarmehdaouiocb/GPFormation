import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("devenir-chauffeur-vtc");
  const breadcrumbs = [
    { label: "Devenir Chauffeur VTC", href: "#" }
  ];
  return <FormationDetailTemplate title="Devenir Chauffeur VTC" content={content} breadcrumbs={breadcrumbs} tag="VTC" duration="Nous consulter" location="Aulnay-sous-Bois" certification="Carte professionnelle VTC" />;
}
