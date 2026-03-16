import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("moniteur-auto-ecole");
  const breadcrumbs = [
    { label: "Moniteur Auto-École", href: "#" }
  ];
  return <FormationDetailTemplate title="Moniteur Auto-École" content={content} breadcrumbs={breadcrumbs} duration="Nous consulter" location="Aulnay-sous-Bois" />;
}
