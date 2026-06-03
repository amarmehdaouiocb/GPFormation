"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  Lightning,
  Sparkle,
} from "@phosphor-icons/react";
import { useState } from "react";

interface PricingTemplateProps {
  title: string;
  content: string;
}

type Forfait = { label: string; value: string; description?: string };

type Plan = {
  title: string;
  subtitle: string;
  price: string;
  priceOriginal?: string;
  isFromPrice: boolean;
  features: string[];
  forfaits: Forfait[];
  badge?: string;
};

type Category = {
  title: string;
  plans: Plan[];
};

function parsePricingData(markdown: string): Category[] {
  const categories: Category[] = [];
  const categoryBlocks = markdown.split(/\n##\s+/);
  categoryBlocks.shift();

  for (const block of categoryBlocks) {
    const lines = block.split("\n");
    const categoryTitle = lines[0].trim();
    const rest = lines.slice(1).join("\n");
    const planBlocks = rest.split(/\n###\s+/);
    const plans: Plan[] = [];

    for (let i = 1; i < planBlocks.length; i++) {
      const planLines = planBlocks[i].split("\n");
      const planTitle = planLines[0].trim();

      let price = "";
      let priceOriginal = "";
      let isFromPrice = false;
      let subtitle = "";
      let badge = "";
      const features: string[] = [];
      const forfaits: Forfait[] = [];
      let lastForfait: Forfait | null = null;

      for (let j = 1; j < planLines.length; j++) {
        const line = planLines[j].trim();
        if (!line) {
          lastForfait = null;
          continue;
        }

        if (line.startsWith("**")) {
          const cleaned = line.replace(/\*\*/g, "");
          if (/forfait/i.test(cleaned)) {
            const [label, value] = cleaned.split(":").map((s) => s.trim());
            lastForfait = { label, value };
            forfaits.push(lastForfait);
          } else if (cleaned.includes("€")) {
            if (/à partir de/i.test(cleaned)) {
              isFromPrice = true;
              price = cleaned.replace(/à partir de/i, "").trim();
            } else if (cleaned.includes("/")) {
              const m = cleaned.match(/([\d\s]+€)\s*\/\s*([\d\s]+€)/);
              if (m) {
                priceOriginal = m[1].trim();
                price = m[2].trim();
                const b = cleaned.match(/\(([^)]+)\)/);
                if (b) badge = b[1];
              } else {
                price = cleaned;
              }
            } else {
              price = cleaned;
            }
          }
        } else if (line.startsWith("- ")) {
          features.push(line.replace("- ", ""));
          lastForfait = null;
        } else if (lastForfait) {
          lastForfait.description = line;
        } else if (subtitle === "" && price === "") {
          subtitle = line;
        }
      }

      plans.push({
        title: planTitle,
        subtitle,
        price,
        priceOriginal: priceOriginal || undefined,
        isFromPrice,
        features,
        forfaits,
        badge: badge || undefined,
      });
    }

    categories.push({ title: categoryTitle, plans });
  }

  return categories;
}

const TOC_ITEMS = [
  { id: "principal", label: "Formations Taxi & VTC", num: "01" },
  { id: "specifiques", label: "Formations spécifiques", num: "02" },
  { id: "autres", label: "Autres formations", num: "03" },
  { id: "financement", label: "Financement", num: "04" },
];

export default function PricingTemplate({ content }: PricingTemplateProps) {
  const [specificTab, setSpecificTab] = useState<"taxi" | "vtc">("taxi");
  const categories = parsePricingData(content);

  const mainCategory = categories.find((c) =>
    c.title.includes("FORMATION TAXI / VTC"),
  );
  const specificTaxi = categories.find((c) =>
    c.title.includes("SPÉCIFIQUES TAXI"),
  );
  const specificVtc = categories.find((c) =>
    c.title.includes("SPÉCIFIQUES VTC"),
  );
  const otherFormations = categories.find((c) => c.title.includes("AUTRES"));

  const activeSpecific = specificTab === "taxi" ? specificTaxi : specificVtc;

  if (!categories.length) {
    return (
      <div className="container-custom py-32 text-center">
        <h1 className="text-4xl font-bold">Tarifs</h1>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-950 min-h-screen overflow-x-hidden">
      {/* ──────────────────────────────────────────────────────── */}
      {/*  HERO — Editorial Magazine                                */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 md:pt-44 pb-20 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 dot-grid-pattern opacity-50 pointer-events-none" />
        <div className="absolute top-32 right-4 md:right-12 text-right hidden sm:block">
          <div className="eyebrow text-zinc-400 mb-1">Édition 2026</div>
          <div className="font-mono text-[10px] text-zinc-400">
            — Vol.01 · Tarifs & Formules —
          </div>
        </div>

        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-px bg-[#4CAF50]" />
              <span className="eyebrow text-[#4CAF50]">
                Grille tarifaire · GP Formation
              </span>
            </div>

            <h1 className="font-bold tracking-tighter leading-[0.9] text-zinc-950 mb-10 text-[clamp(2.4rem,8vw,7rem)] font-[family-name:var(--font-bricolage)]">
              Tarifs <span className="text-zinc-300">&</span>
              <br />
              formules
            </h1>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed font-light max-w-2xl">
                Une grille transparente. Éligible aux
                financements CPF, OPCO, Pôle Emploi.
              </p>

              <div className="flex flex-wrap gap-2 lg:shrink-0">
                {[
                  { label: "Qualiopi", sub: "Certifié" },
                  { label: "CPF", sub: "Éligible" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex items-baseline gap-2 px-4 py-2.5 border border-zinc-200 rounded-full bg-white"
                  >
                    <span className="font-bold text-zinc-950 text-sm">
                      {b.label}
                    </span>
                    <span className="eyebrow text-zinc-400">{b.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/*  SOMMAIRE                                                */}
      {/* ──────────────────────────────────────────────────────── */}
      <nav
        aria-label="Sommaire"
        className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-y border-zinc-200"
      >
        <div className="container-custom">
          <ul className="flex items-center gap-6 md:gap-10 overflow-x-auto h-14 text-sm">
            <li className="eyebrow text-zinc-400 shrink-0">Sommaire</li>
            {TOC_ITEMS.map((it) => (
              <li key={it.id} className="shrink-0">
                <a
                  href={`#${it.id}`}
                  className="group flex items-baseline gap-2 text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  <span className="font-mono text-[11px] text-zinc-400 group-hover:text-[#4CAF50] transition-colors">
                    /{it.num}
                  </span>
                  <span className="whitespace-nowrap">{it.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────── */}
      {/*  SECTION 01 — FORMATION TAXI / VTC                        */}
      {/* ──────────────────────────────────────────────────────── */}
      {mainCategory && (
        <section
          id="principal"
          className="scroll-mt-20 py-24 md:py-32 bg-white"
        >
          <div className="container-custom">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 mb-14 border-b-2 border-zinc-950">
              <div>
                <div className="eyebrow text-zinc-500 mb-3">Section · 01</div>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-zinc-950 leading-[0.9] font-[family-name:var(--font-bricolage)]">
                  Formation initiale
                  <br />
                  <span className="text-zinc-400">Taxi &amp; VTC</span>
                </h2>
              </div>
              <p className="md:text-right text-zinc-500 max-w-sm leading-relaxed">
                Quatre formules au choix.
                <br />
                Toutes éligibles au CPF et incluant l&apos;accès à
                l&apos;examen.
              </p>
            </header>

            <div className="flex flex-col divide-y divide-zinc-200">
              {mainCategory.plans.map((plan, idx) => {
                const isElearning = /e-?learning/i.test(plan.title);
                return (
                  <motion.article
                    key={idx}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      delay: idx * 0.08,
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group relative"
                  >
                    <div className="grid grid-cols-12 gap-x-6 gap-y-6 py-10 md:py-14 transition-colors duration-300 group-hover:bg-zinc-50 -mx-4 md:-mx-8 px-4 md:px-8 rounded-2xl">
                      {/* Numéro éditorial */}
                      <div className="col-span-6 md:col-span-1 flex md:flex-col items-start gap-3">
                        <span className="font-mono text-xs text-zinc-400 pt-2">
                          /{String(idx + 1).padStart(2, "0")}
                        </span>
                        {isElearning && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#4CAF50] text-white font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">
                            <Lightning size={10} weight="fill" /> Best-seller
                          </span>
                        )}
                      </div>

                      {/* Title / subtitle */}
                      <div className="col-span-12 md:col-span-4 order-2 md:order-none">
                        <h3 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] text-zinc-950 mb-4 leading-[0.95]">
                          {plan.title.replace(/^Formule\s+/i, "")}
                        </h3>
                        {plan.subtitle && (
                          <p className="text-zinc-500 font-light leading-relaxed max-w-xs">
                            {plan.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <div className="col-span-12 md:col-span-4 order-4 md:order-none">
                        <div className="eyebrow text-zinc-400 mb-4">Inclus</div>
                        <ul className="flex flex-col gap-2.5 text-zinc-700">
                          {plan.features.map((f, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-sm md:text-[15px] leading-snug"
                            >
                              <CheckCircle
                                size={16}
                                weight="fill"
                                className="text-[#4CAF50] shrink-0 mt-0.5"
                              />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        {plan.forfaits.length > 0 && (
                          <div className="mt-5 pt-4 border-t border-zinc-200 text-xs text-zinc-500 font-mono space-y-2.5">
                            {plan.forfaits.map((f, i) => (
                              <div key={i}>
                                <div className="flex items-center justify-between gap-4">
                                  <span>{f.label}</span>
                                  <span className="text-zinc-950 font-bold">
                                    {f.value}
                                  </span>
                                </div>
                                {f.description && (
                                  <p className="mt-1 text-[#4CAF50] leading-snug">
                                    {f.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Prix & CTA */}
                      <div className="col-span-6 md:col-span-3 order-3 md:order-none flex flex-col justify-between gap-6 md:items-end md:text-right">
                        <div>
                          {plan.isFromPrice && (
                            <div className="eyebrow text-zinc-400 mb-1">
                              À partir de
                            </div>
                          )}
                          <div className="font-bold font-[family-name:var(--font-bricolage)] text-5xl md:text-6xl lg:text-7xl tracking-[-0.04em] leading-[0.85] text-zinc-950">
                            {plan.price}
                          </div>
                        </div>

                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.2em] text-[11px] text-zinc-950 border-b-2 border-zinc-950 pb-1.5 self-start md:self-end group-hover:border-[#4CAF50] group-hover:text-[#4CAF50] transition-colors"
                        >
                          S&apos;inscrire
                          <ArrowUpRight
                            size={14}
                            weight="bold"
                            className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/*  SECTION 02 — FORMATIONS SPÉCIFIQUES (tabs)               */}
      {/* ──────────────────────────────────────────────────────── */}
      <section
        id="specifiques"
        className="scroll-mt-20 py-24 md:py-32 bg-zinc-950 text-white relative overflow-hidden"
      >
        <div className="noise-overlay opacity-[0.04]" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#4CAF50]/10 blur-3xl pointer-events-none" />

        <div className="container-custom relative">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14">
            <div>
              <div className="eyebrow text-[#4CAF50] mb-3">Section · 02</div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] font-[family-name:var(--font-bricolage)]">
                Formations
                <br />
                <span className="text-zinc-500">spécifiques</span>
              </h2>
            </div>

            {/* Tabs */}
            <div
              role="tablist"
              className="relative inline-flex border border-zinc-700 rounded-full p-1 self-start md:self-end bg-zinc-900/50"
            >
              <div
                aria-hidden="true"
                className="absolute top-1 bottom-1 rounded-full bg-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  left: specificTab === "taxi" ? "4px" : "50%",
                  right: specificTab === "taxi" ? "50%" : "4px",
                }}
              />
              <button
                role="tab"
                aria-selected={specificTab === "taxi"}
                onClick={() => setSpecificTab("taxi")}
                className={`relative z-10 px-6 md:px-8 py-2.5 rounded-full font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                  specificTab === "taxi" ? "text-zinc-950" : "text-zinc-400"
                }`}
              >
                Taxi
              </button>
              <button
                role="tab"
                aria-selected={specificTab === "vtc"}
                onClick={() => setSpecificTab("vtc")}
                className={`relative z-10 px-6 md:px-8 py-2.5 rounded-full font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                  specificTab === "vtc" ? "text-zinc-950" : "text-zinc-400"
                }`}
              >
                VTC
              </button>
            </div>
          </header>

          <div className="border-t border-zinc-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={specificTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeSpecific?.plans.map((plan, i) => (
                  <motion.article
                    key={`${specificTab}-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="group border-b border-zinc-800 py-8 md:py-10 cursor-default transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-6">
                      <div className="flex items-baseline gap-4 min-w-0 flex-1">
                        <span className="font-mono text-xs text-zinc-500 shrink-0">
                          /{String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] text-white leading-tight">
                          {plan.title}
                        </h3>
                        {plan.badge && (
                          <span className="hidden md:inline-block px-2 py-1 bg-[#4CAF50] text-zinc-950 font-mono text-[10px] uppercase tracking-[0.18em] shrink-0">
                            <Sparkle size={10} weight="fill" className="inline mr-1" />
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      {/* Leader dots */}
                      <div className="hidden md:block flex-1 min-w-[40px] relative self-baseline mb-2">
                        <div className="border-t border-dotted border-zinc-700" />
                      </div>

                      {/* Prices */}
                      <div className="flex items-baseline gap-3 shrink-0">
                        {plan.priceOriginal && (
                          <span className="text-zinc-500 line-through font-mono text-base">
                            {plan.priceOriginal}
                          </span>
                        )}
                        <span className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-bricolage)] tracking-[-0.03em] text-white group-hover:text-[#4CAF50] transition-colors">
                          {plan.price}
                        </span>
                      </div>
                    </div>

                    {(plan.subtitle || plan.features.length > 0) && (
                      <div className="md:ml-10 mt-3 space-y-2">
                        {plan.subtitle && (
                          <p className="text-zinc-400 font-light max-w-3xl leading-relaxed">
                            {plan.subtitle}
                          </p>
                        )}
                        {plan.features.length > 0 && (
                          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs md:text-sm text-zinc-500 font-mono">
                            {plan.features.map((f, j) => (
                              <li key={j}>— {f}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-between gap-6 flex-wrap">
            <p className="text-zinc-500 text-sm font-light">
              Besoin d&apos;un conseil pour choisir votre formation ?
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-6 py-3 border border-zinc-700 rounded-full hover:border-[#4CAF50] hover:bg-[#4CAF50] hover:text-zinc-950 transition-colors font-mono text-xs uppercase tracking-[0.2em]"
            >
              Parler à un conseiller
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/*  SECTION 03 — AUTRES FORMATIONS                           */}
      {/* ──────────────────────────────────────────────────────── */}
      {otherFormations && (
        <section id="autres" className="scroll-mt-20 py-24 md:py-32 bg-white">
          <div className="container-custom">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 mb-14 border-b-2 border-zinc-950">
              <div>
                <div className="eyebrow text-zinc-500 mb-3">Section · 03</div>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-zinc-950 leading-[0.9] font-[family-name:var(--font-bricolage)]">
                  Autres
                  <br />
                  <span className="text-zinc-400">formations</span>
                </h2>
              </div>
              <p className="md:text-right text-zinc-500 max-w-sm leading-relaxed">
                Stages de récupération de points
                <br />
                et perfectionnement en anglais
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {otherFormations.plans.map((plan, i) => {
                const isPoints = /points/i.test(plan.title);
                return (
                  <motion.article
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: i * 0.1, duration: 0.7 }}
                    className={`group relative p-8 md:p-10 border-2 border-zinc-950 overflow-hidden transition-all ${
                      isPoints ? "bg-white" : "bg-zinc-950 text-white"
                    }`}
                  >
                    <div
                      className={`absolute -top-8 -right-8 font-[family-name:var(--font-bricolage)] font-bold text-[10rem] leading-none tracking-tighter pointer-events-none select-none ${
                        isPoints ? "text-zinc-100" : "text-white/5"
                      }`}
                    >
                      /0{i + 1}
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <span
                          className={`eyebrow ${
                            isPoints ? "text-[#4CAF50]" : "text-[#4CAF50]"
                          }`}
                        >
                          {isPoints ? "Sécurité routière" : "Langue"}
                        </span>
                      </div>

                      <h3
                        className={`text-3xl md:text-4xl font-bold tracking-[-0.03em] mb-3 leading-tight ${
                          isPoints ? "text-zinc-950" : "text-white"
                        }`}
                      >
                        {plan.title}
                      </h3>

                      {plan.subtitle && (
                        <p
                          className={`mb-8 font-light max-w-sm leading-relaxed ${
                            isPoints ? "text-zinc-500" : "text-zinc-400"
                          }`}
                        >
                          {plan.subtitle}
                        </p>
                      )}

                      <ul className="flex flex-col gap-2.5 mb-10">
                        {plan.features.map((f, j) => (
                          <li
                            key={j}
                            className={`flex items-start gap-2.5 text-sm leading-snug ${
                              isPoints ? "text-zinc-700" : "text-zinc-300"
                            }`}
                          >
                            <span
                              className={`mt-1.5 w-1.5 h-1.5 shrink-0 ${
                                isPoints ? "bg-zinc-950" : "bg-[#4CAF50]"
                              }`}
                            />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <div
                        className={`flex items-end justify-between gap-4 pt-6 border-t ${
                          isPoints ? "border-zinc-200" : "border-zinc-800"
                        }`}
                      >
                        <div>
                          <div
                            className={`eyebrow mb-1 ${
                              isPoints ? "text-zinc-400" : "text-zinc-500"
                            }`}
                          >
                            Tarif
                          </div>
                          <div
                            className={`text-5xl md:text-6xl font-bold font-[family-name:var(--font-bricolage)] tracking-[-0.04em] leading-none ${
                              isPoints ? "text-zinc-950" : "text-white"
                            }`}
                          >
                            {plan.price}
                          </div>
                        </div>
                        <Link
                          href={isPoints ? "/recuperation-de-points" : "/contact"}
                          className={`inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                            isPoints
                              ? "bg-zinc-950 text-white hover:bg-[#4CAF50]"
                              : "bg-[#4CAF50] text-zinc-950 hover:bg-white"
                          }`}
                        >
                          S&apos;inscrire
                          <ArrowUpRight
                            size={12}
                            weight="bold"
                            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/*  SECTION 04 — FINANCEMENT                                 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section
        id="financement"
        className="scroll-mt-20 relative overflow-hidden bg-[#4CAF50] text-white"
      >
        <div className="noise-overlay opacity-[0.08]" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="container-custom relative py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-end">
            <div className="md:col-span-8">
              <div className="eyebrow text-white/70 mb-6">
                Section · 04 — Financement
              </div>
              <h3 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-10 font-[family-name:var(--font-bricolage)]">
                100% éligible
                <br />
                <span className="text-white/75">CPF &amp; OPCO</span>.
              </h3>
              <p className="text-lg md:text-xl text-white/85 font-light max-w-xl leading-relaxed">
                CPF, Pôle Emploi, OPCO… On construit avec vous un plan
                adapté, directement avec notre organisme.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col gap-5 md:items-end">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-between gap-4 w-full md:w-auto bg-zinc-950 text-white px-7 py-5 md:px-8 md:py-6 hover:bg-white hover:text-zinc-950 transition-colors font-mono text-xs md:text-sm uppercase tracking-[0.2em]"
              >
                Demande de financement
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <div className="flex flex-wrap md:justify-end gap-1.5">
                {["CPF", "OPCO", "Pôle Emploi"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 border border-white/30 rounded-full font-mono text-[10px] uppercase tracking-[0.2em] text-white/85"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-banner — numéros CPF */}
        <div className="border-t border-white/20 bg-[#2E7D32]/30">
          <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm">
            <div className="font-light text-white/85 text-center">
              Un financement sur mesure en moins de{" "}
              <span className="font-bold text-white">48h</span>.
            </div>
            <Link
              href="/contact"
              className="font-mono text-white/90 hover:text-white transition-colors uppercase tracking-[0.18em] inline-flex items-center gap-2"
            >
              Contact
              <ArrowUpRight size={12} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
