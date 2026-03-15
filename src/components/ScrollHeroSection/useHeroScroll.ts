"use client";

import { RefObject, useEffect, useRef, useState } from "react";

export function useHeroScroll(containerRef: RefObject<HTMLDivElement | null>) {
  const [heroState, setHeroState] = useState<1 | 2>(1);
  const heroStateRef = useRef<1 | 2>(1);
  const cooldownRef = useRef(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mountedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Attendre le prochain frame pour que le composant soit monté
    const rafId = requestAnimationFrame(() => {
      mountedRef.current = true;
    });

    const triggerState = (newState: 1 | 2) => {
      if (!mountedRef.current) return;
      if (cooldownRef.current || heroStateRef.current === newState) return;
      heroStateRef.current = newState;
      setHeroState(newState);
      cooldownRef.current = true;
      cooldownTimer.current = setTimeout(() => {
        cooldownRef.current = false;
      }, 1500);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 5 && heroStateRef.current === 1) {
        triggerState(2);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      if (deltaY > 30 && heroStateRef.current === 1) {
        triggerState(2);
      }
    };

    const handleScroll = () => {
      if (window.scrollY < 30 && heroStateRef.current === 2) {
        triggerState(1);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafId);
      clearTimeout(cooldownTimer.current);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef]);

  return heroState;
}
