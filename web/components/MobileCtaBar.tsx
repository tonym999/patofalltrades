"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ClipboardList, MessageCircle, Phone } from "lucide-react";
import { CONTACT_INFO, whatsappHref } from "@/config/contact";

export default function MobileCtaBar() {
  const containerRef = useRef<HTMLDivElement | null>(null);
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

  // Expose CTA height to CSS var so other UI can offset
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const h = el.offsetHeight || 0;
      document.documentElement.style.setProperty("--cta-height", `${h}px`);
    };
    update();
    const ResizeObserverCtor = typeof window !== "undefined" ? (window as typeof window & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver : undefined;
    const ro = typeof ResizeObserverCtor === "function" ? new ResizeObserverCtor(update) : null;
    ro?.observe?.(el);
    window.addEventListener("orientationchange", update);
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    return () => {
      ro?.disconnect?.();
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("load", update);
      document.documentElement.style.setProperty("--cta-height", "0px");
    };
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

  return (
    <nav
      aria-label="Primary actions"
      className={`md:hidden fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl bg-white/70 border-t border-white/60 shadow-lg ${scrolled ? "bottom-cta--shadow" : ""}`}
      data-shadowed={scrolled ? "true" : "false"}
      ref={containerRef}
    >
      <div
        className="px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]"
        data-testid="mobile-cta-padding"
      >
        <div className="max-w-screen-md mx-auto grid grid-cols-3 gap-2">
          <a
            href={`tel:${CONTACT_INFO.phoneE164}`}
            aria-label={`Call ${CONTACT_INFO.phoneE164}`}
            className="group inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/5 px-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            data-testid="mobile-cta-link"
            data-action="call"
          >
            <Phone size={18} aria-hidden="true" className="text-slate-800 transition-transform group-hover:-translate-y-0.5" />
            <span>Call</span>
          </a>
          <a
            href={whatsappHref()}
            rel="noopener noreferrer"
            target="_blank"
            aria-label="WhatsApp chat with Pat"
            className="group inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-emerald-300/80 bg-transparent px-3 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            data-testid="mobile-cta-link"
            data-action="whatsapp"
          >
            <MessageCircle size={18} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5" />
            <span>WhatsApp</span>
          </a>
          <Link
            href="/#contact"
            onClick={handleGetQuote}
            className="group inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-amber-300/80 bg-transparent px-3 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
