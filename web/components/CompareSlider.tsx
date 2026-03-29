"use client"
import { ReactCompareSlider } from 'react-compare-slider'
import Image from 'next/image'

interface CompareSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeAlt: string
  afterAlt: string
}

export default function CompareSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt }: CompareSliderProps) {
  return (
    <ReactCompareSlider
      className="rounded-lg shadow-2xl w-full aspect-[4/3] overflow-hidden"
      itemOne={
        <div className="relative w-full h-full">
          <Image src={beforeSrc} alt={beforeAlt} fill sizes="(max-width: 768px) 100vw, 896px" quality={75} className="object-cover" />
        </div>
      }
      itemTwo={
        <div className="relative w-full h-full">
          <Image src={afterSrc} alt={afterAlt} fill sizes="(max-width: 768px) 100vw, 896px" quality={75} className="object-cover" />
        </div>
      }
    />
  )
}
