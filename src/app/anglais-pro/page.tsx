import { getMarkdownContent } from "@/lib/markdown";
import FormationDetailTemplate from "@/components/FormationDetailTemplate";

export const metadata: import("next").Metadata = {
  title: "Anglais à visée professionnelle",
  description:
    "Formation Anglais débutant à visée professionnelle : 1 journée (7 h) en présentiel à Aulnay-sous-Bois, 80 €. Accueil client, transport et services. Aucun prérequis, formation non certifiante.",
  alternates: { canonical: "/anglais-pro" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Anglais à visée professionnelle",
    description:
      "Apprenez l'anglais de l'accueil client, du transport et des services en 1 journée (7 h) à Aulnay-sous-Bois. 80 €, aucun prérequis.",
    url: "/anglais-pro",
  },
};

const ANGLAIS_PHOTOS = [
  "/images/equipe-accueil.jpg",
  "/images/stock/formation-classe.jpg",
  "/images/formation-salle.jpg",
  "/images/succes-equipe.jpg",
  "/images/stock/succes-diplome.jpg",
  "/images/equipe-accueil.jpg",
];

export default async function Page() {
  const { content } = getMarkdownContent("anglais-pro");
  const breadcrumbs = [{ label: "Anglais à visée professionnelle", href: "#" }];
  return (
    <FormationDetailTemplate
      title="Anglais à visée professionnelle"
      content={content}
      breadcrumbs={breadcrumbs}
      price="80 €"
      duration="1 jour (7 h)"
      location="Aulnay-sous-Bois"
      certification="Attestation de formation"
      tag="ANGLAIS"
      heroImage="/images/equipe-accueil.jpg"
      photos={ANGLAIS_PHOTOS}
      financementVariant="anglais"
    />
  );
}
