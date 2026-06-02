import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-initiale-vtc");
  const breadcrumbs = [
    { label: "Formations VTC", href: "/formation-vtc" },
    { label: data.title || "Formation", href: "#" }
  ];
  const downloads = [
    { label: "Référentiel T3P", href: "/documents/referentiel-t3p.pdf" },
    { label: "Grille d'évaluation VTC", href: "/documents/vtc/grille-evaluation-vtc.pdf" },
  ];
  return <FormationDetailTemplate title={data.title || "Programme"} content={content} breadcrumbs={breadcrumbs} duration="4 semaines" tag="VTC" downloads={downloads} />;
}
