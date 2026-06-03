import { getMarkdownContent } from "@/lib/markdown";
import PricingTemplate from "@/components/PricingTemplate";

export const metadata: import("next").Metadata = {
  title: "Tarifs & Formules — Formations TAXI & VTC",
  description:
    "Tarifs des formations TAXI et VTC de GP Formation : formules temps plein, cours du soir, accélérée et e-learning. Éligible CPF, financements CPF/OPCO/Pôle Emploi.",
  alternates: { canonical: "/tarifs" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Tarifs & Formules — Formations TAXI & VTC",
    description:
      "Grille tarifaire transparente des formations TAXI et VTC. Éligible CPF, financements possibles.",
    url: "/tarifs",
  },
};

export default async function Page() {
  const { content, data } = getMarkdownContent("tarifs");
  return <PricingTemplate title={data.title || "Tarifs"} content={content} />;
}
