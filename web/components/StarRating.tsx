"use client";

import { Star } from "lucide-react";

export interface StarRatingProps {
  rating: number;
  max?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Decorative star row for ratings. Icons are aria-hidden; the container exposes
 * an accessible name (e.g., "Rated 5 out of 5").
 */
export function StarRating({ rating, max = 5, className = "", ariaLabel }: StarRatingProps) {
  const safeMax = Math.max(1, Math.floor(max));
  const rounded = Math.max(0, Math.min(safeMax, Math.round(rating)));
  const label = ariaLabel ?? `Rated ${rounded} out of ${safeMax}`;

  return (
    <div
      className={`inline-flex items-center gap-1 text-amber-400 ${className}`}
      aria-label={label}
      title={label}
      role="img"
      data-testid="star-rating"
    >
      {Array.from({ length: safeMax }).map((_, index) => {
        const isFilled = index < rounded;
        return (
          <Star
            key={index}
            className={`w-5 h-5 ${isFilled ? "text-amber-400 fill-current" : "text-slate-400/50"}`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}


