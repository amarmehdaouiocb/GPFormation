"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CaretRight,
  Clock,
  MapPin,
  CurrencyEur,
  Certificate,
  Phone,
  Coin,
  CreditCard,
  DownloadSimple,
} from "@phosphor-icons/react";
import MarkdownRenderer from "./MarkdownRenderer";
import React, { useMemo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TAG_HERO_IMAGES: Record<string, string> = {
  TAXI: "/images/hero-taxi-chauffeur.jpg",
  VTC: "/images/vtc-berline-noire.jpg",
  PERMIS: "/images/conduite-volant.jpg",
};

const TAG_PHOTOS: Record<string, string[]> = {
  TAXI: [
    "/images/taxi-parisien.jpg",
    "/images/stock/paris-arc-triomphe-traffic.jpg",
    "/images/stock/formation-classe.jpg",
    "/images/stock/rue-paris-voitures.jpg",
    "/images/stock/volant-conducteur.jpg",
    "/images/stock/succes-diplome.jpg",
  ],
  VTC: [
    "/images/stock/berline-noire-luxe.jpg",
    "/images/stock/interieur-luxe.jpg",
    "/images/stock/champs-elysees.jpg",
    "/images/stock/formation-classe.jpg",
    "/images/stock/conduite-ville.jpg",
    "/images/stock/succes-diplome.jpg",
  ],
  PERMIS: [
    "/images/stock/conduite-ville.jpg",
    "/images/stock/securite-routiere.jpg",
    "/images/stock/volant-conducteur.jpg",
    "/images/stock/formation-classe.jpg",
    "/images/stock/gps-navigation.jpg",
    "/images/stock/succes-diplome.jpg",
  ],
};

const DEFAULT_PHOTOS = [
  "/images/formation-salle.jpg",
  "/images/stock/formation-classe.jpg",
  "/images/stock/volant-conducteur.jpg",
  "/images/stock/rue-paris-voitures.jpg",
  "/images/stock/conduite-ville.jpg",
  "/images/stock/succes-diplome.jpg",
];

type FinancementVariant = "standard" | "fafcea" | "points";

interface DownloadLink {
  label: string;
  href: string;
}

interface FormationDetailTemplateProps {
  title: string;
  content: string;
  breadcrumbs: { label: string; href: string }[];
  price?: string;
  duration?: string;
  location?: string;
  certification?: string;
  tag?: string;
  heroImage?: string;
  photos?: string[];
  relatedFormations?: { title: string; href: string; tag?: string }[];
  stripePaymentLink?: string;
  financementVariant?: FinancementVariant;
  downloads?: DownloadLink[];
}

const FINANCEMENT_COPY: Record<FinancementVariant, { title: string; description: string }> = {
  standard: {
    title: "Besoin d'aide pour le financement ?",
    description:
      "Nos équipes vous accompagnent dans la constitution de votre dossier CPF, Pôle Emploi…",
  },
  fafcea: {
    title: "Besoin d'aide pour le financement ?",
    description:
      "Nos équipes vous accompagnent dans la constitution de votre dossier FAFCEA, Pôle Emploi…",
  },
  points: {
    title: "Besoin d'aide pour le financement ?",
    description:
      "Nos équipes vous accompagnent : prise en charge possible par votre assurance auto.",
  },
};

function extractH2Headings(content: string): string[] {
  const matches = content.match(/^## (.+)$/gm);
  if (!matches) return [];
  return matches.map((m) => m.replace(/^## /, ""));
}

export default function FormationDetailTemplate({
  title,
  content,
  breadcrumbs,
  price = "Sur devis",
  duration = "Nous consulter",
  location = "Aulnay-sous-Bois",
  certification = "Attestation de réussite",
  tag,
  heroImage,
  photos,
  relatedFormations,
  stripePaymentLink,
  financementVariant = "standard",
  downloads,
}: FormationDetailTemplateProps) {
  const financementCopy = FINANCEMENT_COPY[financementVariant];
  const headings = useMemo(() => extractH2Headings(content), [content]);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const defaultPhotos = TAG_PHOTOS[tag?.toUpperCase() ?? ""] ?? DEFAULT_PHOTOS;
  const resolvedPhotos = photos?.length ? photos : defaultPhotos;
  const photoAt = (index: number) =>
    resolvedPhotos[index % resolvedPhotos.length] ??
    defaultPhotos[index % defaultPhotos.length];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveHeading(visible.target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    const headingEls = document.querySelectorAll("[data-heading-id]");
    headingEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-zinc-950 text-white pt-32 pb-28 md:pt-40 md:pb-36 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay opacity-[0.03]" />
        <Image
          src={heroImage ?? TAG_HERO_IMAGES[tag?.toUpperCase() ?? ""] ?? "/images/formation-salle.jpg"}
          alt=""
          fill
          className="object-cover opacity-[0.08] pointer-events-none"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950/80 pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-[900px] h-[900px] bg-[#4CAF50]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-[#4CAF50]/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-custom relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase mb-10 overflow-x-auto pb-2">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                <CaretRight size={14} />
                <Link
                  href={crumb.href}
                  className={
                    idx === breadcrumbs.length - 1
                      ? "text-white"
                      : "hover:text-white transition-colors"
                  }
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              {tag && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-6"
                >
                  <span className="inline-block px-3.5 py-1.5 bg-[#4CAF50] text-white text-xs font-bold tracking-widest uppercase rounded-md">
                    {tag}
                  </span>
                </motion.div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8 leading-[0.95] font-[family-name:var(--font-bricolage)]"
              >
                {title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 px-7 py-4 bg-[#4CAF50] text-white font-bold tracking-wide uppercase text-sm hover:bg-[#3d9640] transition-all hover:scale-[0.98] group rounded-md"
                >
                  <span>Demander une inscription</span>
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <a
                  href="tel:0145090935"
                  className="inline-flex items-center gap-2.5 px-6 py-4 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 font-medium text-sm transition-colors rounded-md"
                >
                  <Phone size={18} weight="duotone" />
                  <span>01 45 09 09 35</span>
                </a>
                {stripePaymentLink && (
                  <a
                    href={stripePaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-7 py-4 bg-white text-zinc-950 font-bold tracking-wide uppercase text-sm hover:bg-zinc-100 transition-all hover:scale-[0.98] group rounded-md"
                  >
                    <CreditCard size={18} weight="duotone" />
                    <span>S&apos;inscrire et payer en ligne</span>
                  </a>
                )}
              </motion.div>
            </div>

            {/* Fiche Technique */}
            <motion.div
              className="lg:col-span-5 flex flex-col gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              {[
                {
                  icon: Clock,
                  label: "Durée",
                  value: duration,
                },
                {
                  icon: CurrencyEur,
                  label: "Financement",
                  value: price,
                },
                {
                  icon: MapPin,
                  label: "Lieu",
                  value: location,
                },
                {
                  icon: Certificate,
                  label: "Validation",
                  value: certification,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "bg-zinc-900/80 border border-zinc-800 p-6 flex items-center gap-5 rounded-xl",
                    i === 0 && "rounded-t-2xl",
                    i === 3 && "rounded-b-2xl"
                  )}
                >
                  <div className="w-11 h-11 bg-[#4CAF50]/15 rounded-full flex items-center justify-center shrink-0">
                    <item.icon size={22} className="text-[#4CAF50]" weight="duotone" />
                  </div>
                  <div>
                    <span className="eyebrow text-zinc-400 block text-[0.65rem] mb-0.5">
                      {item.label}
                    </span>
                    <span className="text-lg font-bold text-white">{item.value}</span>
                  </div>
                </div>
              ))}

              <Link
                href="/contact"
                className="mt-1 flex items-center justify-center gap-3 px-6 py-4 bg-white text-zinc-950 font-bold text-sm tracking-wide uppercase hover:bg-zinc-100 transition-colors rounded-xl group"
              >
                <span>Demander une inscription</span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programme Section */}
      <section className="py-16 md:py-28 bg-white">
        <div className="container-custom">
          <div className="mb-12 md:mb-16">
            <span className="eyebrow text-[#4CAF50] mb-2 block text-[0.7rem]">02</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-950">
              Programme détaillé
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Sticky sidebar nav — desktop only */}
            {headings.length > 2 && (
              <nav className="hidden lg:block lg:col-span-3">
                <div className="sticky top-32 space-y-1">
                  <span className="eyebrow text-zinc-400 mb-4 block text-[0.6rem]">
                    Sommaire
                  </span>
                  {headings.map((heading, i) => {
                    const slug = slugify(heading);
                    const isActive = activeHeading === slug;
                    return (
                      <a
                        key={i}
                        href={`#${slug}`}
                        className={cn(
                          "block py-2 pl-4 text-sm border-l-2 transition-all duration-200",
                          isActive
                            ? "border-[#4CAF50] text-zinc-950 font-semibold"
                            : "border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-300"
                        )}
                      >
                        {heading}
                      </a>
                    );
                  })}

                  {/* Mini-galerie sidebar */}
                  <div className="mt-8 pt-6 border-t border-zinc-200 space-y-3">
                    <Image
                      src={photoAt(0)}
                      alt=""
                      width={280}
                      height={180}
                      className="rounded-xl object-cover w-full h-36"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Image
                        src={photoAt(1)}
                        alt=""
                        width={136}
                        height={96}
                        className="rounded-lg object-cover w-full h-24"
                      />
                      <Image
                        src={photoAt(2)}
                        alt=""
                        width={136}
                        height={96}
                        className="rounded-lg object-cover w-full h-24"
                      />
                    </div>
                  </div>
                </div>
              </nav>
            )}

            {/* Main content */}
            <div
              className={cn(
                headings.length > 2
                  ? "lg:col-span-9"
                  : "lg:col-span-12 max-w-4xl mx-auto"
              )}
            >
              <MarkdownRendererWithIds content={content} tag={tag} photos={resolvedPhotos} />

              {/* Documents téléchargeables (optionnel) */}
              {downloads && downloads.length > 0 && (
                <div className="mt-16">
                  <span className="eyebrow text-[#4CAF50] mb-2 block text-[0.7rem]">
                    Documents
                  </span>
                  <h4 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-950 mb-5">
                    À télécharger
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {downloads.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.href}
                        download
                        className="group flex items-center justify-between gap-4 px-5 py-4 bg-zinc-50 hover:bg-white border border-zinc-200 hover:border-zinc-950 rounded-xl transition-all"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="w-10 h-10 bg-[#4CAF50]/10 rounded-full flex items-center justify-center shrink-0">
                            <DownloadSimple
                              size={18}
                              weight="duotone"
                              className="text-[#4CAF50]"
                            />
                          </span>
                          <span className="text-sm font-semibold text-zinc-900 leading-tight">
                            {doc.label}
                          </span>
                        </span>
                        <ArrowRight
                          size={16}
                          className="text-zinc-400 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-zinc-950"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box Financement */}
              <div className="mt-16 bg-[#4CAF50]/5 border border-[#4CAF50]/20 border-l-4 border-l-[#4CAF50] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center shrink-0">
                  <Coin size={24} className="text-[#4CAF50]" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-zinc-950 mb-1">
                    {financementCopy.title}
                  </h4>
                  <p className="text-zinc-600 text-[0.95rem]">
                    {financementCopy.description}
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="shrink-0 px-6 py-3 bg-zinc-950 text-white font-medium hover:bg-zinc-800 transition-colors rounded-lg whitespace-nowrap text-sm"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Mosaic Section */}
      <section className="py-4 md:py-6 bg-zinc-100">
        <div className="container-custom">
          <div className="grid grid-cols-6 md:grid-cols-12 gap-3 md:gap-4">
            {/* Grande photo principale */}
            <div className="col-span-6 md:col-span-5 relative rounded-2xl overflow-hidden h-48 md:h-72">
              <Image src={photoAt(0)} alt="" fill className="object-cover" />
            </div>
            {/* Deux petites empilées */}
            <div className="col-span-3 md:col-span-3 flex flex-col gap-3 md:gap-4">
              <div className="relative rounded-xl overflow-hidden flex-1 min-h-[5.5rem] md:min-h-0">
                <Image src={photoAt(1)} alt="" fill className="object-cover" />
              </div>
              <div className="relative rounded-xl overflow-hidden flex-1 min-h-[5.5rem] md:min-h-0">
                <Image src={photoAt(2)} alt="" fill className="object-cover" />
              </div>
            </div>
            {/* Photo + overlay CTA */}
            <div className="col-span-3 md:col-span-4 relative rounded-2xl overflow-hidden h-48 md:h-72">
              <Image src={photoAt(0)} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <p className="text-white font-bold text-sm md:text-lg">
                  Rejoignez nos promotions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formations associées */}
      {relatedFormations && relatedFormations.length > 0 && (
        <section className="border-t border-zinc-800 py-16 md:py-24 bg-zinc-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 noise-overlay opacity-[0.03]" />
          <div className="container-custom relative z-10">
            <span className="eyebrow text-[#4CAF50] mb-2 block text-[0.7rem]">
              Voir aussi
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-white mb-10">
              Formations associées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedFormations.map((rf, i) => (
                <Link
                  key={i}
                  href={rf.href}
                  className="group flex items-center justify-between p-6 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:border-[#4CAF50]/40 hover:bg-zinc-900 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {rf.tag && (
                      <span className="inline-block px-2 py-0.5 bg-[#4CAF50]/15 text-[#4CAF50] text-[0.65rem] font-bold tracking-wider uppercase rounded">
                        {rf.tag}
                      </span>
                    )}
                    <span className="font-semibold text-zinc-100 group-hover:text-[#4CAF50] transition-colors">
                      {rf.title}
                    </span>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-zinc-500 group-hover:text-[#4CAF50] transition-all group-hover:translate-x-1 shrink-0"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* MarkdownRenderer wrapper that injects data-heading-id for scroll spy */
function MarkdownRendererWithIds({
  content,
  tag,
  photos,
}: {
  content: string;
  tag?: string;
  photos?: string[];
}) {
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <div>
      <MarkdownRendererInner content={content} slugify={slugify} tag={tag} photos={photos} />
    </div>
  );
}

/* Inner component that renders markdown sections with heading IDs */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle, Info } from "@phosphor-icons/react";

function parseMarkdownIntoSections(content: string) {
  return content.split(/(?=^## )/m);
}

function parseH2SectionIntoCards(sectionContent: string) {
  return sectionContent.split(/(?=^### )/m);
}

function extractH2Title(section: string): string | null {
  const match = section.match(/^## (.+)$/m);
  return match ? match[1] : null;
}

const mdComponents = {
  h1: () => null,
  h2: () => null,
  h3: ({ node, ...props }: any) => (
    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 mb-5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-[#4CAF50]/10 flex items-center justify-center shrink-0">
        <CaretRight className="text-[#4CAF50]" size={18} weight="bold" />
      </div>
      {props.children}
    </h3>
  ),
  p: ({ node, children, ...props }: any) => (
    <p className="text-lg md:text-xl text-zinc-600 leading-[1.8] mb-5 font-light" {...props}>
      {children}
    </p>
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="flex flex-col gap-0 my-5 pl-0 list-none divide-y divide-zinc-100">
      {props.children}
    </ul>
  ),
  li: ({ node, ...props }: any) => (
    <li className="flex items-start gap-3 py-3 group">
      <div className="mt-1 shrink-0 text-[#4CAF50]">
        <CheckCircle size={20} weight="duotone" />
      </div>
      <span className="text-zinc-800 group-hover:text-zinc-950 leading-relaxed font-medium transition-colors text-[1.05rem]">
        {props.children}
      </span>
    </li>
  ),
  table: ({ node, ...props }: any) => (
    <div className="my-8 w-full overflow-x-auto rounded-xl border border-zinc-200 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[600px]" {...props}>
        {props.children}
      </table>
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-zinc-950 text-white [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl" {...props}>
      {props.children}
    </thead>
  ),
  th: ({ node, ...props }: any) => (
    <th className="py-4 px-5 font-semibold uppercase tracking-widest text-xs whitespace-nowrap" {...props}>
      {props.children}
    </th>
  ),
  td: ({ node, ...props }: any) => (
    <td className="py-3.5 px-5 border-t border-zinc-100 text-zinc-600 align-middle" {...props}>
      {props.children}
    </td>
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="even:bg-zinc-50/70 hover:bg-zinc-50 transition-colors" {...props}>
      {props.children}
    </tr>
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="my-8 p-5 md:p-6 bg-[#4CAF50]/5 border-l-4 border-[#4CAF50] flex gap-4 items-start rounded-r-lg">
      <Info className="text-[#4CAF50] shrink-0 mt-0.5" size={20} weight="duotone" />
      <div className="text-zinc-800 font-medium text-base leading-relaxed [&>p]:mb-0">
        {props.children}
      </div>
    </blockquote>
  ),
  a: ({ node, ...props }: any) => (
    <a
      className="font-semibold text-[#4CAF50] hover:text-zinc-950 underline decoration-2 decoration-[#4CAF50]/30 hover:decoration-zinc-950 underline-offset-4 transition-all"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {props.children}
    </a>
  ),
  strong: ({ node, ...props }: any) => (
    <strong className="font-bold text-zinc-950" {...props}>
      {props.children}
    </strong>
  ),
};

function MarkdownRendererInner({
  content,
  slugify,
  tag,
  photos: photoOverrides,
}: {
  content: string;
  slugify: (text: string) => string;
  tag?: string;
  photos?: string[];
}) {
  const sections = parseMarkdownIntoSections(content);
  const fallbackPhotos = TAG_PHOTOS[tag?.toUpperCase() ?? ""] ?? DEFAULT_PHOTOS;
  const photos = photoOverrides?.length ? photoOverrides : fallbackPhotos;
  let h2Counter = 0;
  let photoIndex = 0;

  return (
    <div className="markdown-premium-layout w-full">
      {sections.map((section, sectionIndex) => {
        const parts = parseH2SectionIntoCards(section);
        const h2Title = extractH2Title(section);

        if (h2Title) {
          h2Counter++;
        }

        const currentNumber = h2Counter;
        const formattedNumber = String(currentNumber).padStart(2, "0");
        const h3Cards = parts.slice(1);
        const isOddCards = h3Cards.length % 2 !== 0;
        const headingSlug = h2Title ? slugify(h2Title) : "";
        const isAlternateSection = h2Title && currentNumber % 2 === 0;

        return (
          <div
            key={sectionIndex}
            className={cn(
              "w-full",
              sectionIndex > 0 && h2Title && "pt-14 mt-14 border-t border-zinc-200",
              isAlternateSection && "bg-zinc-50 rounded-3xl p-8 -mx-4 md:-mx-8"
            )}
          >
            {h2Title ? (
              <div
                className="relative mb-10 scroll-mt-36"
                id={headingSlug}
                data-heading-id={headingSlug}
              >
                <span
                  className="absolute -top-6 -left-2 text-[5rem] md:text-[7rem] font-black text-[#4CAF50]/[0.12] leading-none select-none pointer-events-none font-[family-name:var(--font-bricolage)]"
                  aria-hidden="true"
                >
                  {formattedNumber}
                </span>
                <div className="relative">
                  <span className="eyebrow text-[#4CAF50] mb-2 block text-[0.7rem]">
                    {formattedNumber}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-950">
                    {h2Title}
                  </h2>
                </div>
              </div>
            ) : null}

            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {h2Title ? parts[0].replace(/^## .+$/m, "") : parts[0]}
            </ReactMarkdown>

            {h3Cards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 w-full">
                {h3Cards.map((cardContent, cardIndex) => {
                  const isLastOdd = isOddCards && cardIndex === h3Cards.length - 1;
                  return (
                    <div
                      key={cardIndex}
                      className={cn(
                        "border rounded-2xl p-7 md:p-8",
                        isAlternateSection
                          ? "bg-white border-zinc-200"
                          : "bg-zinc-50 border-zinc-300",
                        "hover:shadow-lg hover:border-l-[#4CAF50] hover:border-l-4 transition-all duration-300",
                        "flex flex-col w-full",
                        isLastOdd && "md:col-span-2"
                      )}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {cardContent}
                      </ReactMarkdown>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Photo break inline — toutes les 3 sections H2 */}
            {h2Title && currentNumber > 0 && currentNumber % 3 === 0 && photoIndex < photos.length && (() => {
              const pIdx = photoIndex % photos.length;
              const pIdx2 = (photoIndex + 1) % photos.length;
              photoIndex += 2;
              return (
                <div className="mt-12 grid grid-cols-3 gap-3">
                  <div className="col-span-2 relative rounded-2xl overflow-hidden h-40 md:h-52">
                    <Image src={photos[pIdx]} alt="" fill className="object-cover" />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden h-40 md:h-52">
                    <Image src={photos[pIdx2]} alt="" fill className="object-cover" />
                    <div className="absolute inset-0 bg-[#4CAF50]/10" />
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}
