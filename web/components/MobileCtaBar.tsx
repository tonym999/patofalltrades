"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Phone } from "lucide-react";
import { CONTACT_INFO } from "@/config/contact";

export default function MobileCtaBar() {
  const [scrolled, setScrolled] = useState(false);

  const handleGetQuote = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Respect modifier/middle clicks and let browser handle them
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;

    const contactSection = document.getElementById("contact") || document.getElementById("quote");
    if (contactSection) {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      try {
        contactSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      } catch {
        contactSection.scrollIntoView();
      }
      // Focus the first field on the quote/contact form
      const firstField = document.getElementById("name") as HTMLInputElement | null;
      if (firstField) {
        window.setTimeout(() => {
          firstField.focus({ preventScroll: true });
        }, 250);
      }
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

  const secondaryCtaClassName =
    "group inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition-colors motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]";

  const neutralCtaClassName = `${secondaryCtaClassName} mobile-cta-neutral focus-visible:ring-[var(--ring-soft)]`;

  return (
    <nav
      aria-label="Primary actions"
      className={`mobile-cta-surface md:hidden fixed bottom-0 inset-x-0 z-[var(--z-cta)] border-t ${scrolled ? "bottom-cta--shadow" : ""}`}
      data-shadowed={scrolled ? "true" : "false"}
      data-testid="mobile-cta-bar"
      style={{ minHeight: "calc(var(--h-cta-active) + env(safe-area-inset-bottom, 0px))" }}
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
          >
            <Phone size={18} aria-hidden="true" className="text-[var(--gold)] transition-transform group-hover:-translate-y-0.5" />
            <span>Call</span>
          </a>
          <Link
            href="/#contact"
            onClick={handleGetQuote}
            className="cta-btn motion-emphasis group inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--gold)_50%,transparent)] bg-[var(--gold)] px-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] hover:bg-[var(--gold-hover)]"
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
