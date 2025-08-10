"use client"

import type React from "react"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { FloatingTools } from "@/components/FloatingTools"

interface EnhancedHeroProps {
  children: React.ReactNode
}

export function EnhancedHero({ children }: EnhancedHeroProps) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  // Parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden">
      {/* Background with parallax */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80" />
      </motion.div>

      {/* Floating Tools */}
      <FloatingTools />

      {/* Content with parallax */}
      <motion.div style={{ y: textY, opacity }} className="relative z-20 min-h-screen flex items-center justify-center">
        {children}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="w-6 h-10 border-2 border-amber-400 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-amber-400 rounded-full mt-2"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </motion.div>
    </section>
  )
}