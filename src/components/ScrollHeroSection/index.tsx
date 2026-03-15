"use client";

import { useRef } from "react";
import { useHeroScroll } from "./useHeroScroll";
import HeroVideoLayer from "./HeroVideoLayer";
import HeroState1 from "./HeroState1";
import HeroState2 from "./HeroState2";

export default function ScrollHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroState = useHeroScroll(containerRef);

  return (
    <div ref={containerRef} style={{ height: "130vh" }}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <HeroVideoLayer heroState={heroState} />
        <HeroState1 heroState={heroState} />
        <HeroState2 heroState={heroState} />
      </div>
    </div>
  );
}
