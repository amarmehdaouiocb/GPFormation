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

export const metadata: Metadata = {
  title: "GP Formation | Centre de formation TAXI et VTC agréé",
  description: "Devenez chauffeur de TAXI ou VTC avec le 1er centre de formation agréé en Île-de-France. Formations initiales, continues, passerelles et récupération de points.",
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
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
