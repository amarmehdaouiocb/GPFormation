"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { useHeroScroll } from "./useHeroScroll";
import HeroVideoLayer from "./HeroVideoLayer";
import HeroState1 from "./HeroState1";
import HeroState2 from "./HeroState2";

export default function ScrollHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollValues = useHeroScroll(containerRef);
  const [activeState, setActiveState] = useState<1 | 2>(1);

  useMotionValueEvent(scrollValues.scrollYProgress, "change", (v) => {
    setActiveState(v < 0.35 ? 1 : 2);
  });

  return (
    <div ref={containerRef} style={{ height: "300vh" }}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <HeroVideoLayer
          videoOpacity={scrollValues.videoOpacity}
          videoScale={scrollValues.videoScale}
          bgWhiteOpacity={scrollValues.bgWhiteOpacity}
        />
        <HeroState1
          title1Opacity={scrollValues.title1Opacity}
          title1X={scrollValues.title1X}
          floatingCardOpacity={scrollValues.floatingCardOpacity}
          floatingCardY={scrollValues.floatingCardY}
          notifOpacity={scrollValues.notifOpacity}
          isActive={activeState === 1}
        />
        <HeroState2
          title2Opacity={scrollValues.title2Opacity}
          title2Y={scrollValues.title2Y}
          cardsOpacity={scrollValues.cardsOpacity}
          cardsY={scrollValues.cardsY}
          centerCardScale={scrollValues.centerCardScale}
          sideCardScale={scrollValues.sideCardScale}
          isActive={activeState === 2}
        />
      </div>
    </div>
  );
}
