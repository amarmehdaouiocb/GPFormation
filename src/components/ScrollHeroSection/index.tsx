"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { useHeroScroll } from "./useHeroScroll";
import HeroVideoLayer from "./HeroVideoLayer";
import HeroState1 from "./HeroState1";
import HeroState2 from "./HeroState2";

export default function ScrollHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sv = useHeroScroll(containerRef);
  const [activeState, setActiveState] = useState<1 | 2>(1);

  useMotionValueEvent(sv.scrollYProgress, "change", (v) => {
    setActiveState(v < 0.35 ? 1 : 2);
  });

  return (
    <div ref={containerRef} style={{ height: "300vh" }}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <HeroVideoLayer
          videoOpacity={sv.videoOpacity}
          videoScale={sv.videoScale}
          bgWhiteOpacity={sv.bgWhiteOpacity}
        />
        <HeroState1
          title1Opacity={sv.title1Opacity}
          title1X={sv.title1X}
          title1Y={sv.title1Y}
          floatingCardOpacity={sv.floatingCardOpacity}
          floatingCardY={sv.floatingCardY}
          notifOpacity={sv.notifOpacity}
          scrollIndicatorOpacity={sv.scrollIndicatorOpacity}
          isActive={activeState === 1}
        />
        <HeroState2
          title2Opacity={sv.title2Opacity}
          title2Y={sv.title2Y}
          card1Opacity={sv.card1Opacity}
          card1Y={sv.card1Y}
          card2Opacity={sv.card2Opacity}
          card2Y={sv.card2Y}
          card3Opacity={sv.card3Opacity}
          card3Y={sv.card3Y}
          centerCardScale={sv.centerCardScale}
          sideCardScale={sv.sideCardScale}
          isActive={activeState === 2}
        />
      </div>
    </div>
  );
}
