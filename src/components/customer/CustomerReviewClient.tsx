"use client";

import React, { useState, useId, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Coffee,
  Gift,
  HeartHandshake,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  X,
} from "lucide-react";
import { StarRating } from "./StarRating";
import { TagSelector } from "./TagSelector";
import { VoiceMicButton } from "./VoiceMicButton";
import { CopyAndRedirectBtn } from "./CopyAndRedirectBtn";
import { LiveRewardCoupon } from "./LiveRewardCoupon";
import { buildGoogleDeeplinks } from "@/lib/google-deeplink";

export interface CafeData {
  id: string;
  name: string;
  slug: string;
  googlePlaceId: string;
  logoUrl: string | null;
  rewardText: string | null;
}

interface CustomerReviewClientProps {
  cafe: CafeData;
  staffCode?: string;
  staffName?: string;
}

export function CustomerReviewClient({
  cafe,
  staffCode,
  staffName,
}: CustomerReviewClientProps) {
  const generatedId = useId();

  // Persistent session ID for this customer visit
  const [sessionId] = useState<string>(() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  });

  const [stars, setStars] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<string>("");
  const [aiUsesLeft, setAiUsesLeft] = useState<number>(3);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);
  const [managerSubmitted, setManagerSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Trap #6: 24h Cooldown Guard & Table PIN State
  const [hasCooldown, setHasCooldown] = useState<boolean>(false);
  const [savedCouponCode, setSavedCouponCode] = useState<string>("");
  const [requireTablePin, setRequireTablePin] = useState<boolean>(false);
  const [expectedPin, setExpectedPin] = useState<string>("24");
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinVerified, setPinVerified] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pendingRouting, setPendingRouting] = useState<"GOOGLE_PUBLIC" | "INTERNAL_MANAGER" | null>(null);

  // Trap #12: Live Timestamped Reward Coupon State
  const [rewardState, setRewardState] = useState<"IDLE" | "COUNTDOWN" | "UNLOCKED">("IDLE");
  const [countdown, setCountdown] = useState<number>(12);

  const isPositive = stars >= 4;
  const deeplinks = buildGoogleDeeplinks(cafe.googlePlaceId, cafe.name);

  // Check 24-hour Cooldown on Initial Mount (Trap #6)
  useEffect(() => {
    const saved = localStorage.getItem(`cafe_review_cooldown_${cafe.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { at: number; code?: string };
        const elapsedHours = (Date.now() - parsed.at) / (1000 * 60 * 60);
        if (elapsedHours < 24) {
          setHasCooldown(true);
          setSavedCouponCode(
            parsed.code || `ROAST-PASS-${sessionId.slice(-6).toUpperCase()}`
          );
        }
      } catch {
        // Ignore parse error
      }
    }

    // Load active security settings from API
    async function loadSecuritySettings() {
      try {
        const res = await fetch("/api/v1/dashboard/settings");
        if (res.ok) {
          const data = (await res.json()) as {
            requireTablePin?: boolean;
            tablePin?: string;
          };
          if (data.requireTablePin !== undefined) {
            setRequireTablePin(data.requireTablePin);
          }
          if (data.tablePin) {
            setExpectedPin(data.tablePin);
          }
        }
      } catch {
        // Use default offline settings
      }
    }
    void loadSecuritySettings();
  }, [cafe.id, sessionId]);

  // Trap #12: 12-Second Verification Countdown & Window Focus Listener
  useEffect(() => {
    if (rewardState !== "COUNTDOWN") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRewardState("UNLOCKED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // If user switches back to this tab from Google Maps app, immediately unlock coupon
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRewardState("UNLOCKED");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [rewardState]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAutoStitch = (stitched: string) => {
    setReviewText(stitched);
  };

  const handleVoiceTranscript = (spokenText: string) => {
    setReviewText((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  // Submit session telemetry to backend
  const logSessionSubmission = async (
    routedTo: "GOOGLE_PUBLIC" | "INTERNAL_MANAGER"
  ) => {
    try {
      await fetch("/api/v1/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          cafeId: cafe.id,
          staffCode: staffCode || undefined,
          starRating: stars,
          selectedTags,
          finalReviewText: reviewText || undefined,
          routedTo,
          customerContact: contactInfo || undefined,
        }),
      });

      // Save 24h Cooldown in LocalStorage and Browser Cookie (Trap #6)
      const couponCode = `ROAST-VERIFIED-${sessionId.slice(-6).toUpperCase()}`;
      localStorage.setItem(
        `cafe_review_cooldown_${cafe.id}`,
        JSON.stringify({ at: Date.now(), code: couponCode })
      );
      document.cookie = `cafe_cooldown_${cafe.id}=true; max-age=86400; path=/; samesite=strict`;
    } catch (e: unknown) {
      console.warn("Telemetry submission fallback:", e);
    }
  };

  // Verify PIN before proceeding (Trap #6)
  const verifyPinAndProceed = (targetRoute: "GOOGLE_PUBLIC" | "INTERNAL_MANAGER") => {
    if (requireTablePin && !pinVerified) {
      setPendingRouting(targetRoute);
      setShowPinModal(true);
      return false;
    }
    return true;
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === expectedPin.trim()) {
      setPinVerified(true);
      setPinError(null);
      setShowPinModal(false);

      if (pendingRouting === "INTERNAL_MANAGER") {
        void executeManagerSubmit();
      }
    } else {
      setPinError(`Incorrect Table PIN. Please check the acrylic standee on your table.`);
    }
  };

  // 1-3 Star Manager Submit
  const handleManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPinAndProceed("INTERNAL_MANAGER")) return;
    await executeManagerSubmit();
  };

  const executeManagerSubmit = async () => {
    setIsSubmitting(true);
    await logSessionSubmission("INTERNAL_MANAGER");
    setIsSubmitting(false);
    setManagerSubmitted(true);
  };

  // AI Enhance Action
  const handleAiEnhance = async () => {
    if (aiUsesLeft <= 0 || isEnhancing) return;

    setIsEnhancing(true);
    setRateLimitNotice(null);

    try {
      const res = await fetch("/api/v1/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          cafeName: cafe.name,
          starRating: stars,
          selectedTags:
            selectedTags.length > 0 ? selectedTags : ["Great service"],
          rawUserInput: reviewText,
          languageHint: "en",
        }),
      });

      if (res.status === 429) {
        const errorData = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setAiUsesLeft(0);
        setRateLimitNotice(
          errorData.error || "Max 3 AI enhancements reached for this session."
        );
        return;
      }

      if (res.ok) {
        const data = (await res.json()) as {
          enhancedText?: string;
          remainingUses?: number;
          source?: "cache" | "gemini";
        };

        if (data.enhancedText) {
          setReviewText(data.enhancedText);
        }

        if (typeof data.remainingUses === "number") {
          setAiUsesLeft(data.remainingUses);
          if (data.remainingUses === 0) {
            setRateLimitNotice("All 3 AI enhancements used. Review is ready!");
          }
        } else {
          setAiUsesLeft((prev) => Math.max(0, prev - 1));
        }
        return;
      }

      throw new Error(`Endpoint returned status ${res.status}`);
    } catch {
      // Graceful local enhancement fallback (Section 3.2 State 4)
      const tagsPhrase =
        selectedTags.length > 0
          ? selectedTags.join(", ")
          : "coffee and peaceful vibe";

      let fallbackEnhanced = "";
      if (stars >= 4) {
        fallbackEnhanced = reviewText.trim()
          ? `${reviewText.trim()} Loved the ${tagsPhrase} in particular. Great place to visit!`
          : `Really enjoyed the ${tagsPhrase} at ${cafe.name}! Prompt service and delicious items. Will visit again.`;
      } else {
        fallbackEnhanced = reviewText.trim()
          ? `${reviewText.trim()} Service needs attention regarding ${tagsPhrase}.`
          : `Visited ${cafe.name} today. The ${tagsPhrase} could be much better. Hope management addresses this.`;
      }

      setReviewText(fallbackEnhanced);
      setAiUsesLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setRateLimitNotice("All 3 AI enhancements used. Review is ready!");
        }
        return next;
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const resetCooldownForTesting = () => {
    localStorage.removeItem(`cafe_review_cooldown_${cafe.id}`);
    setHasCooldown(false);
    setRewardState("IDLE");
  };

  // Cooldown Guard Screen (Trap #6)
  if (hasCooldown) {
    return (
      <main className="min-h-screen py-8 px-4 sm:px-6 bg-gradient-to-b from-emerald-50/50 via-white to-gray-50 dark:from-gray-900 dark:to-black flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <span className="text-3xl">☕</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Feedback Received Today!
            </h2>
            <p className="text-xs text-gray-500">
              You’ve already shared a review for this cafe visit. Here is your active discount coupon:
            </p>
          </div>

          <LiveRewardCoupon
            cafeName={cafe.name}
            rewardText={cafe.rewardText || "10% OFF on your next coffee!"}
            verificationCode={savedCouponCode || `ROAST-PASS-ACTIVE`}
            onReset={resetCooldownForTesting}
          />
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen py-6 px-4 sm:px-6 transition-colors duration-300 ${
        isPositive
          ? "bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-900 dark:via-gray-950 dark:to-black"
          : "bg-gradient-to-b from-amber-50 via-yellow-50/40 to-white dark:from-gray-900 dark:via-gray-950 dark:to-black"
      }`}
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Cafe Header Brand Card */}
        <header className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden shadow-md shadow-amber-900/10 border-2 border-white dark:border-gray-800 bg-amber-100 dark:bg-gray-800 flex items-center justify-center">
            {cafe.logoUrl ? (
              <Image
                src={cafe.logoUrl}
                alt={cafe.name}
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            ) : (
              <Coffee className="w-8 h-8 text-amber-700 dark:text-amber-400" />
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {cafe.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Your quick feedback powers our daily craft
            </p>
          </div>

          {/* Optional Staff Attribution Badge */}
          {staffCode && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-medium border border-amber-200 dark:border-amber-800">
              <span>☕</span>
              <span>
                Served by {staffName || `Staff member #${staffCode}`}
              </span>
            </div>
          )}

          {/* Trap #6: Table PIN Active Security Indicator */}
          {requireTablePin && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-200 dark:border-blue-900">
              <ShieldCheck className="w-3 h-3" />
              <span>In-Store Table PIN Protected</span>
            </div>
          )}
        </header>

        {/* Step 1: Star Rating Section */}
        <section className="bg-white dark:bg-gray-900/90 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Step 1 of 3
            </h2>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
              How was your experience?
            </h3>
          </div>

          <StarRating
            value={stars}
            onChange={(val) => setStars(val)}
            scrollTargetId="tags-section"
          />
        </section>

        {/* Step 2: Dynamic Tag Selector */}
        <section className="bg-white dark:bg-gray-900/90 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Step 2 of 3
            </h2>
          </div>

          <TagSelector
            cafeId={cafe.id}
            stars={stars}
            selectedTags={selectedTags}
            onToggleTag={handleToggleTag}
            onAutoStitch={handleAutoStitch}
          />
        </section>

        {/* Step 3: Review Text & Voice Input & AI Enhancer */}
        <section className="bg-white dark:bg-gray-900/90 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Step 3 of 3
            </h2>
            <VoiceMicButton onTranscript={handleVoiceTranscript} />
          </div>

          <div className="relative">
            <textarea
              id="review-textarea"
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={
                isPositive
                  ? "Tap tags above or speak your thoughts..."
                  : "Tell us what went wrong so we can fix it..."
              }
              className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
            />
          </div>

          {/* AI Enhance Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleAiEnhance}
              disabled={isEnhancing || aiUsesLeft <= 0}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border ${
                aiUsesLeft > 0
                  ? "bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border-amber-300 dark:border-amber-700 active:scale-95"
                  : "bg-gray-100 text-gray-400 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                {isEnhancing
                  ? "✨ Writing like a human..."
                  : `✨ AI Enhance (${aiUsesLeft}/3 left)`}
              </span>
            </button>

            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {reviewText.length}/300 chars
            </span>
          </div>

          {rateLimitNotice && (
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium pt-1 animate-in fade-in">
              ℹ️ {rateLimitNotice}
            </p>
          )}
        </section>

        {/* Step 4: Compliant Smart Routing */}
        {isPositive ? (
          /* ================= 4-5 STARS: GOOGLE MAPS ROUTE ================= */
          <section className="space-y-4">
            {/* Live Reward Verification Screen (Trap #12) */}
            {rewardState === "UNLOCKED" ? (
              <LiveRewardCoupon
                cafeName={cafe.name}
                rewardText={cafe.rewardText || "10% OFF on your next coffee!"}
                verificationCode={`ROAST-VERIFIED-${sessionId.slice(-6).toUpperCase()}`}
                onReset={() => setRewardState("IDLE")}
              />
            ) : rewardState === "COUNTDOWN" ? (
              <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 text-center space-y-4 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-lg mx-auto animate-bounce">
                  {countdown}s
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Review Submitted to Google Maps!
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Please paste your review in Google Maps. Generating your live counter discount pass...
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRewardState("UNLOCKED")}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
                >
                  I Posted on Google (Unlock Coupon Now)
                </button>
              </div>
            ) : (
              <>
                {/* Reward Coupon Preview Card */}
                {cafe.rewardText && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Customer Reward
                      </h4>
                      <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium">
                        {cafe.rewardText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Synchronous Copy & Native Maps Deep-Link CTA */}
                <CopyAndRedirectBtn
                  reviewText={
                    reviewText ||
                    `Loved the experience at ${cafe.name}! Highly recommended.`
                  }
                  googlePlaceId={cafe.googlePlaceId}
                  cafeName={cafe.name}
                  redirectUrl={deeplinks.webReviewUrl}
                  onSubmitted={() => {
                    void logSessionSubmission("GOOGLE_PUBLIC");
                    // Trigger Live Reward Verification Countdown (Trap #12)
                    setRewardState("COUNTDOWN");
                  }}
                />

                <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                  Tapping copies your review and opens Google Maps directly. Just tap paste!
                </p>
              </>
            )}
          </section>
        ) : (
          /* ================= 1-3 STARS: MANAGER INBOX + COMPLIANT GOOGLE LINK ================= */
          <section className="space-y-4">
            {managerSubmitted ? (
              <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto" />
                <h3 className="text-lg font-bold text-amber-950 dark:text-amber-200">
                  Thank you for your honesty
                </h3>
                <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-300/80">
                  Your feedback has been sent directly to the cafe owner & manager inbox. We truly appreciate your input to help us improve!
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleManagerSubmit}
                className="bg-amber-50/70 dark:bg-amber-950/20 rounded-3xl p-5 sm:p-6 border border-amber-200 dark:border-amber-900 space-y-4"
              >
                <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                  <HeartHandshake className="w-5 h-5 text-amber-600 shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold">
                    We’re sorry your visit fell short!
                  </h3>
                </div>

                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  Send your thoughts directly to the cafe manager. We take every note seriously.
                </p>

                <div>
                  <label
                    htmlFor={`contact-${generatedId}`}
                    className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1"
                  >
                    Optional contact (for manager follow-up):
                  </label>
                  <input
                    id={`contact-${generatedId}`}
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Your phone number or email (optional)"
                    className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-sm sm:text-base shadow-md shadow-amber-600/20 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "Sending to Manager..."
                      : "📩 Send Directly to Cafe Manager (Fastest Resolution)"}
                  </span>
                </button>
              </form>
            )}

            {/* MANDATORY Google Maps UGC Compliant Secondary Link (Section 7 Trap #4) */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  void logSessionSubmission("GOOGLE_PUBLIC");
                  window.location.href = deeplinks.webReviewUrl;
                }}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline inline-flex items-center gap-1 transition-colors"
              >
                <span>Or post publicly on Google</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </section>
        )}

        <footer className="text-center pt-4 pb-8 text-[11px] text-gray-400 dark:text-gray-600">
          Powered by Cafe QR SaaS • Frictionless Review Flow
        </footer>
      </div>

      {/* Trap #6: Table PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>Verify Table Standee PIN</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              To verify you are currently dining at <strong>{cafe.name}</strong>, enter the Table PIN displayed on your table standee (default: <strong>{expectedPin}</strong>):
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="e.g. 24"
                className="w-full text-center tracking-widest text-2xl font-mono p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-amber-300 dark:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />

              {pinError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md"
              >
                Confirm PIN & Proceed
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
