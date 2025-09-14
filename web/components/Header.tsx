"use client";
import Image from "next/image";
import { Menu as MenuIcon } from "lucide-react";

export default function Header() {
  const openMobileMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      // Signal MobileTabsNav to open its bottom-sheet menu with opener context
      window.dispatchEvent(
        new CustomEvent("open-mobile-menu", {
          detail: { trigger: e.currentTarget as HTMLElement, source: "header" },
        })
      );
    } catch {}
  };

  return (
    <header
      id="navbar"
      className="sticky-nav fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200/60"
      style={{ minHeight: "56px" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger trigger */}
            <button
              type="button"
              aria-label="Open menu"
              aria-controls="mobile-menu-panel"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-slate-800 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              onClick={openMobileMenu}
              data-testid="header-hamburger"
              data-menu-trigger="mobile-menu"
            >
              <MenuIcon size={22} aria-hidden="true" />
            </button>

            <div className="text-2xl font-bold text-slate-900">
              <a href="#hero" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Pat Of All Trades logo" width={32} height={32} className="rounded" />
                <span className="tracking-wider">Pat Of All Trades</span>
              </a>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#services" className="text-slate-700 hover:text-[var(--gold)] transition duration-300">Services</a>
            <a href="#portfolio" className="text-slate-700 hover:text-[var(--gold)] transition duration-300">Portfolio</a>
            <a href="#about" className="text-slate-700 hover:text-[var(--gold)] transition duration-300">About</a>
            <a href="#testimonials" className="text-slate-700 hover:text-[var(--gold)] transition duration-300">Testimonials</a>
            <a href="#contact" className="cta-btn text-dark-navy font-bold py-2 px-5 rounded-lg">Get a Quote</a>
          </nav>
        </div>
      </div>
    </header>
  );
}


