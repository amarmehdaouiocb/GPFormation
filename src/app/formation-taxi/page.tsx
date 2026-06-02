import { getMarkdownContent } from "@/lib/markdown";
import FormationFamilyTemplate from "@/components/FormationFamilyTemplate";

export default async function Page() {
  const { content, data } = getMarkdownContent("formation-taxi");
  const breadcrumbs = [{ label: "Formation TAXI", href: "/formation-taxi" }];
  const subFormations = [{"title":"Formation Initiale","description":"Le parcours complet pour obtenir votre carte professionnelle.","href":"/formation-taxi/formation-initiale"},{"title":"Formation Continue","description":"Mettez à jour vos connaissances obligatoires.","href":"/formation-taxi/formation-continue"},{"title":"Mobilité","description":"Formation pour exercer dans un nouveau département.","href":"/formation-taxi/formation-mobilite"},{"title":"Passerelle VTC → TAXI","description":"Devenez Taxi en capitalisant sur votre expérience VTC.","href":"/formation-taxi/formation-passerelle"}];
  const downloads = [
    { label: "Référentiel T3P", href: "/documents/referentiel-t3p.pdf" },
    { label: "Grille d'évaluation Taxi", href: "/documents/taxi/grille-evaluation-pratique-taxi.pdf" },
  ];
  return <FormationFamilyTemplate title="Formation TAXI" subtitle="Devenez chauffeur de TAXI avec notre centre de formation." content={content} subFormations={subFormations} breadcrumbs={breadcrumbs} heroImage="/images/taxi-parisien.jpg" downloads={downloads} />;
}
