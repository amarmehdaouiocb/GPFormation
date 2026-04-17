import type { Metadata } from "next";
import ServicesShowcase from "@/components/ServicesShowcase";

export const metadata: Metadata = {
  title: "Campus & Services | GP Formation Aulnay-sous-Bois",
  description:
    "Découvrez les services proposés par GP Formation : accessibilité PMR, parking sécurisé EIFFIA et cantine municipale à tarif réduit à Aulnay-sous-Bois.",
};

export default function ServicesPage() {
  return <ServicesShowcase />;
}
