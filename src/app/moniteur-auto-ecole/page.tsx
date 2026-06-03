import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Formation Moniteur Auto-École (ECSR)",
  description:
    "Devenez Enseignant de la Conduite et de la Sécurité Routière (ECSR / moniteur auto-école) avec GP Formation. Accompagnement jusqu'au démarrage de votre activité.",
  alternates: { canonical: "/moniteur-auto-ecole" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation Moniteur Auto-École (ECSR)",
    description:
      "Devenez Enseignant de la Conduite et de la Sécurité Routière (ECSR) avec GP Formation.",
    url: "/moniteur-auto-ecole",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("moniteur-auto-ecole");
  const breadcrumbs = [
    { label: "Moniteur Auto-École", href: "#" }
  ];
  return <FormationDetailTemplate title="Moniteur Auto-École" content={content} breadcrumbs={breadcrumbs} duration="Nous consulter" location="Aulnay-sous-Bois" />;
}
