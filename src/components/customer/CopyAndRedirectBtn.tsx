"use client";

import React, { useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";

interface Props {
  reviewText: string;
  googlePlaceId: string;
  cafeName?: string;
  redirectUrl?: string;
  onSubmitted?: () => void;
  className?: string;
}

export function CopyAndRedirectBtn({
  reviewText,
  googlePlaceId,
  cafeName = "the cafe",
  redirectUrl,
  onSubmitted,
  className = "",
}: Props) {
  const [copied, setCopied] = useState<boolean>(false);
  const [showManualBox, setShowManualBox] = useState<boolean>(false);

  const fallbackCopy = (text: string): boolean => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Position offscreen to avoid screen flicker on iOS Safari
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  };

  const handleTap = () => {
    let copySuccessful = true;

    // 1. Synchronous Copy (Works reliably inside direct user tap on iOS Safari & Chrome)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(reviewText).catch(() => {
        const ok = fallbackCopy(reviewText);
        if (!ok) {
          setShowManualBox(true);
          copySuccessful = false;
        }
      });
    } else {
      const ok = fallbackCopy(reviewText);
      if (!ok) {
        setShowManualBox(true);
        copySuccessful = false;
      }
    }

    if (copySuccessful) {
      setCopied(true);
    }

    if (onSubmitted) {
      onSubmitted();
    }

    // 2. Construct Direct Google Write-Review URL (Universal Fallback)
    const targetUrl =
      redirectUrl ||
      `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
        googlePlaceId
      )}`;

    // 3. Redirect after 350ms so user clearly perceives "Copied! Just Paste" visual confirmation
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 380);
  };

  const handleManualSelect = () => {
    const el = document.getElementById("manual-review-box") as HTMLTextAreaElement | null;
    if (el) {
      el.focus();
      el.select();
      fallbackCopy(reviewText);
      setCopied(true);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleTap}
        aria-label={`Copy review and open Google Maps for ${cafeName}`}
        className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-500/25 transition-all duration-150 flex items-center justify-center gap-2 touch-manipulation ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 text-emerald-300 stroke-[3]" />
            <span>✅ Review Copied! Opening Google...</span>
          </>
        ) : (
          <>
            <span>🚀 Tap to Copy & Post on Google</span>
            <ExternalLink className="w-5 h-5 opacity-90" />
          </>
        )}
      </button>

      {/* Safari Clipboard Block Fallback: Manual Select & Copy */}
      {showManualBox && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2 animate-in fade-in">
          <p className="font-semibold">
            Clipboard blocked by browser. Tap below to copy text manually:
          </p>
          <textarea
            id="manual-review-box"
            readOnly
            value={reviewText}
            className="w-full p-2 text-xs rounded bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-700 text-gray-800 dark:text-gray-200"
            rows={2}
          />
          <button
            type="button"
            onClick={handleManualSelect}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Select All & Copy</span>
          </button>
        </div>
      )}
    </div>
  );
}
