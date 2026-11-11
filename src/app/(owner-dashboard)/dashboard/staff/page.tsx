"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Plus,
  Copy,
  Check,
  Award,
} from "lucide-react";
import { DashboardStaff } from "@/app/api/v1/dashboard/staff/route";

export default function StaffLeaderboardPage() {
  const [staff, setStaff] = useState<DashboardStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [staffCode, setStaffCode] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/v1/dashboard/staff");
      if (res.ok) {
        const data = (await res.json()) as { staff?: DashboardStaff[] };
        if (data.staff) {
          setStaff(data.staff);
        }
      }
    } catch (e: unknown) {
      console.warn("Could not fetch staff:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !staffCode.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/dashboard/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, staffCode }),
      });

      if (res.ok) {
        setName("");
        setStaffCode("");
        setShowAddModal(false);
        void fetchStaff();
      }
    } catch (e: unknown) {
      console.error("Failed to add staff member:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch("/api/v1/dashboard/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !current } : s))
      );
    } catch (e: unknown) {
      console.warn("Failed to toggle staff status:", e);
    }
  };

  const handleCopyLink = (code: string) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const url = `${origin}/q/roast-pune?s=${code}`;
    void navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>Staff Gamification Leaderboard</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track which floor staff members are actively driving customer reviews
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Floor Waiter</span>
        </button>
      </div>

      {/* Gamification Motivation Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-amber-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Why Waiter Leaderboards Matter (Section 7 Trap #10)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Table standees get ignored if waiters don’t remind guests. Reward the top waiter each month!
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 shrink-0 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
          🏆 Top Performer: <strong>Rahul Sharma (21 reviews)</strong>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase text-[10px] sm:text-xs font-semibold border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4 text-center">Total Scans</th>
                <th className="py-3 px-4 text-center">Reviews Generated</th>
                <th className="py-3 px-4 text-center">Conversion</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Loading leaderboard...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No staff members added yet. Click &ldquo;Add Floor Waiter&rdquo; above.
                  </td>
                </tr>
              ) : (
                staff.map((member, index) => {
                  const isTop = index === 0;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-extrabold text-xs ${
                            isTop
                              ? "bg-amber-400 text-amber-950 shadow-sm shadow-amber-400/50"
                              : index === 1
                              ? "bg-gray-200 text-gray-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{member.name}</span>
                        {isTop && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold">
                            Leader 👑
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <code className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono">
                          {member.staffCode}
                        </code>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold">
                        {member.scansCount}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {member.reviewsGenerated}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                        {member.conversionRate}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            member.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                          }`}
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(member.staffCode)}
                            title="Copy Waiter QR Link"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            {copiedCode === member.staffCode ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleToggleActive(member.id, member.isActive)
                            }
                            title={
                              member.isActive
                                ? "Deactivate waiter"
                                : "Activate waiter"
                            }
                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                          >
                            {member.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Add New Floor Staff Member
            </h3>
            <p className="text-xs text-gray-500">
              Each staff member receives a personalized QR code suffix (e.g. ?s=code) to track their reviews.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amit Deshmukh"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Unique Staff Code (no spaces):
                </label>
                <input
                  type="text"
                  required
                  value={staffCode}
                  onChange={(e) =>
                    setStaffCode(e.target.value.replace(/\s+/g, "").toLowerCase())
                  }
                  placeholder="e.g. amit03"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-800 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
                >
                  {submitting ? "Adding..." : "Add to Leaderboard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
