"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Hammer, Briefcase, Star, MoreHorizontal } from "lucide-react";

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
  // Map "More" to About section for now
  { href: "#about", label: "More", icon: MoreHorizontal, id: "about" },
] as const;

export default function MobileTabsNav() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

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
    window.addEventListener("load", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("load", update);
    };
  }, []);

  const items = useMemo(() => TABS, []);

  return (
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
      </ul>
    </nav>
  );
}


