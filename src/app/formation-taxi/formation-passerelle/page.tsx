import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-passerelle-vtc-vers-taxi");
  const breadcrumbs = [
    { label: "Formations TAXI", href: "/formation-taxi" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="Nous consulter" tag="TAXI" />;
}
