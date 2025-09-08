"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Hammer, Briefcase, Star, MoreHorizontal, X as XIcon } from "lucide-react";
import { track } from "@vercel/analytics";

type TabItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  id: string; // section id without '#'
};

const TABS: readonly TabItem[] = [
  { href: "#services", label: "Services", icon: Hammer, id: "services" },
  { href: "#portfolio", label: "Work", icon: Briefcase, id: "portfolio" },
  { href: "#testimonials", label: "Reviews", icon: Star, id: "testimonials" },
] as const;

export default function MobileTabsNav() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
    try {
      track("menu_open", { surface: "mobile_bottom_sheet", source: "tabs_nav" });
    } catch {}
  }, []);

  const closeMenu = useCallback((trigger: "backdrop" | "close_button" | "escape" | "item_click") => {
    setIsMenuOpen(false);
    try {
      track("menu_close", { surface: "mobile_bottom_sheet", trigger });
    } catch {}
    if (trigger !== "item_click") {
      openButtonRef.current?.focus();
    }
  }, []);

  const handleMenuItemClick = useCallback((itemName: string) => {
    try {
      track("menu_item_click", { surface: "mobile_bottom_sheet", item: itemName });
    } catch {}
    closeMenu("item_click");
  }, [closeMenu]);

  // Observe section visibility to set active tab
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const sections = TABS.map(t => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      entries => {
        // choose the section with greatest intersection ratio in viewport bottom area
        let topCandidate: { id: string; ratio: number; top: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const rect = e.target.getBoundingClientRect();
          const ratio = e.intersectionRatio + Math.max(0, 1 - Math.abs(rect.top) / window.innerHeight);
          const id = (e.target as HTMLElement).id;
          if (!topCandidate || ratio > topCandidate.ratio) {
            topCandidate = { id, ratio, top: rect.top };
          }
        }
        if (topCandidate) setActiveId(topCandidate.id);
      },
      { rootMargin: "0px 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach(s => io.observe(s));
    observerRef.current = io;
    return () => io.disconnect();
  }, []);

  // Expose height to CSS var for layout padding calculations
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const h = el.offsetHeight;
      document.documentElement.style.setProperty("--tabs-height", `${h}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("orientationchange", update);
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("load", update);
      document.documentElement.style.setProperty("--tabs-height", "0px");
    };
  }, []);

  const items = useMemo(() => TABS, []);

  // Close on Escape and lock scroll when open
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu("escape");
      }
    };
    document.addEventListener("keydown", onKey);
    const originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // Focus first focusable
    window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }, 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = originalOverflow;
    };
  }, [isMenuOpen, closeMenu]);

  const handleTrapTab = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first || !panelRef.current.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  const handleGetInTouchClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Respect modifier/middle clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    const contactSection = document.getElementById("contact") || document.getElementById("quote");
    if (!contactSection) return; // let default anchor behavior navigate
    e.preventDefault();
    handleMenuItemClick("Get in Touch");
    // Close first to restore scrolling, then scroll and focus
    window.setTimeout(() => {
      try {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        contactSection.scrollIntoView();
      }
      const firstField = document.getElementById("name") as HTMLInputElement | null;
      if (firstField) {
        window.setTimeout(() => {
          firstField.focus({ preventScroll: true });
        }, 250);
      }
      if (window.location.hash !== "#contact") {
        history.replaceState(null, "", "#contact");
      }
    }, 0);
  }, [handleMenuItemClick]);

  return (
    <>
      <nav
        aria-label="Site navigation"
        className="md:hidden fixed inset-x-0 z-[55] bg-slate-900/95 backdrop-blur border-t border-slate-700/60"
        style={{ bottom: "var(--cta-height)" }}
        ref={containerRef}
      >
        <ul className="flex items-stretch justify-around px-2 pt-1 pb-1 pb-[max(env(safe-area-inset-bottom),8px)]">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <li key={item.id} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-1 h-12 min-h-[44px] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    isActive ? "text-amber-400" : "text-gray-300 hover:text-white"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="text-[11px] leading-none">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              ref={openButtonRef}
              type="button"
              onClick={openMenu}
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu-panel"
              data-testid="menu-open-button"
              className="w-full flex flex-col items-center justify-center gap-1 h-12 min-h-[44px] rounded-md text-gray-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <MoreHorizontal size={18} aria-hidden="true" />
              <span className="text-[11px] leading-none">Menu</span>
            </button>
          </li>
        </ul>
      </nav>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[70] md:hidden"
            onClick={() => closeMenu("backdrop")}
            aria-hidden="true"
            data-testid="menu-overlay"
          />
          <div
            id="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            ref={panelRef}
            onKeyDown={handleTrapTab}
            className="fixed inset-x-0 bottom-0 z-[80] md:hidden bg-slate-900 border-t border-slate-700/60 rounded-t-2xl shadow-2xl"
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
            }}
          >
            <div className="max-w-screen-md mx-auto px-4 pt-3 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 id="mobile-menu-title" className="text-white font-semibold">Menu</h3>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => closeMenu("close_button")}
                  className="text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                  aria-label="Close menu"
                >
                  <XIcon size={20} aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 divide-y divide-slate-700/60">
                <Link href="#services" onClick={() => handleMenuItemClick("Services")} className="py-3 text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  Services
                </Link>
                <Link href="#portfolio" onClick={() => handleMenuItemClick("Work")} className="py-3 text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  Work
                </Link>
                <Link href="#service-area" onClick={() => handleMenuItemClick("Areas We Serve")} className="py-3 text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  Areas We Serve
                </Link>
                <Link href="#about" onClick={() => handleMenuItemClick("About")} className="py-3 text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  About
                </Link>
                <Link href="#testimonials" onClick={() => handleMenuItemClick("Reviews")} className="py-3 text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  Reviews
                </Link>
                <Link href="/#contact" onClick={handleGetInTouchClick} className="py-3 text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}


