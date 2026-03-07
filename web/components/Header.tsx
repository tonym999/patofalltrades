"use client";
import Image from "next/image";
import { useEffect } from "react";
import type React from "react";
import { Menu as MenuIcon } from "lucide-react";
import { OPEN_MOBILE_MENU, MOBILE_MENU_STATE } from "@/lib/mobileMenuEvents";

export default function Header() {
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
      className="fixed top-0 left-0 right-0 z-40 bg-[#1a1f2e]/80 backdrop-blur-md border-b border-white/10"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 0px)",
        paddingLeft: "max(env(safe-area-inset-left), 0px)",
        paddingRight: "max(env(safe-area-inset-right), 0px)",
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <a href="#" className="flex items-center">
            <Image
              src="/brand/pat-logo-horizontal-light.svg"
              alt="Pat Of All Trades"
              width={180}
              height={37}
              className="hidden md:block"
              priority
            />
            <Image
              src="/brand/pat-logo-compact-light.svg"
              alt="Pat Of All Trades"
              width={100}
              height={33}
              className="md:hidden"
              priority
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            <a href="#services" className="group relative text-gray-300 hover:text-[#D4AF37] transition-colors duration-300">
              Services
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#portfolio" className="group relative text-gray-300 hover:text-[#D4AF37] transition-colors duration-300">
              Portfolio
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#about" className="group relative text-gray-300 hover:text-[#D4AF37] transition-colors duration-300">
              About
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#testimonials" className="group relative text-gray-300 hover:text-[#D4AF37] transition-colors duration-300">
              Testimonials
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
            </a>
            <a 
              href="#contact" 
              className="bg-gradient-to-r from-[#D4AF37] to-[#ca8a04] text-[#0f172a] font-semibold px-6 py-2 rounded-full hover:shadow-lg hover:shadow-[#D4AF37]/50 hover:scale-105 transition-all duration-300"
            >
              Get a Quote
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open menu"
            aria-controls="mobile-menu-panel"
            aria-expanded="false"
            aria-haspopup="dialog"
            className="md:hidden w-6 h-6 flex items-center justify-center text-white"
            onClick={openMobileMenu}
            data-testid="header-hamburger"
            data-menu-trigger="mobile-menu"
          >
            <MenuIcon size={24} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
