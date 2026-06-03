import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Centre TAXI & VTC à Aulnay-sous-Bois",
  description:
    "Contactez GP Formation à Aulnay-sous-Bois : 01 45 09 09 35, contact@gpformation.fr. Une question sur nos formations TAXI ou VTC ? Notre équipe vous répond.",
  alternates: { canonical: "/contact" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Contact — GP Formation",
    description:
      "Contactez GP Formation à Aulnay-sous-Bois pour vos formations TAXI et VTC.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
