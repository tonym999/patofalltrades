"use client";

import { useCallback } from "react";
import { CONTACT_INFO } from "@/config/contact";

export default function MobileCtaBar() {
  const handleGetQuote = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      try {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        contactSection.scrollIntoView();
      }
    }
    // Focus the first field on the quote/contact form
    const firstField = document.getElementById("name") as HTMLInputElement | null;
    if (firstField) {
      // Delay slightly to allow scroll to settle on mobile browsers
      window.setTimeout(() => {
        firstField.focus({ preventScroll: true });
      }, 250);
    }
    // If the anchor was provided, update the hash for deep-linking/back nav
    if (window.location.hash !== "#contact") {
      history.replaceState(null, "", "#contact");
    }
  }, []);

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-[50] bg-slate-900/95 backdrop-blur border-t border-slate-700/60"
    >
      <div
        className="px-4 pt-2 pb-2 pb-[max(env(safe-area-inset-bottom),12px)]"
      >
        <div className="max-w-screen-md mx-auto flex items-center gap-3">
          <a
            href={`tel:${CONTACT_INFO.phoneE164}`}
            className="flex-1 inline-flex items-center justify-center h-12 min-h-[44px] rounded-lg bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
          >
            Call
          </a>
          <a
            href="#contact"
            onClick={handleGetQuote}
            className="flex-1 inline-flex items-center justify-center h-12 min-h-[44px] rounded-lg bg-amber-500 text-slate-900 font-semibold shadow-sm hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
          >
            Get Quote
          </a>
        </div>
      </div>
    </div>
  );
}


