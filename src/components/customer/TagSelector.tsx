"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Check, Sparkles } from "lucide-react";

interface TagSelectorProps {
  cafeId: string;
  stars: number;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onAutoStitch?: (stitchedText: string) => void;
}

const CLIENT_FALLBACK_POSITIVE: readonly string[] = [
  "☕ Best Hazelnut Coffee",
  "🎵 Chill Vibe",
  "⚡ Fast Table Service",
  "🥐 Fresh Croissants",
  "🔌 Good Work Wi-Fi",
];

const CLIENT_FALLBACK_NEGATIVE: readonly string[] = [
  "⏳ Long Wait Time",
  "❄️ AC Too Cold",
  "📶 Wi-Fi Disconnected",
  "🔊 Music Too Loud",
  "☕ Coffee Was Luke-warm",
];

export function stitchTagsToReview(tags: string[], stars: number): string {
  if (tags.length === 0) return "";

  if (stars >= 4) {
    if (tags.length === 1) {
      return `Loved the ${tags[0]}! Truly great experience.`;
    }
    if (tags.length === 2) {
      return `Really enjoyed the ${tags[0]} and ${tags[1]}! High quality and great visit.`;
    }
    const last = tags[tags.length - 1];
    const rest = tags.slice(0, -1).join(", ");
    return `Really enjoyed the ${rest}, and ${last}! Highly recommended.`;
  } else {
    if (tags.length === 1) {
      return `Had an issue with ${tags[0]}. Hope management can look into this.`;
    }
    const last = tags[tags.length - 1];
    const rest = tags.slice(0, -1).join(", ");
    return `Faced a few issues with ${rest}, and ${last}. Would appreciate improvement.`;
  }
}

export function TagSelector({
  cafeId,
  stars,
  selectedTags,
  onToggleTag,
  onAutoStitch,
}: TagSelectorProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const prevStarsRef = useRef<number>(stars);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(false);

    const fallbackList =
      stars >= 4 ? CLIENT_FALLBACK_POSITIVE : CLIENT_FALLBACK_NEGATIVE;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const res = await fetch(
        `/api/v1/tags/random?cafeId=${encodeURIComponent(cafeId)}&stars=${stars}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error("Failed to fetch tags");
      }

      const data = (await res.json()) as { tags?: string[] };
      if (Array.isArray(data.tags) && data.tags.length > 0) {
        setTags(data.tags);
      } else {
        setTags([...fallbackList]);
      }
    } catch {
      // Instant Client Bundle Fallback (<1500ms failure mode for basement cafe networks)
      setError(true);
      setTags([...fallbackList]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [cafeId, stars]);

  useEffect(() => {
    // Only re-fetch if stars sentiment threshold crossed or first mount
    const prevSentiment = prevStarsRef.current >= 4;
    const currentSentiment = stars >= 4;

    if (tags.length === 0 || prevSentiment !== currentSentiment) {
      void fetchTags();
    }
    prevStarsRef.current = stars;
  }, [fetchTags, stars, tags.length]);

  const handlePillClick = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    let nextSelected: string[];

    if (isSelected) {
      nextSelected = selectedTags.filter((t) => t !== tag);
    } else {
      if (selectedTags.length >= 5) {
        return; // Max 5 tags cap
      }
      nextSelected = [...selectedTags, tag];
    }

    onToggleTag(tag);

    // Auto-stitch selected tags into draft review in textarea
    if (onAutoStitch) {
      const stitched = stitchTagsToReview(nextSelected, stars);
      onAutoStitch(stitched);
    }
  };

  return (
    <div id="tags-section" className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {stars >= 4
            ? "What did you enjoy most? (Tap 1-5 tags)"
            : "What could be improved? (Tap 1-5 tags)"}
        </label>
        {selectedTags.length > 0 && (
          <span className="text-xs text-gray-500 font-medium">
            {selectedTags.length}/5 selected
          </span>
        )}
      </div>

      {loading ? (
        // State 1: Shimmer skeleton shimmer loader for slow 3G networks
        <div className="flex flex-wrap gap-2 animate-pulse py-1">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="h-10 w-28 sm:w-36 rounded-full bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      ) : (
        // State 2: Selectable pill tags (with offline State 3 fallback automatically active)
        <div className="flex flex-wrap gap-2.5">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                onClick={() => handlePillClick(tag)}
                className={`group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95 touch-manipulation border ${
                  isSelected
                    ? stars >= 4
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200 dark:shadow-none"
                      : "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-200 dark:shadow-none"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:border-gray-400"
                }`}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 stroke-[2.5] animate-in fade-in zoom-in-50 duration-150" />
                )}
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          Offline tag mode active
        </p>
      )}
    </div>
  );
}
