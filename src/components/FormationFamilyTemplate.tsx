"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  CaretRight,
  DownloadSimple,
  GraduationCap,
  Phone,
} from "@phosphor-icons/react";
import MarkdownRenderer from "./MarkdownRenderer";

const FAMILY_PHOTOS: Record<string, string[]> = {
  taxi: [
    "/images/taxi-parisien.jpg",
    "/images/stock/paris-arc-triomphe-traffic.jpg",
    "/images/stock/formation-classe.jpg",
    "/images/stock/rue-paris-voitures.jpg",
    "/images/stock/volant-conducteur.jpg",
    "/images/stock/paris-nuit-trafic.jpg",
  ],
  vtc: [
    "/images/stock/berline-noire-luxe.jpg",
    "/images/stock/interieur-luxe.jpg",
    "/images/stock/champs-elysees.jpg",
    "/images/stock/formation-classe.jpg",
    "/images/stock/conduite-ville.jpg",
    "/images/stock/paris-nuit-trafic.jpg",
  ],
};

interface SubFormation {
  title: string;
  description: string;
  href: string;
}

interface FormationFamilyTemplateProps {
  title: string;
  subtitle: string;
  content: string;
  subFormations: SubFormation[];
  breadcrumbs: { label: string; href: string }[];
  heroImage?: string;
  downloads?: { label: string; href: string }[];
}

export default function FormationFamilyTemplate({
  title,
  subtitle,
  content,
  subFormations,
  breadcrumbs,
  heroImage,
  downloads,
}: FormationFamilyTemplateProps) {
  const familyKey = title.toLowerCase().includes("taxi") ? "taxi" : title.toLowerCase().includes("vtc") ? "vtc" : "taxi";
  const photos = FAMILY_PHOTOS[familyKey] ?? FAMILY_PHOTOS.taxi;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-zinc-950 pt-32 pb-24 md:pt-40 md:pb-32 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay opacity-[0.03]" />
        {heroImage && (
          <>
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover opacity-[0.07] pointer-events-none"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-transparent to-zinc-950/70 pointer-events-none" />
          </>
        )}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#4CAF50]/4 rounded-full blur-[180px] pointer-events-none" />

        <div className="container-custom relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase mb-12 overflow-x-auto pb-2">
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

          {/* Title — full width, serif/sans mix */}
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-6xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter text-white mb-8 leading-[0.92]"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xl md:text-2xl text-zinc-400 max-w-3xl leading-relaxed font-light mb-10"
            >
              {subtitle}
            </motion.p>

            {/* Badges compacts */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              {[
                { icon: GraduationCap, label: "CPF Éligible" },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-100 text-sm font-medium"
                >
                  <badge.icon size={16} className="text-[#4CAF50]" weight="duotone" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content — markdown + sidebar photos */}
      <section className="py-16 md:py-28">
        <div className="container-custom">
          <div className="relative">
            <div className="max-w-3xl">
              <MarkdownRenderer content={content} />

              {/* Documents téléchargeables (optionnel) */}
              {downloads && downloads.length > 0 && (
                <div className="mt-16">
                  <span className="eyebrow text-[#4CAF50] mb-2 block text-[0.7rem]">
                    Documents
                  </span>
                  <h4 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-950 mb-5">
                    À télécharger
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </div>
            <div className="hidden xl:block absolute top-12 right-0 w-[300px] space-y-4">
              <Image
                src={photos[0]}
                alt=""
                width={300}
                height={200}
                className="rounded-2xl object-cover shadow-lg w-full h-48"
              />
              <div className="grid grid-cols-2 gap-3">
                <Image
                  src={photos[1]}
                  alt=""
                  width={142}
                  height={100}
                  className="rounded-xl object-cover w-full h-28 shadow-md"
                />
                <Image
                  src={photos[2]}
                  alt=""
                  width={142}
                  height={100}
                  className="rounded-xl object-cover w-full h-28 shadow-md"
                />
              </div>
              <div className="relative rounded-xl overflow-hidden h-40">
                <Image
                  src={photos[3]}
                  alt=""
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white text-sm font-bold">Aulnay-sous-Bois, 93</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Strip — transition visuelle */}
      <section className="bg-zinc-100 py-3">
        <div className="container-custom">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
            {photos.slice(0, 6).map((photo, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden h-20 md:h-28">
                <Image src={photo} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sub-formations Grid */}
      <section className="py-16 md:py-28 bg-zinc-50">
        <div className="container-custom">
          <div className="mb-10">
            <span className="eyebrow text-[#4CAF50] mb-2 block text-[0.7rem]">
              01
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-950">
              Choisissez votre formule
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subFormations.map((form, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                  }}
                >
                  <Link
                    href={form.href}
                    className="group relative flex flex-col justify-between p-7 md:p-8 bg-white border border-zinc-200 rounded-2xl hover:border-l-4 hover:border-l-[#4CAF50] hover:shadow-lg hover:translate-x-1 transition-all duration-300 min-h-[200px] overflow-hidden"
                  >
                    <span
                      className="absolute top-4 right-6 text-6xl font-black text-[#4CAF50]/[0.12] leading-none select-none pointer-events-none group-hover:text-[#4CAF50]/20 transition-colors font-[family-name:var(--font-bricolage)]"
                      aria-hidden="true"
                    >
                      {num}
                    </span>
                    <div className="relative z-10">
                      <h4 className="text-xl font-bold tracking-tight text-zinc-950 mb-2 group-hover:text-[#4CAF50] transition-colors">
                        {form.title}
                      </h4>
                      <p className="text-zinc-600 leading-relaxed font-light text-[0.95rem]">
                        {form.description}
                      </p>
                    </div>
                    <div className="relative z-10 mt-6 self-end">
                      <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-[#4CAF50] group-hover:border-[#4CAF50] group-hover:text-white transition-all duration-300">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="border-t border-zinc-800 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay opacity-[0.03]" />
        <div className="container-custom py-20 md:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                Vous avez des questions ?
              </h2>
              <p className="text-lg text-zinc-400 max-w-xl">
                Nos conseillers sont là pour vous guider vers la meilleure formule selon
                votre profil et vous accompagner sur les démarches de financement.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-[#4CAF50] text-white font-bold text-sm tracking-wide uppercase hover:bg-[#3d9640] transition-colors rounded-lg group"
              >
                <span>Prendre rendez-vous</span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <a
                href="tel:0145090935"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 border border-zinc-700 text-zinc-200 font-bold text-sm tracking-wide uppercase hover:border-white hover:text-white transition-colors rounded-lg"
              >
                <Phone size={18} weight="duotone" />
                <span>01 45 09 09 35</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
