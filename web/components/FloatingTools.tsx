"use client"

import type React from "react"
import { motion, useReducedMotion, cubicBezier } from "framer-motion"
import { Hammer, Wrench, Paintbrush, Zap } from "lucide-react"

export function FloatingTools() {
  type ToolConfig = {
    name: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    delay: number
    position: React.CSSProperties
    duration: number
    path: { x: number[]; y: number[] }
  }

  const prefersReducedMotion = useReducedMotion()

  const tools: ToolConfig[] = [
    {
      name: "hammer",
      icon: Hammer,
      delay: 0,
      position: { left: "10%", top: "20%" },
      duration: 15,
      path: { x: [0, 30, -20, 0], y: [0, -40, 20, 0] },
    },
    {
      name: "wrench",
      icon: Wrench,
      delay: 1,
      position: { right: "15%", top: "25%" },
      duration: 18,
      path: { x: [0, -25, 35, 0], y: [0, 30, -25, 0] },
    },
    {
      name: "paintbrush",
      icon: Paintbrush,
      delay: 2,
      position: { left: "20%", bottom: "30%" },
      duration: 20,
      path: { x: [0, 40, -30, 0], y: [0, -20, 35, 0] },
    },
    {
      name: "zap",
      icon: Zap,
      delay: 0.5,
      position: { right: "20%", bottom: "25%" },
      duration: 16,
      path: { x: [0, -35, 25, 0], y: [0, 25, -30, 0] },
    },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {tools.map((tool) => {
        const reducedAnimate = { opacity: 0.2, scale: 1, rotate: 0, x: 0, y: 0 }
        const fullAnimate = { opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.2, 0.8], rotate: [0, 360], ...tool.path }
        const animateProps = prefersReducedMotion ? reducedAnimate : fullAnimate
        const initialProps = prefersReducedMotion ? reducedAnimate : { opacity: 0, scale: 0 }
        const transitionProps: import("framer-motion").Transition = prefersReducedMotion
          ? { duration: 0 }
          : { duration: tool.duration, delay: tool.delay, repeat: Infinity, ease: cubicBezier(0.42, 0, 0.58, 1) }

        return (
          <motion.div
            key={tool.name}
            aria-hidden="true"
            className="absolute text-amber-400/15"
            initial={initialProps}
            animate={animateProps}
            transition={transitionProps}
            style={tool.position}
          >
            <tool.icon size={28} aria-hidden="true" />
          </motion.div>
        )
      })}
    </div>
  )
}
