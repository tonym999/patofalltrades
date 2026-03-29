"use client"
import dynamic from "next/dynamic"

const CompareSlider = dynamic(() => import("./CompareSlider"), {
  ssr: false,
  loading: () => <div className="rounded-lg shadow-2xl w-full aspect-[4/3] bg-dark-navy/30 animate-pulse" />,
})

export default CompareSlider
