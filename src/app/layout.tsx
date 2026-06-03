import type { Metadata } from "next";
import { Outfit, Geist_Mono, Instrument_Serif, Bricolage_Grotesque, Syne } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const SITE_URL = "https://www.gpformation.fr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GP Formation | Centre de formation TAXI et VTC en Île-de-France",
    template: "%s | GP Formation",
  },
  description:
    "Devenez chauffeur de TAXI ou VTC avec GP Formation, centre de formation à Aulnay-sous-Bois (Île-de-France). Formations initiales, continues, passerelles et stages de récupération de points. Éligible CPF.",
  keywords: [
    "formation taxi",
    "formation VTC",
    "centre de formation taxi VTC",
    "Île-de-France",
    "Aulnay-sous-Bois",
    "carte professionnelle taxi",
    "carte VTC",
    "examen T3P",
    "récupération de points",
    "CPF",
  ],
  authors: [{ name: "GP Formation" }],
  creator: "GP Formation",
  publisher: "SAS Grand Paris Formation",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "GP Formation",
    title: "GP Formation | Centre de formation TAXI et VTC en Île-de-France",
    description:
      "Centre de formation TAXI & VTC en Île-de-France : initiale, continue, passerelle et récupération de points. Éligible CPF.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GP Formation | Centre de formation TAXI et VTC",
    description:
      "Centre de formation TAXI & VTC en Île-de-France. Éligible CPF.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  name: "GP Formation",
  legalName: "SAS Grand Paris Formation",
  url: SITE_URL,
  logo: `${SITE_URL}/logo_gpformation_clean.png`,
  image: `${SITE_URL}/opengraph-image.png`,
  description:
    "Centre de formation TAXI & VTC en Île-de-France : formations initiales, continues, passerelles et stages de récupération de points.",
  telephone: "+33145090935",
  email: "contact@gpformation.fr",
  address: {
    "@type": "PostalAddress",
    streetAddress: "18 Boulevard du Général Gallieni",
    addressLocality: "Aulnay-sous-Bois",
    postalCode: "93600",
    addressCountry: "FR",
  },
  areaServed: "Île-de-France",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${outfit.variable} ${geistMono.variable} ${instrumentSerif.variable} ${bricolageGrotesque.variable} ${syne.variable} font-sans bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 antialiased flex flex-col min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
