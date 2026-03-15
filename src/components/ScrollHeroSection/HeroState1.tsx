"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FONT_OPTIONS = [
  {
    name: "Outfit",
    label: "Actuel — Géométrique",
    family: "var(--font-outfit), sans-serif",
    weight: 800,
    tracking: "-0.04em",
  },
  {
    name: "Clash Display",
    label: "Fashion × Auto",
    family: "'Clash Display', sans-serif",
    weight: 600,
    tracking: "-0.03em",
  },
  {
    name: "Instrument Serif",
    label: "Luxury Editorial",
    family: "var(--font-instrument-serif), serif",
    weight: 400,
    tracking: "-0.02em",
  },
  {
    name: "Bricolage Grotesque",
    label: "Modern Editorial",
    family: "var(--font-bricolage), sans-serif",
    weight: 800,
    tracking: "-0.04em",
  },
  {
    name: "Syne",
    label: "Bold & Artistic",
    family: "var(--font-syne), sans-serif",
    weight: 800,
    tracking: "-0.03em",
  },
];

export default function HeroState1({ heroState }: { heroState: 1 | 2 }) {
  const [fontIndex, setFontIndex] = useState(0);
  const currentFont = FONT_OPTIONS[fontIndex];

  return (
    <div
      className={`absolute inset-0 flex items-center ${
        heroState !== 1 ? "pointer-events-none" : ""
      }`}
    >
      <div className="container-custom w-full">
        <motion.div
          className="max-w-3xl flex flex-col items-center md:items-start"
          initial={false}
          animate={
            heroState === 1
              ? { opacity: 1, x: 0, y: 0 }
              : { opacity: 0, x: -80, y: -40 }
          }
          transition={
            heroState === 2
              ? { duration: 1, ease: EASE }
              : { duration: 1.2, ease: EASE, delay: 0.4 }
          }
          style={{ willChange: "opacity, transform" }}
        >
          <h1
            className="text-[2.5rem] leading-[0.88] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem] text-white mb-8 text-center md:text-left"
            style={{
              fontFamily: currentFont.family,
              fontWeight: currentFont.weight,
              letterSpacing: currentFont.tracking,
              textShadow:
                "0 1px 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2), 0 12px 48px rgba(0,0,0,0.15)",
            }}
          >
            L&apos;excellence{" "}
            <br className="hidden sm:block" />
            de la formation{" "}
            <br />
            <span className="text-[#7ED321]">TAXI & VTC.</span>
          </h1>

          <p
            className="text-[1.0625rem] md:text-lg text-white/90 mb-10 max-w-md leading-[1.75] font-light tracking-[0.015em] text-center md:text-left"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
          >
            Le 1er centre agréé en Île-de-France. Formez-vous avec des
            experts et donnez un nouvel élan à votre carrière.
          </p>

          <Link
            href="/formation-taxi"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-zinc-950 font-semibold uppercase tracking-[0.2em] text-[13px] hover:scale-105 transition-transform rounded-full shadow-2xl"
          >
            S&apos;inscrire maintenant
          </Link>
        </motion.div>
      </div>

      {/* Font Tester — supprimer après validation */}
      {heroState === 1 && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-5 min-w-[260px] border border-white/10 shadow-2xl">
            <div className="text-[11px] font-normal uppercase tracking-[0.15em] text-white/40 mb-3">
              Test typographie hero
            </div>
            <div className="flex flex-col gap-1">
              {FONT_OPTIONS.map((font, i) => (
                <button
                  key={font.name}
                  onClick={() => setFontIndex(i)}
                  className={`text-left px-3.5 py-2.5 rounded-xl text-[13px] transition-all ${
                    i === fontIndex
                      ? "bg-white text-zinc-950 font-medium"
                      : "text-white/70 hover:bg-white/10 font-normal"
                  }`}
                >
                  <span className="block">{font.name}</span>
                  <span
                    className={`text-[11px] ${
                      i === fontIndex ? "text-zinc-500" : "text-white/30"
                    }`}
                  >
                    {font.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
        initial={false}
        animate={{ opacity: heroState === 1 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
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
