"use client"

import type React from "react"
import { motion } from "framer-motion"

interface GlassmorphismCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: boolean
  delay?: number
}

export function GlassmorphismCard({ children, className = "", hoverScale = true, delay = 0 }: GlassmorphismCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover=
        {hoverScale
          ? {
              scale: 1.02,
              y: -5,
              boxShadow: "0 20px 40px rgba(212, 175, 55, 0.15)",
            }
          : {}}
      className="group relative"
    >
      {/* Animated gradient border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      {/* Glassmorphism card */}
      <div
        className={`
        relative bg-slate-800/40 backdrop-blur-md border border-slate-700/50 
        group-hover:border-amber-400/30 group-hover:bg-slate-800/60
        transition-all duration-500 rounded-xl overflow-hidden
        ${className}
      `}
      >
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  )
}


