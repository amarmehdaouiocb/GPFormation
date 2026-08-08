"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarBlank, Sparkle, Clock } from "@phosphor-icons/react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const GENERATED_IMAGE_BASE = "/images/gpformation-generated";

const formations = [
  {
    title: "Formation TAXI",
    image: `${GENERATED_IMAGE_BASE}/formation-taxi-card.webp`,
    stat: "Sessions chaque mois",
    badge: "Prochaine session — Avril 2026",
    BadgeIcon: CalendarBlank,
    href: "/formation-taxi",
    highlight: false,
  },
  {
    title: "Formation VTC",
    image: "/images/vtc-berline-noire.jpg",
    stat: "+6 000 formés",
    badge: "Inscriptions ouvertes",
    BadgeIcon: Sparkle,
    href: "/formation-vtc",
    highlight: true,
  },
  {
    title: "Récup. de points",
    image: `${GENERATED_IMAGE_BASE}/stage-points-road-safety-training.webp`,
    stat: "4 pts en 24h",
    badge: "Chaque mois — Places limitées",
    BadgeIcon: Clock,
    href: "/recuperation-de-points",
    highlight: false,
  },
];

export default function HeroState2({ heroState }: { heroState: 1 | 2 }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center ${
        heroState !== 2 ? "pointer-events-none" : ""
      }`}
    >
      {/* Titre centré */}
      <motion.div
        className="text-center mb-6 px-6"
        initial={false}
        animate={
          heroState === 2
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 50 }
        }
        transition={
          heroState === 2
            ? { duration: 1, ease: EASE, delay: 0.5 }
            : { duration: 0.6, ease: EASE }
        }
        style={{ willChange: "opacity, transform" }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-[-0.04em] text-zinc-950 mb-3">
          Choisissez votre{" "}
          <span className="text-[#4CAF50]">formation</span>
        </h2>
        <p className="text-base md:text-lg text-zinc-500 max-w-lg mx-auto mb-6 font-light tracking-[0.01em]">
          Des programmes certifiés Qualiopi, adaptés à votre rythme et vos
          objectifs.
        </p>
        <Link
          href="/tarifs"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-950 text-white font-medium uppercase tracking-[0.12em] text-[13px] rounded-full hover:bg-zinc-800 transition-colors"
        >
          Voir les tarifs <ArrowRight size={16} />
        </Link>
      </motion.div>

      {/* Desktop : 3 cartes grand format cinématique */}
      <div className="hidden lg:flex items-end justify-center gap-5 w-full max-w-[1500px] mx-auto px-10">
        {formations.map((formation, i) => {
          const isCenter = i === 1;
          return (
            <motion.div
              key={formation.href}
              className={isCenter ? "flex-[1.12]" : "flex-1"}
              initial={false}
              animate={
                heroState === 2
                  ? { opacity: 1, y: 0, scale: isCenter ? 1 : 0.97 }
                  : { opacity: 0, y: 60, scale: isCenter ? 1.05 : 0.88 }
              }
              transition={
                heroState === 2
                  ? { duration: 1, ease: EASE, delay: 0.6 + i * 0.12 }
                  : { duration: 0.5, ease: EASE }
              }
              style={{ willChange: "opacity, transform" }}
            >
              <Link href={formation.href} className="group block">
                <div
                  className={`relative rounded-2xl overflow-hidden ${
                    isCenter ? "h-[480px] xl:h-[520px]" : "h-[430px] xl:h-[470px]"
                  } ${
                    isCenter
                      ? "ring-2 ring-[#4CAF50] ring-offset-4 ring-offset-white"
                      : ""
                  }`}
                >
                  <Image
                    src={formation.image}
                    alt={formation.title}
                    fill
                    sizes="(min-width: 1280px) 480px, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-5 left-5 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm font-semibold">
                    {formation.stat}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {formation.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <formation.BadgeIcon size={14} weight="duotone" className="text-white/70" />
                      <span>{formation.badge}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile : cartes empilées */}
      <motion.div
        className="lg:hidden w-full max-h-[calc(100dvh-14rem)] overflow-y-auto overscroll-contain px-6 scrollbar-hide"
        initial={false}
        animate={
          heroState === 2
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 40 }
        }
        transition={
          heroState === 2
            ? { duration: 1, ease: EASE, delay: 0.6 }
            : { duration: 0.5, ease: EASE }
        }
        style={{ willChange: "opacity, transform" }}
      >
        <div className="flex w-full max-w-sm mx-auto flex-col gap-4 pb-4">
          {formations.map((formation) => (
            <Link
              key={formation.href}
              href={formation.href}
              className="group block w-full"
            >
              <div className="relative rounded-2xl overflow-hidden w-full h-[150px] sm:h-[180px]">
                <Image
                  src={formation.image}
                  alt={formation.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5 text-white text-xs font-semibold">
                  {formation.stat}
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {formation.title}
                  </h3>
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <formation.BadgeIcon size={12} weight="duotone" className="text-white/70" />
                    <span>{formation.badge}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
