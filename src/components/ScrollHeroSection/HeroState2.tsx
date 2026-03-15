"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, Clock } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const formations = [
  {
    title: "Formation TAXI",
    image: "/images/taxi-parisien.jpg",
    stat: "92% réussite",
    badge: "Prochaine session — Avril 2026",
    BadgeIcon: Calendar,
    href: "/formation-taxi",
    highlight: false,
  },
  {
    title: "Formation VTC",
    image: "/images/vtc-berline-noire.jpg",
    stat: "+6 000 formés",
    badge: "Inscriptions ouvertes",
    BadgeIcon: Sparkles,
    href: "/formation-vtc",
    highlight: true,
  },
  {
    title: "Récup. de points",
    image: "/images/conduite-volant.jpg",
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
        className="text-center mb-10 px-6"
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
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-zinc-950 mb-4">
          Choisissez votre{" "}
          <span className="text-[#4CAF50]">formation</span>
        </h2>
        <p className="text-base md:text-lg text-zinc-500 max-w-xl mx-auto mb-8 font-light">
          Des programmes certifiés Qualiopi, adaptés à votre rythme et vos
          objectifs.
        </p>
        <Link
          href="/tarifs"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-zinc-950 text-white font-semibold text-sm rounded-full hover:bg-zinc-800 transition-colors"
        >
          Voir les tarifs <ArrowRight size={16} />
        </Link>
      </motion.div>

      {/* Desktop : 3 cartes staggerées */}
      <div className="hidden md:flex items-end justify-center gap-6 px-6">
        {formations.map((formation, i) => {
          const isCenter = i === 1;
          return (
            <motion.div
              key={formation.href}
              initial={false}
              animate={
                heroState === 2
                  ? { opacity: 1, y: 0, scale: isCenter ? 1 : 0.95 }
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
                  className={`relative rounded-3xl overflow-hidden ${
                    isCenter
                      ? "w-[320px] h-[420px]"
                      : "w-[280px] h-[360px]"
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
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-5 left-5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-semibold">
                    {formation.stat}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl font-bold text-white">
                      {formation.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-lg border border-zinc-100 mt-4">
                  <formation.BadgeIcon
                    size={16}
                    className="text-[#4CAF50] shrink-0"
                  />
                  <span className="text-sm font-medium text-zinc-700 truncate">
                    {formation.badge}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile : scroll horizontal */}
      <motion.div
        className="md:hidden w-full"
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
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-6">
          {formations.map((formation) => (
            <Link
              key={formation.href}
              href={formation.href}
              className="group snap-center shrink-0"
            >
              <div className="relative rounded-2xl overflow-hidden w-[260px] h-[340px]">
                <Image
                  src={formation.image}
                  alt={formation.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-semibold">
                  {formation.stat}
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {formation.title}
                  </h3>
                  <p className="text-xs text-white/70">{formation.badge}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
