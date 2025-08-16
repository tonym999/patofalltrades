import Link from "next/link"
import { EnhancedHero } from "./EnhancedHero"

/**
 * Renders the hero section with a main heading, subheading, and call-to-action buttons for contacting or viewing the portfolio.
 *
 * Displays prominent branding and navigation links within an enhanced hero layout.
 */
export default function Hero() {
  return (
    <EnhancedHero>
      {/* Your existing hero content goes here */}
      <div className="container mx-auto px-6 md:px-10 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
          LONDON&apos;S PREMIER HANDYMAN
        </h1>
        <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-6 md:mb-8">
          Reliable. Professional. Unmatched Quality.
        </p>

        {/* CTAs with mobile-first sizing */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/contact"
            className="cta-btn text-slate-900 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg"
          >
            Get a Quote
          </Link>
          <Link
            href="#portfolio"
            className="border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-900 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors"
          >
            View Portfolio
          </Link>
        </div>
      </div>
    </EnhancedHero>
  )
}

