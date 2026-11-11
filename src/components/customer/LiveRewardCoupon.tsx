"use client";

import React, { useState, useEffect } from "react";
import {
  Gift,
  Clock,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface LiveRewardCouponProps {
  cafeName: string;
  rewardText: string;
  verificationCode: string;
  onReset?: () => void;
}

export function LiveRewardCoupon({
  cafeName,
  rewardText,
  verificationCode,
  onReset,
}: LiveRewardCouponProps) {
  const [currentTimestamp, setCurrentTimestamp] = useState<string>("");
  const [ticker, setTicker] = useState<number>(0);

  // Live ticking clock (anti-screenshot validation for waiters - Section 7 Trap #12)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimestamp(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
          " • " +
          now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
      );
      setTicker((prev) => (prev + 1) % 60);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-4 animate-in zoom-in-95 fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-600 via-teal-700 to-emerald-900 text-white p-6 sm:p-7 shadow-2xl border-4 border-emerald-400/40">
        {/* Animated Live Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE VERIFIED PASS</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-200/90 bg-white/10 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTimestamp || "Loading..."}</span>
          </div>
        </div>

        {/* Cafe & Offer */}
        <div className="text-center space-y-1 my-4">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {cafeName}
          </h3>
          <p className="text-xs text-emerald-100 font-medium">
            Google Review Verified Reward
          </p>
          <div className="py-3 px-4 my-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25">
            <p className="text-base sm:text-lg font-extrabold text-white flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-amber-300" />
              <span>{rewardText}</span>
            </p>
          </div>
        </div>

        {/* Unique Verification Pass Code */}
        <div className="p-4 rounded-2xl bg-black/35 backdrop-blur-sm border border-white/15 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
            One-Time Counter Code
          </span>
          <p className="font-mono text-lg sm:text-xl font-black tracking-wider text-amber-300">
            {verificationCode}
          </p>
          <p className="text-[10px] text-emerald-200/70">
            Active session pulse #{ticker}
          </p>
        </div>

        {/* Waiter Anti-Screenshot Verification Guide */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Waiters: Verify live ticking seconds above</span>
          </div>
          <span className="font-semibold text-emerald-300">Authentic</span>
        </div>
      </div>

      {onReset && (
        <div className="text-center">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 underline inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset / Submit Another Review (Dev Mode)</span>
          </button>
        </div>
      )}
    </div>
  );
}
