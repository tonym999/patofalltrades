"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CONTACT_INFO } from "@/config/contact";

export default function MobileCtaBar() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const handleGetQuote = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Respect modifier/middle clicks and let browser handle them
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;

    const contactSection = document.getElementById("contact") || document.getElementById("quote");
    if (contactSection) {
      e.preventDefault();
      try {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
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
      document.documentElement.style.setProperty("--cta-height", "0px");
    };
  }, []);

  // Add subtle shadow when the page is scrolled
  useEffect(() => {
    const onScroll = () => {
      setScrolled((window.scrollY || 0) > 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll as EventListener);
  }, []);

  return (
    <nav
      aria-label="Primary actions"
      className={`md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur border-t border-slate-700/60 ${scrolled ? "bottom-cta--shadow" : ""}`}
      ref={containerRef}
    >
      <div
        className="px-4 pt-2 pb-2 pb-[max(env(safe-area-inset-bottom),12px)]"
        data-testid="mobile-cta-padding"
      >
        <div className="max-w-screen-md mx-auto flex items-center gap-3">
          <a
            href={`tel:${CONTACT_INFO.phoneE164}`}
            className="flex-1 inline-flex items-center justify-center h-12 min-h-[44px] rounded-lg bg-blue-700 text-white font-semibold shadow-sm hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
          >
            Call
          </a>
          <Link
            href="/#contact"
            onClick={handleGetQuote}
            className="flex-1 inline-flex items-center justify-center h-12 min-h-[44px] rounded-lg bg-amber-500 text-slate-900 font-semibold shadow-sm hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
          >
            Get Quote
          </Link>
        </div>
      </div>
    </nav>
  );
}


