"use client";

import { EnhancedHero } from "./EnhancedHero";

export default function Hero() {
  return (
    <div id="hero">
      <EnhancedHero>
        <div id="hero-content" className="text-center px-4">
          <h1
            id="hero-title"
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-wider mb-4"
            style={{ textShadow: "2px 2px 10px rgba(0,0,0,0.5)" }}
          >
            London&apos;s Premier Handyman
          </h1>
          <p
            id="hero-subtitle"
            className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto"
            style={{ textShadow: "1px 1px 5px rgba(0,0,0,0.5)" }}
          >
            Reliable. Professional. Unmatched Quality.
          </p>
          <div className="mt-8">
            <a href="#contact" className="cta-btn text-dark-navy font-bold py-4 px-8 rounded-lg text-lg">
              Book a Consultation
            </a>
          </div>
        </div>
      </EnhancedHero>
    </div>
  );
}

