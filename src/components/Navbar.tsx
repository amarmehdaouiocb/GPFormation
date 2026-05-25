"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, CaretDown, ArrowUpRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import BookingWidget from "./BookingWidget";

type FormationStats = {
  reussite: string;
  financements: string;
  sessions: string;
};

type FormationItem = {
  name: string;
  href: string;
  description: string;
  meta: string;
  stats?: FormationStats;
};

const formationsTaxi: FormationItem[] = [
  {
    name: "Formation Initiale TAXI",
    href: "/formation-taxi/formation-initiale",
    description: "Préparation à la réussite à l'examen.",
    meta: "90 h",
    stats: {
      reussite: "92 %",
      financements: "CPF · OPCO",
      sessions: "Chaque mois",
    },
  },
  {
    name: "Formation Continue TAXI",
    href: "/formation-taxi/formation-continue",
    description: "Stage obligatoire de renouvellement tous les 5 ans.",
    meta: "14 h",
    stats: {
      reussite: "100 %",
      financements: "FAFCEA · Pôle Emploi",
      sessions: "Chaque semaine",
    },
  },
  {
    name: "Formation à la mobilité TAXI",
    href: "/formation-taxi/formation-mobilite",
    description: "Stage permettant l'obtention d'un nouveau département.",
    meta: "14 h",
    stats: {
      reussite: "100 %",
      financements: "FAFCEA · Pôle Emploi",
      sessions: "Chaque mois",
    },
  },
  {
    name: "Passerelle VTC → TAXI",
    href: "/formation-taxi/formation-passerelle",
    description: "Préparation à la réussite à l'examen TAXI.",
    meta: "18 h",
    stats: {
      reussite: "95 %",
      financements: "CPF · OPCO",
      sessions: "Chaque mois",
    },
  },
];

const formationsVtc: FormationItem[] = [
  {
    name: "Formation Initiale VTC",
    href: "/formation-vtc/formation-initiale",
    description: "Préparation complète à l'examen et à la carte VTC.",
    meta: "105 h",
    stats: {
      reussite: "92 %",
      financements: "CPF · OPCO",
      sessions: "Chaque mois",
    },
  },
  {
    name: "Formation Continue VTC",
    href: "/formation-vtc/formation-continue",
    description: "Renouvellement quinquennal obligatoire des chauffeurs.",
    meta: "14 h",
    stats: {
      reussite: "100 %",
      financements: "FAFCEA · Pôle Emploi",
      sessions: "Chaque semaine",
    },
  },
  {
    name: "Passerelle TAXI → VTC",
    href: "/formation-vtc/formation-passerelle",
    description: "Obtenez votre carte VTC rapidement en tant que taxi.",
    meta: "Express",
    stats: {
      reussite: "95 %",
      financements: "CPF · OPCO",
      sessions: "Chaque mois",
    },
  },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b",
          "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isTransparent
            ? "bg-transparent border-transparent py-8"
            : isScrolled
              ? "bg-white/95 backdrop-blur-sm border-zinc-200 py-3 shadow-sm"
              : "bg-white border-transparent py-6"
        )}
      >
        <div className="container-custom flex items-center justify-between">
          {/* Logo — couleurs originales */}
          <Link href="/" className="relative flex items-center gap-2 z-50 group">
            <Image
              src="/logo_gpformation_clean.png"
              alt="Grand Paris Formation Logo"
              width={320}
              height={90}
              className="w-auto h-20 md:h-24 object-contain transition-all duration-300 group-hover:scale-105 origin-left"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('taxi')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <NavTrigger
                label="Formations TAXI"
                open={activeDropdown === 'taxi'}
                active={pathname.startsWith('/formation-taxi')}
                isTransparent={isTransparent}
              />
              <AnimatePresence>
                {activeDropdown === 'taxi' && (
                  <FormationsDropdown
                    kind="taxi"
                    title="Formations TAXI"
                    items={formationsTaxi}
                  />
                )}
              </AnimatePresence>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('vtc')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <NavTrigger
                label="Formations VTC"
                open={activeDropdown === 'vtc'}
                active={pathname.startsWith('/formation-vtc')}
                isTransparent={isTransparent}
              />
              <AnimatePresence>
                {activeDropdown === 'vtc' && (
                  <FormationsDropdown
                    kind="vtc"
                    title="Formations VTC"
                    tagline="Présentiel, distanciel ou cours du soir — vous choisissez."
                    items={formationsVtc}
                  />
                )}
              </AnimatePresence>
            </div>

            <NavItem
              href="/recuperation-de-points"
              label="Récupération de points"
              active={pathname === '/recuperation-de-points'}
              isTransparent={isTransparent}
            />
            <NavItem
              href="/tarifs"
              label="Tarifs"
              active={pathname === '/tarifs'}
              isTransparent={isTransparent}
            />
            <NavItem
              href="/services"
              label="Services"
              active={pathname === '/services'}
              isTransparent={isTransparent}
            />
            <NavItem
              href="/contact"
              label="Contact"
              active={pathname === '/contact'}
              isTransparent={isTransparent}
            />
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className={cn("lg:hidden z-50 p-2 -mr-2 transition-colors", isTransparent ? "text-white" : "text-black")}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={28} weight="light" className={cn(isTransparent && "text-black")} /> : <List size={28} weight="light" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-white flex flex-col pt-32 px-6 pb-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-8 flex-1 max-w-lg mx-auto w-full">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.15em]">TAXI</h3>
                <div className="flex flex-col gap-3">
                  {formationsTaxi.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-zinc-100" />

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.15em]">VTC</h3>
                <div className="flex flex-col gap-3">
                  {formationsVtc.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-zinc-100" />

              <div className="flex flex-col gap-3">
                <Link href="/recuperation-de-points" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">Récupération de points</Link>
                <Link href="/tarifs" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">Tarifs</Link>
                <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">Services</Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">Contact</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <BookingWidget />
    </>
  );
}

