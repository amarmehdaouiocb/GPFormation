"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function HeroState1({ heroState }: { heroState: 1 | 2 }) {
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
      </div>

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
