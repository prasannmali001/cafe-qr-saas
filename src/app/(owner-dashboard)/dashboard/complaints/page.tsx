"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  Star,
  Phone,
  User,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { DashboardComplaint } from "@/app/api/v1/dashboard/complaints/route";

export default function ComplaintsInboxPage() {
  const [complaints, setComplaints] = useState<DashboardComplaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/v1/dashboard/complaints");
      if (res.ok) {
        const data = (await res.json()) as {
          complaints?: DashboardComplaint[];
        };
        if (data.complaints) {
          setComplaints(data.complaints);
        }
      }
    } catch (e: unknown) {
      console.warn("Could not fetch complaints:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchComplaints();
  }, []);

  const handleToggleResolve = async (id: string, current: boolean) => {
    try {
      await fetch("/api/v1/dashboard/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isResolved: !current }),
      });
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isResolved: !current } : c))
      );
    } catch (e: unknown) {
      console.warn("Failed to update complaint status:", e);
    }
  };

  const unresolvedCount = complaints.filter((c) => !c.isResolved).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-amber-500" />
            <span>1-3★ Private Manager Complaints Inbox</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Actionable private feedback intercepted before public Google Maps posting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {unresolvedCount} Pending Review
          </span>
        </div>
      </div>

      {/* Compliance & FTC Policy Safe Loophole Banner (Section 7 Trap #4) */}
      <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
          <p className="font-bold">
            100% Google Maps UGC & FTC Compliant (Safe Loophole Architecture)
          </p>
          <p className="text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
            Hard review gating (completely hiding Google on 1-3 stars) violates
            Google policies and risks profile suspension. Our system offers an
            empathetic manager channel while keeping the subtle compliant
            public link active—over 95% of guests happily choose this manager
            box for fastest resolution!
          </p>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-gray-400 py-8">Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
              Zero Unresolved Complaints!
            </h3>
            <p className="text-xs text-gray-400">
              All private feedback tickets have been addressed by management.
            </p>
          </div>
        ) : (
          complaints.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border transition-all space-y-4 ${
                item.isResolved
                  ? "bg-gray-50/70 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-75"
                  : "bg-white dark:bg-gray-900 border-amber-200 dark:border-amber-900/60 shadow-sm"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  {/* Star Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-extrabold text-xs">
                    <span>{item.starRating}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </span>

                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Private Customer Complaint
                  </span>

                  {item.isResolved && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Resolved
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(item.createdAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>

              {/* Tags Selected */}
              <div className="flex flex-wrap gap-1.5">
                {item.selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Detailed Note */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 italic">
                &ldquo;{item.finalReviewText || "Customer did not add custom notes; flagged categories above."}&rdquo;
              </div>

              {/* Footer: Contact Info & Attribution & Resolution Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                  {item.customerContact ? (
                    <span className="inline-flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>{item.customerContact}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">
                      No contact details provided
                    </span>
                  )}

                  {item.staffName && (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        Served by: <strong>{item.staffName}</strong> (
                        {item.staffCode})
                      </span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void handleToggleResolve(item.id, item.isResolved)
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    item.isResolved
                      ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {item.isResolved ? "Re-open Ticket" : "Mark as Resolved"}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
