"use client";

/**
 * MobileTabsNav renders an accessible bottom-sheet Menu for secondary navigation on mobile.
 * Implemented with Vaul (Radix-based Drawer) to ensure robust a11y and focus trapping.
 * Opened by the header's hamburger via CustomEvent and supports:
 * - Focus trapping and ESC/overlay close
 * - Body scroll lock while open and focus return to the opener
 * - Analytics events for open/close/item clicks
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { Drawer } from "vaul";
import { Mail as MailIcon, MessageCircle as WhatsAppIcon, X as XIcon } from "lucide-react";
import { track } from "@vercel/analytics";
import { CONTACT_INFO, WHATSAPP_PRESET } from "@/config/contact";
import { OPEN_MOBILE_MENU, MOBILE_MENU_STATE } from "@/lib/mobileMenuEvents";
import type { OpenMobileMenuDetail } from "@/lib/mobileMenuEvents";

export default function MobileTabsNav() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  // Ref to the element that opened the menu (for focus return)
  const openerRef = useRef<HTMLElement | null>(null);
  // Guard to avoid double-handling close (overlay + internal)
  const closingRef = useRef<boolean>(false);
  // Track last close reason to control focus restore behavior
  const lastCloseReasonRef = useRef<"backdrop" | "close_button" | "escape" | "item_click" | "gesture" | null>(null);

  const openMenu = useCallback((source: "tabs_nav" | "header" = "header") => {
    setIsMenuOpen(true);
    try {
      track("menu_open", { surface: "mobile_bottom_sheet", source });
    } catch {}
  }, []);

  const restoreFocus = useCallback(() => {
    window.setTimeout(() => {
      (openerRef.current ??
        (document.querySelector('[data-menu-trigger="mobile-menu"]') as HTMLElement | null))?.focus({ preventScroll: true });
    }, 0);
  }, []);

  const closeMenu = useCallback((trigger: "backdrop" | "close_button" | "escape" | "item_click") => {
    if (closingRef.current) return;
    closingRef.current = true;
    lastCloseReasonRef.current = trigger;
    setIsMenuOpen(false);
    try {
      track("menu_close", { surface: "mobile_bottom_sheet", trigger });
    } catch {}
    if (trigger !== "item_click") {
      restoreFocus();
    }
    // Reset guard on next microtask so subsequent opens work
    queueMicrotask(() => {
      closingRef.current = false;
    });
  }, [restoreFocus]);

  // Restore focus when the drawer closes (manual close or Vaul gesture)
  const prevOpenRef = useRef<boolean>(false);
  useEffect(() => {
    if (!isMenuOpen && prevOpenRef.current) {
      const reason = lastCloseReasonRef.current;
      if (reason && reason !== "item_click") {
        restoreFocus();
      }
    }
    prevOpenRef.current = isMenuOpen;
    // Reset last close reason after handling
    if (!isMenuOpen) lastCloseReasonRef.current = null;
  }, [isMenuOpen, restoreFocus]);

  // Centralize menu state event dispatch for header aria-expanded sync
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent(MOBILE_MENU_STATE, { detail: { open: isMenuOpen } }));
    } catch {}
  }, [isMenuOpen]);

  const handleMenuItemClick = useCallback((itemName: string) => {
    try {
      track("menu_item_click", { surface: "mobile_bottom_sheet", item: itemName });
    } catch {}
    closeMenu("item_click");
  }, [closeMenu]);

  // Bottom tabs nav removed; only bottom-sheet menu remains

  // Listen to header hamburger trigger, capture opener
  useEffect(() => {
    const onOpen = (evt: CustomEvent<OpenMobileMenuDetail>) => {
      const detail = evt.detail;
      openerRef.current = detail?.trigger ?? (document.activeElement as HTMLElement | null);
      openMenu(detail?.source ?? "header");
    };
    window.addEventListener(OPEN_MOBILE_MENU, onOpen as EventListener);
    return () => window.removeEventListener(OPEN_MOBILE_MENU, onOpen as EventListener);
  }, [openMenu]);

  // Vaul handles focus trap, Escape and scroll lock. We still listen for Escape to track analytics.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu("escape");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen, closeMenu]);

  const handleGetInTouchClick = useCallback((e: ReactMouseEvent<HTMLAnchorElement>) => {
    // Respect modifier/middle clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    const contactSection = document.getElementById("contact") || document.getElementById("quote");
    if (!contactSection) return; // let default anchor behavior navigate
    e.preventDefault();
    handleMenuItemClick("Get in Touch");
    // Close first to restore scrolling, then scroll and focus
    requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      try {
        contactSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      } catch {
        contactSection.scrollIntoView();
      }
      const firstField = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        '#contact input, #contact textarea, #contact select, #quote input, #quote textarea, #quote select'
      );
      if (firstField) {
        window.setTimeout(() => {
          firstField.focus({ preventScroll: true });
        }, 250);
      }
      const targetHash = (contactSection as HTMLElement).id ? `#${(contactSection as HTMLElement).id}` : "#contact";
      if (window.location.hash !== targetHash) {
        history.replaceState(null, "", targetHash);
      }
    });
  }, [handleMenuItemClick]);

  return (
    <>
      <Drawer.Root
        open={isMenuOpen}
        onOpenChange={(open) => {
          setIsMenuOpen(open);
          // Only attribute gesture close if no explicit reason was set
          if (!open && !closingRef.current && !lastCloseReasonRef.current) {
            lastCloseReasonRef.current = "gesture";
            try { track("menu_close", { surface: "mobile_bottom_sheet", trigger: "gesture" }); } catch {}
          }
        }}
        modal
      >
        <Drawer.Overlay
          className="fixed inset-0 bg-black/50 z-[200] md:hidden"
          data-testid="menu-overlay"
          onClick={() => closeMenu("backdrop")}
        />
        <Drawer.Content
          id="mobile-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          className="fixed inset-x-0 bottom-0 z-[210] md:hidden bg-slate-900 border-t border-slate-700/60 rounded-t-2xl shadow-2xl"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
        >
          <div className="max-w-screen-md mx-auto px-4 pt-2 pb-2">
            <Drawer.Handle className="mx-auto my-2 h-1.5 w-10 rounded-full bg-slate-600/70" aria-hidden="true" />
            <div className="flex items-center justify-between mb-2">
              <h3 id="mobile-menu-title" className="text-white font-semibold">Menu</h3>
              <button
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

            <div className="mt-3 pt-3 border-t border-slate-700/60">
              <h4 className="sr-only">Contact</h4>
              <div className="grid grid-cols-1 gap-2">
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsappDigits}?text=${encodeURIComponent(WHATSAPP_PRESET)}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="py-3 min-h-[44px] inline-flex items-center gap-2 text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                  aria-label="WhatsApp chat with Pat"
                >
                  <WhatsAppIcon size={18} aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="py-3 min-h-[44px] inline-flex items-center gap-2 text-gray-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                  aria-label="Email Pat"
                >
                  <MailIcon size={18} aria-hidden="true" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
