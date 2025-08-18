"use client";

import Link from "next/link";
import { MapPin, Quote } from "lucide-react";
import { StarRating } from "@/components/StarRating";

export type TestimonialCardProps = {
  quote: string;
  rating: number; // 0-5
  name: string;
  projectType?: string;
  location?: string;
  avatarUrl?: string; // not rendered unless used by parent; reserved
  href?: string; // render as link if present
  ratingMax?: number; // default 5
  date?: string;
  variant?: "default" | "compact";
  className?: string;
  readMore?: boolean; // starts expanded
};

/**
 * Accessible testimonial card.
 * Visual order: Stars → Quote → Attribution → Location.
 * - Semantic HTML: blockquote with footer and cite.
 * - Icons are decorative (aria-hidden).
 * - Focus styles for interactive wrapper.
 */
export function TestimonialCard({
  quote,
  rating,
  name,
  projectType,
  location,
  href,
  ratingMax = 5,
  className = "",
  readMore = false,
}: TestimonialCardProps) {
  const baseClass = `h-full flex flex-col rounded-2xl border border-slate-200/20 dark:border-slate-700/60 bg-slate-900/20 dark:bg-slate-900/30 shadow-sm hover:shadow-md hover:-translate-y-[2px] antialiased motion-safe:transition-shadow motion-safe:transition-transform motion-reduce:transform-none duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-slate-900 ${className}`;

  const content = (
      <div className="p-5 sm:p-6 md:p-8 flex flex-col gap-4">
        {/* Star row (stacked, self-start for alignment) */}
        <StarRating
          rating={rating}
          max={ratingMax}
          ariaLabel={`Rated ${Math.round(rating)} out of ${ratingMax}`}
          className="self-start mt-0.5"
        />

        {/* Quote below stars */}
        <blockquote
          className={`text-[15.5px] sm:text-base md:text-[17px] text-slate-200 dark:text-slate-100/90 leading-relaxed text-balance hyphens-auto border-l-[3px] border-l-amber-400/30 dark:border-l-amber-300/40 pl-4 ${
            readMore ? "" : "line-clamp-3 md:line-clamp-4"
          }`}
          data-testid="testimonial-quote"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="inline-flex items-start gap-2">
            <Quote className="w-4 h-4 translate-y-[1px] opacity-70" aria-hidden="true" />
            <span>{quote}</span>
          </span>
        </blockquote>

        {/* Footer attribution */}
        <footer className="mt-auto">
          <cite className="not-italic text-base">
            <span className="font-semibold text-slate-100">{name}</span>
            {projectType ? <span className="text-slate-300/90"> – {projectType}</span> : null}
          </cite>
          {location ? (
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400 dark:text-slate-300/80">
              <span className="sr-only">Location:</span>
              <MapPin className="w-4 h-4 opacity-80" aria-hidden="true" />
              <span>{location}</span>
            </div>
          ) : null}
        </footer>
      </div>
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}

TestimonialCard.Skeleton = function Skeleton() {
  return (
    <div className="h-full flex flex-col rounded-2xl border border-slate-200/20 dark:border-slate-700/60 bg-slate-900/20 dark:bg-slate-900/30 shadow-sm p-6 md:p-8">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-5 h-5 bg-slate-600/30 rounded" />
        ))}
      </div>
      <div className="space-y-2 border-l-2 border-slate-500/30 pl-4">
        <div className="h-4 bg-slate-600/30 rounded w-11/12" />
        <div className="h-4 bg-slate-600/30 rounded w-10/12" />
        <div className="h-4 bg-slate-600/30 rounded w-9/12" />
      </div>
      <div className="mt-auto pt-4">
        <div className="h-4 bg-slate-600/30 rounded w-6/12" />
        <div className="h-4 bg-slate-600/30 rounded w-5/12 mt-2" />
      </div>
    </div>
  );
};


