import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-vtc-distance");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: data.title || "Formation", href: "#" }
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="Au rythme du candidat" location="En ligne" />;
}
