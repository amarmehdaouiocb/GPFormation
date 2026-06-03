import { getMarkdownContent } from "@/lib/markdown";
import FormationFamilyTemplate from "@/components/FormationFamilyTemplate";

export const metadata: import("next").Metadata = {
  title: "Formation VTC à Aulnay-sous-Bois (Île-de-France)",
  description:
    "Formations VTC à Aulnay-sous-Bois : initiale, à distance (e-learning), cours du soir, continue et passerelle TAXI → VTC. Obtenez votre carte VTC. Éligible CPF.",
  alternates: { canonical: "/formation-vtc" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Formation VTC en Île-de-France",
    description:
      "Formations VTC à Aulnay-sous-Bois : initiale, e-learning, cours du soir, continue et passerelle. Éligible CPF.",
    url: "/formation-vtc",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-vtc");
  const breadcrumbs = [{ label: "Formation VTC", href: "/formation-vtc" }];
  const subFormations = [{"title":"Formation Initiale","description":"En centre, la préparation classique et intensive.","href":"/formation-vtc/formation-initiale"},{"title":"À distance (E-learning)","description":"Formez-vous à votre rythme depuis chez vous.","href":"/formation-vtc/formation-distance"},{"title":"Cours du soir","description":"Idéal si vous êtes déjà en activité la journée.","href":"/formation-vtc/cours-du-soir"},{"title":"Formation Continue","description":"Le stage de renouvellement obligatoire.","href":"/formation-vtc/formation-continue"},{"title":"Passerelle TAXI → VTC","description":"Passez de Taxi à VTC facilement.","href":"/formation-vtc/formation-passerelle"}];
  const downloads = [
    { label: "Référentiel T3P", href: "/documents/referentiel-t3p.pdf" },
    { label: "Grille d'évaluation VTC", href: "/documents/vtc/grille-evaluation-vtc.pdf" },
  ];
  return <FormationFamilyTemplate title="Formation VTC" subtitle="Maîtrisez le métier de Chauffeur VTC avec nos formations flexibles et certifiantes." content={content} subFormations={subFormations} breadcrumbs={breadcrumbs} heroImage="/images/vtc-berline-noire.jpg" downloads={downloads} />;
}
