"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  ShieldAlert,
  Coffee,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { DashboardStaff } from "@/app/api/v1/dashboard/staff/route";

export default function QrStandeesPage() {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [staffList, setStaffList] = useState<DashboardStaff[]>([]);
  const [tableNumber, setTableNumber] = useState<string>("Table 1");
  const [previewFormat, setPreviewFormat] = useState<"standee" | "badge">("standee");

  const slug = "roast-pune";

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch("/api/v1/dashboard/staff");
        if (res.ok) {
          const data = (await res.json()) as { staff?: DashboardStaff[] };
          if (data.staff) {
            setStaffList(data.staff);
          }
        }
      } catch (e: unknown) {
        console.warn("Failed to load staff list for standees:", e);
      }
    }
    void loadStaff();
  }, []);

  const staffQuery = selectedStaff ? `&staffCode=${encodeURIComponent(selectedStaff)}` : "";
  const qrSvgUrl = `/api/v1/qr/generate?slug=${slug}${staffQuery}&format=svg`;
  const qrPngDownloadUrl = `/api/v1/qr/generate?slug=${slug}${staffQuery}&format=png&download=true`;
  const qrSvgDownloadUrl = `/api/v1/qr/generate?slug=${slug}${staffQuery}&format=svg&download=true`;

  const permanentRedirectUrl = `https://roastcafe.in/q/${slug}${selectedStaff ? `?s=${selectedStaff}` : ""}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Printable QR Standee Studio
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate high-DPI acrylic table standees and staff bill-folder QR cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={qrSvgDownloadUrl}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Download SVG</span>
          </a>
          <a
            href={qrPngDownloadUrl}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res PNG</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Controls & Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Standee Configuration
            </h2>

            {/* Standee Type Toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Format Type:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewFormat("standee")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    previewFormat === "standee"
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  Acrylic Table Standee
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFormat("badge")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    previewFormat === "badge"
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  Staff Bill-Folder Badge
                </button>
              </div>
            </div>

            {/* Waiter Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Attributed Waiter (Gamified Tracking):
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Table Generic (No waiter code)</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.staffCode}>
                    {s.name} ({s.staffCode}) — {s.reviewsGenerated} reviews
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Tracking code will be embedded as ?s={selectedStaff || "none"}
              </p>
            </div>

            {/* Table Number Label */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Table or Standee Label:
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. Table 1, Window Corner"
                className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Permanent URL Preview */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Permanent Encoded Redirect URL:
              </span>
              <p className="font-mono text-[11px] text-amber-700 dark:text-amber-300 truncate">
                {permanentRedirectUrl}
              </p>
            </div>
          </div>

          {/* Section 7 Trap #13: Tamper-Proof Standee Guide */}
          <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Anti-Tampering & Security Best Practices</span>
            </div>
            <ul className="text-xs text-amber-900/80 dark:text-amber-300/80 space-y-2 list-disc list-inside">
              <li>
                <strong>Seal in Double-Sided Acrylic:</strong> Never leave paper
                stickers exposed on tables where scammers can paste fake QR codes.
              </li>
              <li>
                <strong>Daily Staff Sweep:</strong> Train floor managers to check
                table standees during morning table wipe-downs.
              </li>
              <li>
                <strong>High Error Correction (30%):</strong> Our QR codes use Level
                H correction so they scan reliably even with light scratches.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Printable Standee Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-sm">
            {previewFormat === "standee" ? (
              /* Acrylic Table Standee Mockup */
              <div className="bg-white rounded-3xl p-7 shadow-2xl border-4 border-amber-900/10 text-center space-y-5 text-gray-900 relative">
                {/* Standee Acrylic Header */}
                <div className="flex flex-col items-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/30">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight">
                    The Roast Cafe
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Artisan Brews & Bakery • {tableNumber}
                  </p>
                </div>

                {/* QR Canvas */}
                <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 inline-block shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrSvgUrl}
                    alt="Scan Table QR Code"
                    width={220}
                    height={220}
                    className="mx-auto rounded-xl"
                  />
                </div>

                {/* Call to Action */}
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Scan to Review in 3 Taps</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Takes under 15 seconds. No typing required!
                  </p>
                </div>

                {/* Reward Coupon Banner */}
                <div className="py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  🎁 Claim 10% OFF on your next coffee!
                </div>

                {/* Waiter Attribution Footer */}
                {selectedStaff && (
                  <p className="text-[10px] text-gray-400 font-medium">
                    Staff Code: {selectedStaff}
                  </p>
                )}
              </div>
            ) : (
              /* Waiter Bill Folder Badge Mockup */
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-200 text-center space-y-4 text-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">The Roast Cafe</h4>
                      <p className="text-[10px] text-gray-400">Bill Folder Card</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {selectedStaff || "Floor Staff"}
                  </span>
                </div>

                <div className="p-2 bg-gray-50 rounded-xl inline-block border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrSvgUrl}
                    alt="Staff QR"
                    width={160}
                    height={160}
                    className="mx-auto rounded-lg"
                  />
                </div>

                <p className="text-xs font-semibold text-gray-800">
                  &ldquo;Hope you enjoyed our service today! Tap to share your thoughts.&rdquo;
                </p>
              </div>
            )}

            {/* Quick Action Buttons Under Preview */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <a
                href={qrPngDownloadUrl}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG File</span>
              </a>
              <span className="text-gray-300">•</span>
              <a
                href={`/q/${slug}${staffQuery}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
              >
                <span>Test Redirect</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
