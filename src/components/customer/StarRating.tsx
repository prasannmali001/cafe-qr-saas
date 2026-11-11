"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  scrollTargetId?: string;
}

export function StarRating({
  value,
  onChange,
  scrollTargetId = "tags-section",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleSelect = (star: number) => {
    onChange(star);

    // Frictionless Auto-scroll to tags section (Zero 'Next' button required)
    if (scrollTargetId && typeof window !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById(scrollTargetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
  };

  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 5:
        return "✨ Loved it! Exceptional experience";
      case 4:
        return "👍 Very good, really enjoyed it!";
      case 3:
        return "😐 Average, could be improved";
      case 2:
        return "🙁 Not great, service fell short";
      case 1:
        return "⚠️ Poor experience, had issues";
      default:
        return "Tap a star to rate your visit";
    }
  };

  const activeStar = hoverRating || value;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex items-center justify-center gap-2 sm:gap-3 py-2"
        role="radiogroup"
        aria-label="Star Rating"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeStar;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => handleSelect(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-2 sm:p-2.5 rounded-2xl transition-all duration-150 transform active:scale-90 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 touch-manipulation"
            >
              <Star
                className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors duration-150 ${
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                    : "fill-transparent text-gray-300 dark:text-gray-600 hover:text-amber-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      <p
        className={`text-sm font-medium transition-colors duration-150 ${
          value >= 4
            ? "text-emerald-600 dark:text-emerald-400"
            : value > 0
            ? "text-amber-600 dark:text-amber-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {getRatingLabel(value)}
      </p>
    </div>
  );
}
