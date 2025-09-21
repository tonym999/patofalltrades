"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { Menu as MenuIcon } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { OPEN_MOBILE_MENU, MOBILE_MENU_STATE } from "@/lib/mobileMenuEvents";

export default function Header() {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const showTimeoutRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

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

  // Hide on scroll down, show on scroll up (100ms debounce) with small delta
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsHidden(false);
      lastScrollYRef.current = Math.max(0, window.scrollY || 0);
      return;
    }
    const DELTA = 4;
    const onScroll = () => {
      const yRaw = window.scrollY || 0;
      const y = yRaw < 0 ? 0 : yRaw;

      const last = lastScrollYRef.current;
      lastScrollYRef.current = y;

      const isScrollingDown = y > last + DELTA;
      const isScrollingUp = y < last - DELTA;

      if (y <= 2) {
        if (showTimeoutRef.current) {
          window.clearTimeout(showTimeoutRef.current);
          showTimeoutRef.current = null;
        }
        setIsHidden(false);
        return;
      }

      if (isScrollingDown) {
        if (showTimeoutRef.current) {
          window.clearTimeout(showTimeoutRef.current);
          showTimeoutRef.current = null;
        }
        setIsHidden(true);
      } else if (isScrollingUp) {
        if (showTimeoutRef.current) {
          window.clearTimeout(showTimeoutRef.current);
        }
        showTimeoutRef.current = window.setTimeout(() => {
          setIsHidden(false);
        }, 100);
      }
    };

    // Initialize state on mount
    lastScrollYRef.current = Math.max(0, window.scrollY || 0);
    setIsHidden(false);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (showTimeoutRef.current) window.clearTimeout(showTimeoutRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <header
      id="navbar"
      className={`sticky-nav fixed top-0 left-0 right-0 z-[120] bg-white/80 backdrop-blur border-b border-slate-200/60 ${isHidden ? "sticky-nav--hidden" : ""}`}
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
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md text-slate-800 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              onClick={openMobileMenu}
              data-testid="header-hamburger"
              data-menu-trigger="mobile-menu"
            >
              <MenuIcon size={22} aria-hidden="true" />
            </button>

            <div className="text-2xl font-bold text-slate-900">
              <a href="#services" className="flex items-center gap-2">
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
