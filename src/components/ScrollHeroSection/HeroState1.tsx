"use client";

import Link from "next/link";
import { motion, MotionValue } from "framer-motion";
import { CheckCircle2, Users } from "lucide-react";

interface HeroState1Props {
  title1Opacity: MotionValue<number>;
  title1X: MotionValue<number>;
  floatingCardOpacity: MotionValue<number>;
  floatingCardY: MotionValue<number>;
  notifOpacity: MotionValue<number>;
  isActive: boolean;
}

export default function HeroState1({
  title1Opacity,
  title1X,
  floatingCardOpacity,
  floatingCardY,
  notifOpacity,
  isActive,
}: HeroState1Props) {
  return (
    <div
      className={`absolute inset-0 flex items-center ${
        !isActive ? "pointer-events-none" : ""
      }`}
    >
      <div className="container-custom w-full">
        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-12">
          {/* Gauche : Titre + Sous-titre + CTA */}
          <motion.div
            className="max-w-3xl flex flex-col items-center md:items-start"
            style={{
              opacity: title1Opacity,
              x: title1X,
              willChange: "opacity, transform",
            }}
          >
            <h1 className="text-[2.5rem] leading-[1] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter text-white mb-6 text-center md:text-left">
              L&apos;excellence{" "}
              <br className="hidden sm:block" />
              de la formation{" "}
              <br />
              <span className="text-[#7ED321]">TAXI & VTC.</span>
            </h1>

            <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg leading-relaxed font-light text-center md:text-left">
              Le 1er centre agréé en Île-de-France. Formez-vous avec des
              experts et donnez un nouvel élan à votre carrière.
            </p>

            <Link
              href="/formation-taxi"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-zinc-950 font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-full shadow-2xl"
            >
              S&apos;inscrire maintenant
            </Link>
          </motion.div>

          {/* Droite : Carte glassmorphism flottante (desktop) */}
          <motion.div
            className="hidden lg:flex flex-col gap-6 items-end"
            style={{
              opacity: floatingCardOpacity,
              y: floatingCardY,
              willChange: "opacity, transform",
            }}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-white w-72 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 size={20} className="text-[#7ED321]" />
                <span className="eyebrow text-white/60">Taux de réussite</span>
              </div>
              <p className="text-5xl font-bold font-mono tracking-tighter">
                92<span className="text-[#7ED321]">%</span>
              </p>
              <p className="text-sm text-white/50 mt-2">Moyenne 2024</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Badge notification en bas (desktop) */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl"
        style={{ opacity: notifOpacity, willChange: "opacity" }}
      >
        <div className="w-10 h-10 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
          <Users size={20} className="text-[#4CAF50]" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">
            +6 000 candidats formés
          </p>
          <p className="text-xs text-zinc-500">
            Depuis 2013 — Aulnay-sous-Bois
          </p>
        </div>
      </motion.div>
    </div>
  );
}
