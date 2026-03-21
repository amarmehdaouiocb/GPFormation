import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-vtc-ile-de-france");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: "Formation VTC Île-de-France", href: "#" }
  ];
  return <FormationDetailTemplate title="Formation VTC en Île-de-France" content={content} breadcrumbs={breadcrumbs} tag="VTC" duration="Nous consulter" location="Aulnay-sous-Bois" certification="Carte professionnelle VTC" />;
}
