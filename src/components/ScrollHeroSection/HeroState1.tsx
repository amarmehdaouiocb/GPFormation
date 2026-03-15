"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, MotionValue } from "framer-motion";
import { CheckCircle2, Users, ChevronDown } from "lucide-react";

interface HeroState1Props {
  title1Opacity: MotionValue<number>;
  title1X: MotionValue<number>;
  title1Y: MotionValue<number>;
  floatingCardOpacity: MotionValue<number>;
  floatingCardY: MotionValue<number>;
  notifOpacity: MotionValue<number>;
  scrollIndicatorOpacity: MotionValue<number>;
  isActive: boolean;
}

function useAnimatedCounter(target: number, duration = 2000, delay = 400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let rafId: number;

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    }

    const timeout = setTimeout(() => {
      rafId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
    };
  }, [target, duration, delay]);

  return value;
}

export default function HeroState1({
  title1Opacity,
  title1X,
  title1Y,
  floatingCardOpacity,
  floatingCardY,
  notifOpacity,
  scrollIndicatorOpacity,
  isActive,
}: HeroState1Props) {
  const animatedPercent = useAnimatedCounter(92);

  return (
    <div
      className={`absolute inset-0 flex items-center ${
        !isActive ? "pointer-events-none" : ""
      }`}
    >
      <div className="container-custom w-full">
        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-12">
          {/* Gauche : Titre + Sous-titre + CTA (parallaxe Y) */}
          <motion.div
            className="max-w-3xl flex flex-col items-center md:items-start"
            style={{
              opacity: title1Opacity,
              x: title1X,
              y: title1Y,
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

          {/* Droite : Carte glassmorphism avec compteur animé (desktop) */}
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
                {animatedPercent}
                <span className="text-[#7ED321]">%</span>
              </p>
              <p className="text-sm text-white/50 mt-2">Moyenne 2024</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Badge notification (desktop) */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl"
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

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
        style={{ opacity: scrollIndicatorOpacity }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={24} className="text-white/40" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </div>
  );
}
