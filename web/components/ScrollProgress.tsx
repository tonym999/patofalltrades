"use client";

import { useEffect } from "react";
import type { MotionStyle } from "framer-motion";
import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";

import { usePrefersReducedMotionSync } from "@/hooks/usePrefersReducedMotion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = usePrefersReducedMotionSync();
  const reducedProgress = useMotionValue(0);
  const reducedBackgroundSize = useTransform(reducedProgress, (value) => {
    const clamped = Math.min(Math.max(value, 0), 1);
    return `${clamped * 100}% 100%`;
  });

  useEffect(() => {
    if (!prefersReducedMotion) return;

    const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
    reducedProgress.set(clamp(scrollYProgress.get()));

    const unsubscribe = scrollYProgress.on("change", (value) => {
      reducedProgress.set(clamp(value));
    });

    return () => {
      unsubscribe();
    };
  }, [prefersReducedMotion, reducedProgress, scrollYProgress]);

  const style: MotionStyle = prefersReducedMotion
    ? {
        top: "max(env(safe-area-inset-top), 0px)",
        backgroundSize: reducedBackgroundSize,
        willChange: "auto",
        transform: "none",
        opacity: 0.35,
        transition: "none",
      }
    : {
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
      style={style}
    />
  );
}
