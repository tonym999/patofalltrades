"use client";

import type { CSSProperties } from "react";
import type { MotionStyle } from "framer-motion";
import { motion, useScroll } from "framer-motion";

import { usePrefersReducedMotionSync } from "@/hooks/usePrefersReducedMotion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = usePrefersReducedMotionSync();

  if (prefersReducedMotion) {
    const reducedStyle: CSSProperties = {
      top: "max(env(safe-area-inset-top), 0px)",
      backgroundSize: "100% 100%",
      transform: "none",
      transition: "none",
      opacity: 0.35,
    };

    return (
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 z-50 origin-left pointer-events-none"
        data-testid="scroll-progress"
        aria-hidden="true"
        style={reducedStyle}
      />
    );
  }

  const animatedStyle: MotionStyle = {
    top: "max(env(safe-area-inset-top), 0px)",
    backgroundSize: "100% 100%",
    willChange: "transform",
    scaleX: scrollYProgress,
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 z-50 origin-left pointer-events-none"
      data-testid="scroll-progress"
      aria-hidden="true"
      style={animatedStyle}
    />
  );
}
