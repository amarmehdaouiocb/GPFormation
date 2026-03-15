"use client";

import { RefObject } from "react";
import { useScroll, useTransform, MotionValue } from "framer-motion";

export interface HeroScrollValues {
  scrollYProgress: MotionValue<number>;
  videoOpacity: MotionValue<number>;
  videoScale: MotionValue<number>;
  bgWhiteOpacity: MotionValue<number>;
  scrollIndicatorOpacity: MotionValue<number>;
  title1Opacity: MotionValue<number>;
  title1X: MotionValue<number>;
  title1Y: MotionValue<number>;
  floatingCardOpacity: MotionValue<number>;
  floatingCardY: MotionValue<number>;
  notifOpacity: MotionValue<number>;
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

  // --- Scroll indicator (disparaît très vite) ---
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  // --- State 1 : titre gauche + éléments flottants ---
  const title1Opacity = useTransform(scrollYProgress, [0, 0.18, 0.32], [1, 1, 0]);
  const title1X = useTransform(scrollYProgress, [0.18, 0.32], [0, -80]);
  const title1Y = useTransform(scrollYProgress, [0, 0.32], [0, -40]);
  const floatingCardOpacity = useTransform(scrollYProgress, [0, 0.15, 0.28], [1, 1, 0]);
  const floatingCardY = useTransform(scrollYProgress, [0, 0.28], [0, -20]);
  const notifOpacity = useTransform(scrollYProgress, [0, 0.12, 0.22], [1, 1, 0]);

  // --- State 2 : titre centré + cartes formation (stagger) ---
  const title2Opacity = useTransform(scrollYProgress, [0.32, 0.48], [0, 1]);
  const title2Y = useTransform(scrollYProgress, [0.32, 0.48], [50, 0]);

  const card1Opacity = useTransform(scrollYProgress, [0.35, 0.46], [0, 1]);
  const card1Y = useTransform(scrollYProgress, [0.35, 0.46], [60, 0]);
  const card2Opacity = useTransform(scrollYProgress, [0.39, 0.50], [0, 1]);
  const card2Y = useTransform(scrollYProgress, [0.39, 0.50], [80, 0]);
  const card3Opacity = useTransform(scrollYProgress, [0.43, 0.54], [0, 1]);
  const card3Y = useTransform(scrollYProgress, [0.43, 0.54], [60, 0]);

  const centerCardScale = useTransform(scrollYProgress, [0.52, 0.85], [1.05, 1]);
  const sideCardScale = useTransform(scrollYProgress, [0.52, 0.85], [0.92, 0.95]);

  return {
    scrollYProgress,
    videoOpacity,
    videoScale,
    bgWhiteOpacity,
    scrollIndicatorOpacity,
    title1Opacity,
    title1X,
    title1Y,
    floatingCardOpacity,
    floatingCardY,
    notifOpacity,
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
  };
}
