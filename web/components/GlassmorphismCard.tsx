"use client";

import type React from "react";
import { motion } from "framer-motion";
type MotionDivProps = React.ComponentProps<typeof motion.div>;

interface GlassmorphismCardProps extends Omit<MotionDivProps, "children" | "className"> {
  children: React.ReactNode;
  className?: string;
  hoverScale?: boolean;
  delay?: number;
}

export function GlassmorphismCard({ children, className = "", hoverScale = true, delay = 0, tabIndex = 0, ...rest }: GlassmorphismCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={
        hoverScale
          ? {
              scale: 1.02,
              y: -5,
              boxShadow: "0 20px 40px rgba(212, 175, 55, 0.15)",
            }
          : {}
      }
      className="group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-xl"
      role="group"
      tabIndex={tabIndex}
      {...rest}
    >
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl border-4 border-amber-400/70 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 shadow-[0_0_34px_rgba(245,158,11,0.45)]"
        aria-hidden="true"
      />

      <div
        className={`
        relative bg-slate-800/40 backdrop-blur-md border-2 border-slate-700/50 
        group-hover:border-amber-400/70 group-focus-within:border-amber-400/80
        transition-all duration-500 rounded-xl overflow-hidden
        ${className}
      `}
      >
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}


