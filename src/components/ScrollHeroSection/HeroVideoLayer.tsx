"use client";

import { useState } from "react";
import { motion, MotionValue } from "framer-motion";

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
