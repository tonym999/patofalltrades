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
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight">
          <span className="text-gold-bright">Quality Craftsmanship.</span>
          <br />
          <span className="text-white">Delivered.</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-body mb-6 md:mb-8 max-w-2xl mx-auto">
          Premium handyman services across London. From small repairs to complete renovations, we bring professional excellence to every project.
        </p>

        {/* CTAs with mobile-first sizing */}
        <div className="flex justify-center">
          <Link
            href="#portfolio"
            className="btn-secondary py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-bold transition-all duration-300"
          >
            View Portfolio
          </Link>
        </div>
      </div>
    </EnhancedHero>
  )
}
