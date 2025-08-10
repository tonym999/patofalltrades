"use client"

import type React from "react"

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { FloatingTools } from "@/components/FloatingTools"

interface EnhancedHeroProps {
  children: React.ReactNode
}

export function EnhancedHero({ children }: EnhancedHeroProps) {
  const heroRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  // Parallax effects with reduced motion support (avoid conditional hooks)
  const backgroundY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0%", "0%"] : ["0%", "30%"])
  const textY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0%", "0%"] : ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [1, 1] : [1, 0])

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden">
      {/* Background with parallax */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt="Handyman hero background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80" />
      </motion.div>

      {/* Floating Tools */}
      <div className="relative z-10">
        <FloatingTools />
      </div>

      {/* Content with parallax */}
      <motion.div style={{ y: textY, opacity }} className="relative z-20 min-h-screen flex items-center justify-center">
        {children}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        aria-hidden="true"
        role="presentation"
        animate={prefersReducedMotion ? { y: 0 } : { y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: prefersReducedMotion ? 0 : Infinity }}
      >
        <div className="w-6 h-10 border-2 border-amber-400 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-amber-400 rounded-full mt-2"
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: prefersReducedMotion ? 0 : Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}