"use client";

import { useState } from "react";
import { motion, MotionValue } from "framer-motion";

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

interface HeroVideoLayerProps {
  videoOpacity: MotionValue<number>;
  videoScale: MotionValue<number>;
  bgWhiteOpacity: MotionValue<number>;
}

export default function HeroVideoLayer({
  videoOpacity,
  videoScale,
  bgWhiteOpacity,
}: HeroVideoLayerProps) {
  const [isFading, setIsFading] = useState(false);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    if (video.duration - video.currentTime < 0.8) {
      setIsFading(true);
    } else if (video.currentTime < 0.5) {
      setIsFading(false);
    }
  };

  return (
    <>
      {/* Video Background */}
      <motion.div
        className="absolute inset-0 bg-zinc-950"
        style={{
          opacity: videoOpacity,
          scale: videoScale,
          willChange: "opacity, transform",
        }}
      >
        <video
          src="/videos/gpformation-hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark overlay pour contraste texte */}
        <div className="absolute inset-0 bg-black/35 pointer-events-none" />

        {/* Grain cinématique */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundSize: "256px 256px",
            opacity: 0.06,
          }}
        />

        {/* Gradient bas pour contraste badge notification */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Overlay de fondu pour boucle vidéo fluide */}
        <div
          className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-700 ease-in-out ${
            isFading ? "opacity-100" : "opacity-0"
          }`}
        />
      </motion.div>

      {/* Fond blanc (apparaît pendant la transition) */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        style={{ opacity: bgWhiteOpacity, willChange: "opacity" }}
      />
    </>
  );
}
