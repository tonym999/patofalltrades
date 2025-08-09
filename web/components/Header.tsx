"use client";
import Image from "next/image";

export default function Header() {
  return (
    <header id="navbar" className="sticky-nav fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            <a href="#hero" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Pat Of All Trades logo" width={32} height={32} className="rounded" />
              <span className="tracking-wider">Pat Of All Trades</span>
            </a>
          </div>
          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#services" className="text-gray-300 hover:text-[var(--gold)] transition duration-300">Services</a>
            <a href="#portfolio" className="text-gray-300 hover:text-[var(--gold)] transition duration-300">Portfolio</a>
            <a href="#about" className="text-gray-300 hover:text-[var(--gold)] transition duration-300">About</a>
            <a href="#testimonials" className="text-gray-300 hover:text-[var(--gold)] transition duration-300">Testimonials</a>
            <a href="#contact" className="cta-btn text-dark-navy font-bold py-2 px-5 rounded-lg">Get a Quote</a>
          </nav>
        </div>
      </div>
    </header>
  );
}


