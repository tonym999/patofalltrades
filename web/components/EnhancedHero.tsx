"use client"

import type React from "react"

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { FloatingTools } from "@/components/FloatingTools"

interface EnhancedHeroProps {
  children: React.ReactNode
}

/**
 * Renders a full-screen hero section with parallax scrolling effects, background image, floating tools, and an animated scroll indicator.
 *
 * The hero section animates its background and content based on scroll position, with all motion effects disabled if the user prefers reduced motion. The scroll indicator at the bottom center provides a visual cue for further scrolling.
 *
 * @param children - Content to display in the center of the hero section
 * @returns The rendered hero section as a React element
 */
export function EnhancedHero({ children }: EnhancedHeroProps) {
  const heroRef = useRef<HTMLElement | null>(null)
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
    <section ref={heroRef} className="relative min-h-screen supports-[height:100dvh]:min-h-[100dvh] overflow-hidden">
      {/* Background with parallax */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
        {/* Single responsive image with sizes; lets the browser pick the right src from Next.js-generated srcset */}
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt="Handyman hero background"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80" />
      </motion.div>

      {/* Floating Tools */}
      <div className="relative z-10">
        <FloatingTools />
      </div>

      {/* Content with parallax */}
      <motion.div style={{ y: textY, opacity }} className="relative z-20 min-h-screen supports-[height:100dvh]:min-h-[100dvh] flex items-center justify-center">
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