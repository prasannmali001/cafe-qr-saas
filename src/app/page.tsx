import Link from "next/link";
import {
  Coffee,
  QrCode,
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  Trophy,
  Mic,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-900 dark:text-gray-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/20">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">
              CafeReview SaaS
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
              SDD v1.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
          >
            Owner Portal
          </Link>
          <Link
            href="/q/roast-pune?s=rahul01"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm shadow-amber-600/20 flex items-center gap-1.5"
          >
            <span>Scan QR Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-200 dark:border-amber-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Frictionless 3-Tap QR Micro-Experience + Anti-Footprint AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.15]">
          Turn Cafe Visits Into 5-Star{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
            Google Reviews
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          Zero login friction. Customers tap stars and highlights, speak in
          Hinglish or Hindi, enhance with AI, and copy synchronously to native
          Google Maps.
        </p>

        {/* Quick Launch Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/q/roast-pune?s=rahul01"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2.5"
          >
            <QrCode className="w-5 h-5" />
            <span>Test Customer Flow (Simulate Scan)</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 active:scale-[0.98] text-gray-900 dark:text-white font-bold text-base border border-gray-200 dark:border-gray-700 shadow-sm transition flex items-center justify-center gap-2.5"
          >
            <LayoutDashboard className="w-5 h-5 text-amber-600" />
            <span>Explore Cafe Owner Dashboard</span>
          </Link>
        </div>

        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              100% Google UGC Compliant
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Smart routing guides 4-5 stars to Google Maps while offering a
              private manager resolution box for 1-3 stars with compliant
              secondary links.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Voice-to-Review (Web Speech)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Customers speak freely in Hindi or Hinglish without typing long
              English sentences on mobile keyboards.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Waiter Gamification & Standees
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Custom QR codes per staff member track scans and generated
              reviews, boosting floor motivation each month.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto p-6 text-center text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
        Cafe QR SaaS • Spec-Driven Development Master Blueprint v1.0
      </footer>
    </div>
  );
}
