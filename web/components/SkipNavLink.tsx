"use client";

import type { MouseEvent as ReactMouseEvent } from "react";

export default function SkipNavLink() {
  const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById("main-content");
    if (!main) return;
    event.preventDefault();
    try {
      main.focus({ preventScroll: true });
    } catch {
      (main as HTMLElement).focus();
    }
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    try {
      main.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    } catch {
      main.scrollIntoView();
    }
    if (window.location.hash !== "#main-content") {
      try {
        history.replaceState(null, "", "#main-content");
      } catch {
        window.location.hash = "#main-content";
      }
    }
  };

  return (
    <a href="#main-content" className="skip-nav-link" onClick={handleClick}>
      Skip to main content
    </a>
  );
}
