"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type React from "react";
import { Menu as MenuIcon } from "lucide-react";
import { OPEN_MOBILE_MENU, MOBILE_MENU_STATE } from "@/lib/mobileMenuEvents";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to toggle header background
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    // Check initial scroll position
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync header hamburger aria-expanded with bottom-sheet menu state
  useEffect(() => {
    const btn = document.querySelector('[data-menu-trigger="mobile-menu"]') as HTMLButtonElement | null;
    if (!btn) return;
    const onState = (e: WindowEventMap[typeof MOBILE_MENU_STATE]) => {
      const open = e.detail?.open ?? false;
      btn.setAttribute("aria-expanded", String(open));
    };
    window.addEventListener(MOBILE_MENU_STATE, onState);
    return () => window.removeEventListener(MOBILE_MENU_STATE, onState);
  }, []);

  const openMobileMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      // Signal MobileTabsNav to open its bottom-sheet menu with opener context
      window.dispatchEvent(
        new CustomEvent(OPEN_MOBILE_MENU, {
          detail: { trigger: e.currentTarget as HTMLElement, source: "header" },
        })
      );
    } catch {}
  };

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-300 ${
        isScrolled
          ? "bg-[#1a1f2e]/80 backdrop-blur-md border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
      style={{
        paddingTop: "max(env(safe-area-inset-top), 0px)",
        paddingLeft: "max(env(safe-area-inset-left), 0px)",
        paddingRight: "max(env(safe-area-inset-right), 0px)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger trigger */}
            <button
              type="button"
              aria-label="Open menu"
              aria-controls="mobile-menu-panel"
              aria-expanded="false"
              aria-haspopup="dialog"
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md text-white hover:text-[#FFD700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              onClick={openMobileMenu}
              data-testid="header-hamburger"
              data-menu-trigger="mobile-menu"
            >
              <MenuIcon size={22} aria-hidden="true" />
            </button>

            <div className="text-2xl font-bold">
              <a href="#services" className="flex items-center gap-2">
                <Image src="/pat-of-all-trades-logo.svg" alt="Pat Of All Trades logo" width={210} height={56} className="h-14 w-auto rounded" />
                <span className="sr-only">Pat Of All Trades</span>
              </a>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 items-center" aria-label="Primary">
            <a href="#services" className="text-[#d1d5db] hover:text-[#D4AF37] transition duration-300">Services</a>
            <a href="#portfolio" className="text-[#d1d5db] hover:text-[#D4AF37] transition duration-300">Portfolio</a>
            <a href="#about" className="text-[#d1d5db] hover:text-[#D4AF37] transition duration-300">About</a>
            <a href="#testimonials" className="text-[#d1d5db] hover:text-[#D4AF37] transition duration-300">Testimonials</a>
            <a href="#contact" className="bg-gradient-to-r from-[#FFD700] to-[#ca8a04] text-[#1a1f2e] font-bold py-2 px-5 rounded-lg hover:from-[#ca8a04] hover:to-[#D4AF37] transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">Get a Quote</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
