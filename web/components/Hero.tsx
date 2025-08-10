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
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">LONDON&apos;S PREMIER HANDYMAN</h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">Reliable. Professional. Unmatched Quality.</p>

        {/* Your existing buttons/CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-8 rounded-lg transition-colors">
            Get a Quote
          </Link>
          <Link href="#portfolio" className="border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-900 font-bold py-4 px-8 rounded-lg transition-colors">
            View Portfolio
          </Link>
        </div>
      </div>
    </EnhancedHero>
  )
}

