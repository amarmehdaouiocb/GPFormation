import type { Metadata } from "next";
import ServicesShowcase from "@/components/ServicesShowcase";

export const metadata: Metadata = {
  title: "Campus & Services à Aulnay-sous-Bois",
  description:
    "Découvrez les services proposés par GP Formation : accessibilité PMR, parking sécurisé EIFFIA et cantine municipale à tarif réduit à Aulnay-sous-Bois.",
  alternates: { canonical: "/services" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Campus & Services — GP Formation",
    description:
      "Accessibilité PMR, parking sécurisé et cantine à tarif réduit à Aulnay-sous-Bois.",
    url: "/services",
  },
};

export default function ServicesPage() {
  return <ServicesShowcase />;
}
