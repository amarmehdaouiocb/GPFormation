"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, MotionValue } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, Clock } from "lucide-react";

interface HeroState2Props {
  title2Opacity: MotionValue<number>;
  title2Y: MotionValue<number>;
  card1Opacity: MotionValue<number>;
  card1Y: MotionValue<number>;
  card2Opacity: MotionValue<number>;
  card2Y: MotionValue<number>;
  card3Opacity: MotionValue<number>;
  card3Y: MotionValue<number>;
  centerCardScale: MotionValue<number>;
  sideCardScale: MotionValue<number>;
  isActive: boolean;
}

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

export default function HeroState2({
  title2Opacity,
  title2Y,
  card1Opacity,
  card1Y,
  card2Opacity,
  card2Y,
  card3Opacity,
  card3Y,
  centerCardScale,
  sideCardScale,
  isActive,
}: HeroState2Props) {
  const cardOpacities = [card1Opacity, card2Opacity, card3Opacity];
  const cardYs = [card1Y, card2Y, card3Y];

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center ${
        !isActive ? "pointer-events-none" : ""
      }`}
    >
      {/* Titre centré */}
      <motion.div
        className="text-center mb-10 px-6"
        style={{
          opacity: title2Opacity,
          y: title2Y,
          willChange: "opacity, transform",
        }}
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
              style={{
                opacity: cardOpacities[i],
                y: cardYs[i],
                scale: isCenter ? centerCardScale : sideCardScale,
                willChange: "opacity, transform",
              }}
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

                  {/* Stat en haut à gauche */}
                  <div className="absolute top-5 left-5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-semibold">
                    {formation.stat}
                  </div>

                  {/* Titre en bas */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl font-bold text-white">
                      {formation.title}
                    </h3>
                  </div>
                </div>

                {/* Badge notification sous la carte */}
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

      {/* Mobile : scroll horizontal (utilise le timing de la 1ère carte) */}
      <motion.div
        className="md:hidden w-full"
        style={{
          opacity: card1Opacity,
          y: card1Y,
          willChange: "opacity, transform",
        }}
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
