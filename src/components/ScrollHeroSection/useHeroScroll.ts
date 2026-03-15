"use client";

import { RefObject } from "react";
import { useScroll, useTransform, MotionValue } from "framer-motion";

export interface HeroScrollValues {
  scrollYProgress: MotionValue<number>;
  videoOpacity: MotionValue<number>;
  videoScale: MotionValue<number>;
  bgWhiteOpacity: MotionValue<number>;
  title1Opacity: MotionValue<number>;
  title1X: MotionValue<number>;
  floatingCardOpacity: MotionValue<number>;
  floatingCardY: MotionValue<number>;
  notifOpacity: MotionValue<number>;
  title2Opacity: MotionValue<number>;
  title2Y: MotionValue<number>;
  cardsOpacity: MotionValue<number>;
  cardsY: MotionValue<number>;
  centerCardScale: MotionValue<number>;
  sideCardScale: MotionValue<number>;
}

export function useHeroScroll(
  containerRef: RefObject<HTMLDivElement | null>
): HeroScrollValues {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // --- Video layer ---
  const videoOpacity = useTransform(scrollYProgress, [0, 0.2, 0.35], [1, 1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);
  const bgWhiteOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  // --- State 1 : titre gauche + éléments flottants ---
  const title1Opacity = useTransform(scrollYProgress, [0, 0.18, 0.32], [1, 1, 0]);
  const title1X = useTransform(scrollYProgress, [0.18, 0.32], [0, -80]);
  const floatingCardOpacity = useTransform(scrollYProgress, [0, 0.15, 0.28], [1, 1, 0]);
  const floatingCardY = useTransform(scrollYProgress, [0, 0.28], [0, -20]);
  const notifOpacity = useTransform(scrollYProgress, [0, 0.12, 0.22], [1, 1, 0]);

  // --- State 2 : titre centré + cartes formation ---
  const title2Opacity = useTransform(scrollYProgress, [0.32, 0.48], [0, 1]);
  const title2Y = useTransform(scrollYProgress, [0.32, 0.48], [50, 0]);
  const cardsOpacity = useTransform(scrollYProgress, [0.38, 0.52], [0, 1]);
  const cardsY = useTransform(scrollYProgress, [0.38, 0.52], [80, 0]);
  const centerCardScale = useTransform(scrollYProgress, [0.52, 0.85], [1.05, 1]);
  const sideCardScale = useTransform(scrollYProgress, [0.52, 0.85], [0.92, 0.95]);

  return {
    scrollYProgress,
    videoOpacity,
    videoScale,
    bgWhiteOpacity,
    title1Opacity,
    title1X,
    floatingCardOpacity,
    floatingCardY,
    notifOpacity,
    title2Opacity,
    title2Y,
    cardsOpacity,
    cardsY,
    centerCardScale,
    sideCardScale,
  };
}
