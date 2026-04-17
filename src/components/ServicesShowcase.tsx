"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Wheelchair,
  CarProfile,
  ForkKnife,
  Phone,
  EnvelopeSimple,
  CheckCircle,
  ArrowRight,
  CaretRight,
} from "@phosphor-icons/react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

export default function ServicesShowcase() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="bg-zinc-950 text-white pt-24 sm:pt-28 md:pt-40 pb-16 sm:pb-20 md:pb-32 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-[700px] h-[700px] bg-[#4CAF50]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-[#4CAF50]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-custom relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase mb-8 sm:mb-10">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <CaretRight size={14} />
            <span className="text-white">Nos Services</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 sm:mb-6"
          >
            <span className="inline-block px-3 py-1.5 bg-[#4CAF50] text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-md">
              Campus & Commodités
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[2.25rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[0.95] font-[family-name:var(--font-bricolage)] mb-6 sm:mb-8 max-w-4xl"
          >
            Votre confort.
            <br />
            <span className="italic font-normal font-[family-name:var(--font-instrument-serif)] text-[#4CAF50]">
              Notre priorité.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl"
          >
            Nous mettons tout en œuvre pour que votre expérience de formation soit
            optimale. Découvrez nos installations adaptées et nos offres
            partenaires exclusives.
          </motion.p>
        </div>
      </section>

      {/* CAMPUS & COMMODITIES */}
      <section className="py-16 sm:py-20 md:py-28 bg-white">
        <div className="container-custom">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="flex flex-col gap-6 lg:gap-8"
          >
            {/* BLOCK 01 — PMR */}
            <motion.div
              variants={itemFadeUp}
              className="group relative bg-zinc-50 border border-zinc-200 rounded-2xl p-6 sm:p-10 md:p-12 overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                <div className="lg:col-span-7">
                  <span className="eyebrow text-[#4CAF50] mb-3 block text-[0.7rem]">
                    01 — Accessibilité
                  </span>

                  <div className="flex items-start gap-4 sm:gap-5 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-900">
                      <Wheelchair size={26} weight="duotone" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-zinc-950 font-[family-name:var(--font-bricolage)]">
                      Accessibilité PMR
                    </h2>
                  </div>

                  <p className="text-zinc-600 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                    Notre centre de formation est entièrement adapté aux personnes
                    à mobilité réduite pour vous garantir une autonomie totale et un
                    confort d&apos;apprentissage optimal.
                  </p>

                  <ul className="flex flex-col gap-0 divide-y divide-zinc-200 border-y border-zinc-200">
                    {[
                      "Une rampe d'accès pour vous permettre d'accéder en toute autonomie.",
                      "Une banque d'accueil adaptée pour faciliter la prise d'informations et l'échange de documents.",
                      "Des sanitaires adaptés aux normes en vigueur pour votre confort.",
                    ].map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-4 py-4 sm:py-5"
                      >
                        <div className="shrink-0 mt-0.5 text-[#4CAF50]">
                          <CheckCircle size={22} weight="duotone" />
                        </div>
                        <span className="text-zinc-800 text-base leading-relaxed font-medium">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Référent handicap */}
                <aside className="lg:col-span-5 w-full">
                  <div className="bg-zinc-950 text-white rounded-2xl p-7 sm:p-8 relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#4CAF50]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                      <span className="eyebrow text-[#4CAF50] mb-5 block text-[0.65rem]">
                        Votre contact dédié
                      </span>

                      <h3 className="text-xl sm:text-2xl font-bold mb-6 tracking-tight font-[family-name:var(--font-bricolage)]">
                        Référent Handicap
                      </h3>

                      <div className="flex items-center gap-4 pb-6 mb-6 border-b border-zinc-800">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#4CAF50] shrink-0">
                          <Wheelchair size={24} weight="fill" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base sm:text-lg font-bold text-white">
                            M. MICOOGULLARI
                          </p>
                          <p className="text-sm text-zinc-400">Suleyman</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <a
                          href="tel:0608680381"
                          className="group/link flex items-center gap-3 text-zinc-300 hover:text-white transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/link:bg-[#4CAF50] group-hover/link:border-[#4CAF50] transition-colors">
                            <Phone size={15} weight="fill" />
                          </div>
                          <span className="text-sm sm:text-base font-medium">
                            06 08 68 03 81
                          </span>
                        </a>
                        <a
                          href="mailto:m.suleyman@gpformation.fr"
                          className="group/link flex items-center gap-3 text-zinc-300 hover:text-white transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/link:bg-[#4CAF50] group-hover/link:border-[#4CAF50] transition-colors">
                            <EnvelopeSimple size={15} weight="fill" />
                          </div>
                          <span className="text-sm sm:text-base font-medium break-all">
                            m.suleyman@gpformation.fr
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </motion.div>

            {/* BLOCK 02 & 03 — Parking & Cantine */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* PARKING */}
              <motion.div
                variants={itemFadeUp}
                className="group relative bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-950 transition-colors"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100">
                  <Image
                    src="/images/services/parking.jpg"
                    alt="Parking sécurisé EIFFIA"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/30 pointer-events-none" />
                  <div className="absolute top-4 left-4">
                    <span className="eyebrow text-white/90 font-mono text-[0.65rem]">
                      02 — Stationnement
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="backdrop-blur-md bg-white/90 text-zinc-900 text-[10px] sm:text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-md">
                      Tarif unique
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-900 group-hover:text-[#4CAF50] transition-colors">
                      <CarProfile size={24} weight="duotone" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 font-[family-name:var(--font-bricolage)]">
                      Parking EIFFIA
                    </h3>
                  </div>

                  <p className="text-zinc-600 text-base leading-relaxed mb-6">
                    Situé en face de notre centre, vous avez la possibilité de
                    vous garer, pour un tarif unique, dans le parking sécurisé
                    EIFFIA, et ce pendant toute la durée de votre formation.
                  </p>

                  <div className="mt-auto pt-4 border-t border-zinc-200 flex items-center justify-between gap-3">
                    <span className="eyebrow text-zinc-500 text-[0.65rem]">
                      En face du centre
                    </span>
                    <ArrowRight
                      size={18}
                      className="text-zinc-400 group-hover:text-[#4CAF50] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </motion.div>

              {/* CANTINE */}
              <motion.div
                variants={itemFadeUp}
                className="group relative bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-950 transition-colors"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100">
                  <Image
                    src="/images/services/cantine.jpg"
                    alt="Cantine municipale d'Aulnay-sous-Bois"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/30 pointer-events-none" />
                  <div className="absolute top-4 left-4">
                    <span className="eyebrow text-white/90 font-mono text-[0.65rem]">
                      03 — Restauration
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="backdrop-blur-md bg-white/90 text-zinc-900 text-[10px] sm:text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-md">
                      Tarif réduit
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-900 group-hover:text-[#4CAF50] transition-colors">
                      <ForkKnife size={24} weight="duotone" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 font-[family-name:var(--font-bricolage)]">
                      Cantine Municipale
                    </h3>
                  </div>

                  <p className="text-zinc-600 text-base leading-relaxed mb-6">
                    En tant que stagiaire, bénéficiez d&apos;offres exceptionnelles.
                    Déjeunez à la cantine municipale d&apos;Aulnay-sous-Bois à tarif
                    réduit pour des repas équilibrés au quotidien.
                  </p>

                  <div className="mt-auto pt-4 border-t border-zinc-200 flex items-center justify-between gap-3">
                    <span className="eyebrow text-zinc-500 text-[0.65rem]">
                      Aulnay-sous-Bois
                    </span>
                    <ArrowRight
                      size={18}
                      className="text-zinc-400 group-hover:text-[#4CAF50] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 sm:py-20 md:py-24 bg-zinc-950 text-white border-t border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#4CAF50]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <span className="eyebrow text-[#4CAF50] mb-4 block text-[0.7rem]">
              Prêt à nous rejoindre ?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6 font-[family-name:var(--font-bricolage)]">
              Venez visiter notre centre de formation
              <span className="italic font-normal font-[family-name:var(--font-instrument-serif)] text-[#4CAF50]"> à Aulnay-sous-Bois.</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
              Planifiez une visite et découvrez nos installations, nos salles de
              cours équipées et rencontrez notre équipe pédagogique.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-6 sm:px-7 py-3.5 sm:py-4 bg-[#4CAF50] text-white font-bold tracking-wide uppercase text-xs sm:text-sm hover:bg-[#3d9640] transition-all hover:scale-[0.98] group rounded-md"
              >
                <span>Prendre rendez-vous</span>
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <a
                href="tel:0145090935"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 font-medium text-xs sm:text-sm transition-colors rounded-md"
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
