import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("services");
  const breadcrumbs = [
    { label: "Services", href: "#" }
  ];
  return <FormationDetailTemplate title="Nos Services" content={content} breadcrumbs={breadcrumbs} location="Aulnay-sous-Bois" />;
}
