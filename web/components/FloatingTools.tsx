"use client"

import type React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Hammer, Wrench, Paintbrush, Zap, WrenchIcon as Screwdriver, Ruler } from "lucide-react"

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
    {
      name: "screwdriver",
      icon: Screwdriver,
      delay: 1.5,
      position: { left: "15%", top: "50%" },
      duration: 22,
      path: { x: [0, 20, -40, 0], y: [0, -35, 15, 0] },
    },
    {
      name: "ruler",
      icon: Ruler,
      delay: 2.5,
      position: { right: "10%", top: "45%" },
      duration: 19,
      path: { x: [0, -30, 45, 0], y: [0, 20, -40, 0] },
    },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {tools.map((tool) => (
        <motion.div
          key={tool.name}
          aria-hidden="true"
          className="absolute text-amber-400/15"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 360],
            ...tool.path,
          }}
          transition={{
            duration: tool.duration,
            delay: tool.delay,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: "easeInOut",
          }}
          style={tool.position}
        >
          <tool.icon size={28} />
        </motion.div>
      ))}
    </div>
  )
}