type DropdownKind = "taxi" | "vtc";

const DEFAULT_STATS: FormationStats = {
  reussite: "98 %",
  financements: "CPF · OPCO",
  sessions: "Chaque semaine",
};

function FormationsDropdown({
  kind,
  title,
  tagline,
  items,
}: {
  kind: DropdownKind;
  title: string;
  tagline?: string;
  items: FormationItem[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
  const indexLabel = kind === "taxi" ? "01 — TAXI" : "02 — VTC";
  const rootHref = kind === "taxi" ? "/formation-taxi" : "/formation-vtc";
  const activeStats =
    (hoveredIndex !== null ? items[hoveredIndex]?.stats : null) ??
    DEFAULT_STATS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-0 pt-4 w-[640px] z-50"
    >
      {/* Pont invisible pour garder le hover actif */}
      <div className="absolute inset-x-0 top-0 h-4" aria-hidden />

      <div className="relative overflow-hidden rounded-2xl bg-white border border-zinc-200/80 shadow-[0_24px_60px_-30px_rgba(9,9,11,0.35),0_10px_24px_-20px_rgba(9,9,11,0.2)]">
        {/* Dot grid atmosphérique */}
        <div
          aria-hidden
          className="dot-grid-pattern absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_top_right,black,transparent_55%)]"
        />
        {/* Barre d'accent supérieure */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4CAF50]/60 to-transparent" />

        <div className="relative grid grid-cols-[1fr_240px]">
          {/* Colonne principale — liste éditoriale */}
          <div className="p-6 pr-4">
            <div className="flex items-baseline justify-between mb-5">
              <span
                className="text-[10px] uppercase tracking-[0.24em] text-zinc-400"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {indexLabel}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                {items.length} parcours
              </span>
            </div>

            <ul className="flex flex-col">
              {items.map((item, i) => {
                const isActive = hoveredIndex === i;
                return (
                  <li key={item.href} className="relative">
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.32,
                        delay: 0.04 + i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onMouseEnter={() => setHoveredIndex(i)}
                        className="group/item relative block pl-5 pr-3 py-3.5 -mx-2 rounded-lg transition-colors duration-300"
                      >
                        {/* Indicateur vertical */}
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full bg-[#4CAF50] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                            isActive ? "h-8 opacity-100" : "h-0 opacity-0"
                          )}
                        />

                        <div className="flex items-start gap-4">
                          {/* Numéro */}
                          <span
                            className={cn(
                              "text-[10px] leading-[1.7] tracking-[0.15em] transition-colors duration-300 pt-[3px]",
                              isActive ? "text-[#4CAF50]" : "text-zinc-300"
                            )}
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <h4
                                className={cn(
                                  "text-[15px] font-medium tracking-[-0.01em] transition-colors duration-300",
                                  isActive ? "text-zinc-950" : "text-zinc-700"
                                )}
                              >
                                {item.name}
                              </h4>
                              <ArrowUpRight
                                size={14}
                                weight="regular"
                                className={cn(
                                  "shrink-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                  isActive
                                    ? "opacity-100 translate-x-0 -translate-y-0 text-[#4CAF50]"
                                    : "opacity-0 -translate-x-1 translate-y-1 text-zinc-400"
                                )}
                              />
                            </div>
                            <p
                              className={cn(
                                "text-[12.5px] leading-relaxed mt-1 transition-colors duration-300",
                                isActive ? "text-zinc-500" : "text-zinc-400"
                              )}
                            >
                              {item.description}
                            </p>
                            <span
                              className={cn(
                                "inline-block mt-1.5 text-[10px] uppercase tracking-[0.18em] transition-colors duration-300",
                                isActive ? "text-zinc-500" : "text-zinc-300"
                              )}
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {item.meta}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Colonne latérale — contexte & CTA */}
          <aside
            className="relative border-l border-zinc-100 bg-gradient-to-b from-zinc-50/60 via-white to-white p-6 flex flex-col"
            onMouseEnter={() => setHoveredIndex(null)}
          >
            <div className="flex-1">
              <span
                className="text-[10px] uppercase tracking-[0.24em] text-[#4CAF50]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Centre agréé
              </span>
              <h3
                className="mt-3 text-[22px] leading-[1.05] tracking-[-0.03em] font-semibold text-zinc-950"
                style={{ fontFamily: "var(--font-bricolage), var(--font-sans)" }}
              >
                {title}
              </h3>
              {tagline && (
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-zinc-500">
                  {tagline}
                </p>
              )}

              <div className="mt-5 pt-5 border-t border-dashed border-zinc-200 space-y-2.5">
                <Stat label="Réussite" value={activeStats.reussite} />
                <Stat label="Financements" value={activeStats.financements} />
                <Stat label="Sessions" value={activeStats.sessions} />
              </div>
            </div>

            <Link
              href={rootHref}
              className="group/cta mt-6 relative inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-zinc-950 text-white overflow-hidden"
            >
              <span className="relative z-10 text-[11.5px] uppercase tracking-[0.18em] font-medium">
                Voir tout
              </span>
              <ArrowUpRight
                size={14}
                weight="bold"
                className="relative z-10 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              />
              <span className="absolute inset-0 bg-[#4CAF50] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-y-0" />
            </Link>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className="text-[10px] uppercase tracking-[0.18em] text-zinc-400"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <span className="text-[12px] font-medium tracking-[-0.01em] text-zinc-800">
        {value}
      </span>
    </div>
  );
}

const SPLIT_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function SplitLabel({ label }: { label: string }) {
  return (
    <span className="relative inline-block overflow-hidden align-middle py-[3px] -my-[3px]">
      <span
        className="block transition-transform duration-[520ms] will-change-transform group-hover/nav:-translate-y-full"
        style={{ transitionTimingFunction: SPLIT_EASE }}
      >
        {label}
      </span>
      <span
        className="absolute inset-0 flex items-center translate-y-full transition-transform duration-[520ms] will-change-transform group-hover/nav:translate-y-0"
        style={{ transitionTimingFunction: SPLIT_EASE }}
        aria-hidden
      >
        {label}
      </span>
    </span>
  );
}

function NavUnderline({
  active,
  isTransparent,
}: {
  active: boolean;
  isTransparent: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-0 right-0 bottom-[3px] h-[1.5px] origin-left transition-transform duration-[520ms] will-change-transform",
        active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100",
        isTransparent ? "bg-white" : "bg-[#4CAF50]"
      )}
      style={{ transitionTimingFunction: SPLIT_EASE }}
    />
  );
}

function NavItem({
  href,
  label,
  active,
  isTransparent,
}: {
  href: string;
  label: string;
  active: boolean;
  isTransparent: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative inline-flex items-center text-[13px] font-normal uppercase tracking-[0.12em] py-2 transition-colors duration-300",
        isTransparent
          ? active
            ? "text-white"
            : "text-white/70 hover:text-white"
          : active
            ? "text-zinc-950"
            : "text-zinc-500 hover:text-zinc-950"
      )}
    >
      <SplitLabel label={label} />
      <NavUnderline active={active} isTransparent={isTransparent} />
    </Link>
  );
}

function NavTrigger({
  label,
  open,
  active,
  isTransparent,
}: {
  label: string;
  open: boolean;
  active: boolean;
  isTransparent: boolean;
}) {
  const underlineActive = open || active;
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      className={cn(
        "group/nav relative inline-flex items-center gap-1.5 text-[13px] font-normal uppercase tracking-[0.12em] py-2 transition-colors duration-300",
        isTransparent
          ? underlineActive
            ? "text-white"
            : "text-white/70 hover:text-white"
          : underlineActive
            ? "text-zinc-950"
            : "text-zinc-500 hover:text-zinc-950"
      )}
    >
      <SplitLabel label={label} />
      <CaretDown
        size={11}
        weight="bold"
        className={cn(
          "transition-all duration-[520ms]",
          open ? "rotate-180 translate-y-[1px]" : "group-hover/nav:translate-y-[1px]"
        )}
        style={{ transitionTimingFunction: SPLIT_EASE }}
      />
      <NavUnderline active={underlineActive} isTransparent={isTransparent} />
    </button>
  );
}
