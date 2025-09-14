"use client";

/**
 * MobileTabsNav renders the fixed bottom tabs bar on mobile and an accessible
 * bottom-sheet Menu for secondary navigation. It exposes its height via a CSS
 * variable for layout padding, supports focus trapping, scroll lock, and
 * emits analytics events for open/close/item clicks.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { X as XIcon } from "lucide-react";
import { track } from "@vercel/analytics";

export default function MobileTabsNav() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  // Ref to the element that opened the menu (for focus return)
  const openerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const openMenu = useCallback((source: "tabs_nav" | "header" = "header") => {
    setIsMenuOpen(true);
    try {
      track("menu_open", { surface: "mobile_bottom_sheet", source });
    } catch {}
    try {
      window.dispatchEvent(new CustomEvent("mobile-menu-state", { detail: { open: true } }));
    } catch {}
  }, []);

  const closeMenu = useCallback((trigger: "backdrop" | "close_button" | "escape" | "item_click") => {
    setIsMenuOpen(false);
    try {
      track("menu_close", { surface: "mobile_bottom_sheet", trigger });
    } catch {}
    try {
      window.dispatchEvent(new CustomEvent("mobile-menu-state", { detail: { open: false } }));
    } catch {}
    if (trigger !== "item_click") {
      // Prefer last opener; fallback to header hamburger if available
      (openerRef.current ??
        (document.querySelector('[data-menu-trigger="mobile-menu"]') as HTMLElement | null))?.focus();
    }
  }, []);

  const handleMenuItemClick = useCallback((itemName: string) => {
    try {
      track("menu_item_click", { surface: "mobile_bottom_sheet", item: itemName });
    } catch {}
    closeMenu("item_click");
  }, [closeMenu]);

  // Bottom tabs nav removed; only bottom-sheet menu remains

  // Listen to header hamburger trigger, capture opener
  useEffect(() => {
    const onOpen = (evt: Event) => {
      const detail = (evt as CustomEvent<{ trigger?: HTMLElement; source?: "header" | "tabs_nav" }>).detail;
      openerRef.current = detail?.trigger ?? (document.activeElement as HTMLElement | null);
      openMenu(detail?.source ?? "header");
    };
    window.addEventListener("open-mobile-menu", onOpen as EventListener);
    return () => window.removeEventListener("open-mobile-menu", onOpen as EventListener);
  }, [openMenu]);

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

  const handleTrapTab = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.getClientRects().length > 0);
    if (focusable.length === 0) return;
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
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

  const handleGetInTouchClick = useCallback((e: ReactMouseEvent<HTMLAnchorElement>) => {
    // Respect modifier/middle clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    const contactSection = document.getElementById("contact") || document.getElementById("quote");
    if (!contactSection) return; // let default anchor behavior navigate
    e.preventDefault();
    handleMenuItemClick("Get in Touch");
    // Close first to restore scrolling, then scroll and focus
    window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      try {
        contactSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
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
                <Link href="#services" onClick={() => handleMenuItemClick("Services")} className="py-3 min-h-[44px] flex items-center text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  Services
                </Link>
                <Link href="#portfolio" onClick={() => handleMenuItemClick("Work")} className="py-3 min-h-[44px] flex items-center text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  Work
                </Link>
                <Link href="#service-area" onClick={() => handleMenuItemClick("Areas We Serve")} className="py-3 min-h-[44px] flex items-center text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  Areas We Serve
                </Link>
                <Link href="#about" onClick={() => handleMenuItemClick("About")} className="py-3 min-h-[44px] flex items-center text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  About
                </Link>
                <Link href="#testimonials" onClick={() => handleMenuItemClick("Reviews")} className="py-3 min-h-[44px] flex items-center text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
                  Reviews
                </Link>
                <Link href="/#contact" onClick={handleGetInTouchClick} className="py-3 min-h-[44px] flex items-center text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded">
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


