"use client"
import dynamic from "next/dynamic"

const CompareSlider = dynamic(() => import("./CompareSlider"), { ssr: false })

export default CompareSlider
