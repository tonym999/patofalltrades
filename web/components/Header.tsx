"use client";
import Image from "next/image";
import Link from "next/link";
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
    } catch (err) {
      console.warn("Failed to dispatch mobile menu event from header:", err);
    }
  };

  return (
    <header
      id="navbar"
      className="sticky-nav fixed top-0 left-0 right-0 z-[var(--z-tabs)] border-b border-white/10 bg-[#1a1f2e]/95 shadow-[0_1px_10px_rgba(15,23,42,0.12)]"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 0px)",
        paddingLeft: "max(env(safe-area-inset-left), 0px)",
        paddingRight: "max(env(safe-area-inset-right), 0px)",
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center">
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
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            <Link href="/#services" className="group relative text-body hover:text-[color:var(--gold)] transition-colors motion-standard">
              Services
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[color:var(--gold)] transition-all motion-standard group-hover:w-full" />
            </Link>
            <Link href="/#portfolio" className="group relative text-body hover:text-[color:var(--gold)] transition-colors motion-standard">
              Portfolio
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[color:var(--gold)] transition-all motion-standard group-hover:w-full" />
            </Link>
            <Link href="/#about" className="group relative text-body hover:text-[color:var(--gold)] transition-colors motion-standard">
              About
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[color:var(--gold)] transition-all motion-standard group-hover:w-full" />
            </Link>
            <Link href="/#testimonials" className="group relative text-body hover:text-[color:var(--gold)] transition-colors motion-standard">
              Testimonials
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[color:var(--gold)] transition-all motion-standard group-hover:w-full" />
            </Link>
            <Link
              href="/#contact"
              className="motion-emphasis bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-hover)] text-[color:var(--deep-navy)] font-semibold px-6 py-2 rounded-full hover:shadow-lg hover:shadow-[0_0_25px_color-mix(in_srgb,var(--gold)_50%,transparent)] hover:scale-105 transition-all"
            >
              Get a Quote
            </Link>
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
