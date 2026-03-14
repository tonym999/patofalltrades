"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Phone } from "lucide-react";
import { track } from "@vercel/analytics";
import { CONTACT_INFO } from "@/config/contact";
import { focusFirstEditable } from "@/lib/focusFirstEditable";

const EDITABLE_SELECTOR = [
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):not([disabled]):not([readonly])',
  "textarea:not([disabled]):not([readonly])",
  "select:not([disabled])",
  '[contenteditable="true"]',
  '[contenteditable="plaintext-only"]',
].join(", ");

function isEditableElement(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.matches(EDITABLE_SELECTOR);
}

function hasModifierClick(event: React.MouseEvent<HTMLAnchorElement>): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1;
}

export default function MobileCtaBar() {
  const [scrolled, setScrolled] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const handleCall = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasModifierClick(e)) return;

    try {
      track("cta_call_click", { position: "cta-bar" });
    } catch {}
  }, []);

  const handleGetQuote = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Respect modifier/middle clicks and let browser handle them
    if (hasModifierClick(e)) return;

    try {
      track("cta_quote_click", { position: "cta-bar" });
    } catch {}

    const contactSection = document.getElementById("contact") || document.getElementById("quote");
    if (contactSection) {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      try {
        contactSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      } catch {
        contactSection.scrollIntoView();
      }
      focusFirstEditable(undefined, 250);
      if (window.location.hash !== "#contact") {
        history.replaceState(null, "", "#contact");
      }
      return;
    }
    // Otherwise allow navigation to the route (keep href="#contact" on same page; consider "/#contact" if needed)
  }, []);

  // Add subtle shadow when the page is scrolled
  useEffect(() => {
    const onScroll = () => {
      const y = Math.max(0, window.scrollY || 0);
      setScrolled((prev) => {
        const next = y > 0;
        return prev === next ? prev : next;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Keep the old dataset signal for tests/debugging even though the bar now uses static tokens.
    const bar = document.querySelector<HTMLElement>('[data-testid="mobile-cta-bar"]');
    if (!bar) return;
    if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
      bar.dataset.safeAreaEnv = "unknown";
      return;
    }
    try {
      bar.dataset.safeAreaEnv = CSS.supports("padding-bottom", "env(safe-area-inset-bottom)") ? "supported" : "unsupported";
    } catch {
      bar.dataset.safeAreaEnv = "error";
    }
  }, []);

  useEffect(() => {
    const syncInputFocus = (target: EventTarget | null = document.activeElement) => {
      setInputFocused(isEditableElement(target));
    };

    const onFocusIn = (event: FocusEvent) => {
      syncInputFocus(event.target);
    };

    const onFocusOut = () => {
      requestAnimationFrame(() => {
        syncInputFocus();
      });
    };

    syncInputFocus();
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const secondaryCtaClassName =
    "interactive-focus-ring-soft group inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition-colors motion-standard";

  const neutralCtaClassName = `${secondaryCtaClassName} mobile-cta-neutral`;

  return (
    <nav
      aria-label="Primary actions"
      className={`mobile-cta-surface md:hidden fixed bottom-0 inset-x-0 z-[var(--z-cta)] border-t transition-[transform,opacity] motion-standard ${scrolled ? "bottom-cta--shadow" : ""}`}
      data-shadowed={scrolled ? "true" : "false"}
      data-testid="mobile-cta-bar"
      style={{
        minHeight: "calc(var(--h-cta-active) + env(safe-area-inset-bottom, 0px))",
        opacity: inputFocused ? 0 : 1,
        pointerEvents: inputFocused ? "none" : undefined,
        transform: inputFocused ? "translateY(calc(100% + env(safe-area-inset-bottom, 0px)))" : undefined,
        visibility: inputFocused ? "hidden" : "visible",
      }}
    >
      <div
        className="pt-1"
        style={{
          paddingLeft: "calc(1rem + env(safe-area-inset-left, 0px))",
          paddingRight: "calc(1rem + env(safe-area-inset-right, 0px))",
          paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom, 0px))",
        }}
        data-testid="mobile-cta-padding"
      >
        <div className="max-w-screen-md mx-auto grid grid-cols-2 gap-2">
          <a
            href={`tel:${CONTACT_INFO.phoneE164}`}
            aria-label={`Call ${CONTACT_INFO.phoneE164}`}
            className={neutralCtaClassName}
            data-testid="mobile-cta-link"
            data-action="call"
            onClick={handleCall}
          >
            <Phone size={18} aria-hidden="true" className="text-[var(--gold)] transition-transform group-hover:-translate-y-0.5" />
            <span>Call</span>
          </a>
          <Link
            href="/#contact"
            onClick={handleGetQuote}
            className="interactive-focus-ring cta-btn motion-emphasis group inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--gold)_50%,transparent)] bg-[var(--gold)] px-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[var(--gold-hover)]"
            data-testid="mobile-cta-link"
            data-action="get-quote"
          >
            <ClipboardList size={18} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5" />
            <span>Get Quote</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
