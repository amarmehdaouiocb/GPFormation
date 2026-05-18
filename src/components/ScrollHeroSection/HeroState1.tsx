"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";

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
          <h1
            className="text-[2.5rem] leading-[0.88] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem] text-white mb-8 text-center md:text-left"
            style={{
              fontFamily: "var(--font-bricolage), sans-serif",
              fontWeight: 800,
              letterSpacing: 0,
              textShadow:
                "0 1px 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2), 0 12px 48px rgba(0,0,0,0.15)",
            }}
          >
            L&apos;excellence{" "}
            <br className="hidden sm:block" />
            de la formation{" "}
            <br />
            <span className="text-[#7ED321]">TAXI & VTC</span>
          </h1>

          <p
            className="text-[1.0625rem] md:text-lg text-white/90 mb-10 max-w-md leading-[1.75] font-light tracking-[0.015em] text-center md:text-left"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
          >
            Formez-vous avec des experts et donnez un nouvel élan
            à votre carrière.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-zinc-950 font-semibold uppercase tracking-[0.2em] text-[13px] hover:scale-105 transition-transform rounded-full shadow-2xl"
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
          <CaretDown size={24} className="text-white/40" weight="light" />
        </motion.div>
      </motion.div>
    </div>
  );
}
