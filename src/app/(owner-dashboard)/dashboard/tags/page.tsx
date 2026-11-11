"use client";

import React, { useState, useEffect } from "react";
import { Tag as TagIcon, Plus, Trash2, Sparkles } from "lucide-react";
import { DashboardTag } from "@/app/api/v1/dashboard/tags/route";

export default function CustomTagsPage() {
  const [tags, setTags] = useState<DashboardTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"ALL" | "POSITIVE" | "NEGATIVE">("ALL");
  const [newTagText, setNewTagText] = useState<string>("");
  const [newTagSentiment, setNewTagSentiment] = useState<"POSITIVE" | "NEGATIVE">("POSITIVE");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/v1/dashboard/tags");
      if (res.ok) {
        const data = (await res.json()) as { tags?: DashboardTag[] };
        if (data.tags) {
          setTags(data.tags);
        }
      }
    } catch (e: unknown) {
      console.warn("Could not fetch tags:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTags();
  }, []);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/dashboard/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagText: newTagText,
          sentiment: newTagSentiment,
        }),
      });

      if (res.ok) {
        setNewTagText("");
        void fetchTags();
      }
    } catch (e: unknown) {
      console.error("Failed to add custom tag:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTag = async (id: string, current: boolean) => {
    try {
      await fetch("/api/v1/dashboard/tags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      setTags((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: !current } : t))
      );
    } catch (e: unknown) {
      console.warn("Failed to toggle tag status:", e);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await fetch(`/api/v1/dashboard/tags?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      console.warn("Failed to delete tag:", e);
    }
  };

  const filteredTags = tags.filter((t) => {
    if (filter === "ALL") return true;
    return t.sentiment === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <TagIcon className="w-7 h-7 text-amber-500" />
            <span>Custom Tag & Dish Manager</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Define your cafe’s signature items, specialties, and feedback categories
          </p>
        </div>
      </div>

      {/* Add Custom Tag Form Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Add New Custom Highlight / Dish Tag</span>
        </h2>

        <form
          onSubmit={handleAddTag}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <input
            type="text"
            required
            value={newTagText}
            onChange={(e) => setNewTagText(e.target.value)}
            placeholder="e.g. 🥞 Fluffy Blueberry Pancakes or 🍫 Belgian Hot Chocolate"
            className="flex-1 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <select
            value={newTagSentiment}
            onChange={(e) =>
              setNewTagSentiment(e.target.value as "POSITIVE" | "NEGATIVE")
            }
            className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="POSITIVE">Positive (4-5★ Review)</option>
            <option value="NEGATIVE">Constructive (1-3★ Feedback)</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="py-3 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Add Tag"}</span>
          </button>
        </form>
      </div>

      {/* Filter Tabs & Tag List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              filter === "ALL"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            All Tags ({tags.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("POSITIVE")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              filter === "POSITIVE"
                ? "bg-emerald-600 text-white"
                : "text-gray-500 hover:text-emerald-600"
            }`}
          >
            Positive Highlights (4-5★)
          </button>
          <button
            type="button"
            onClick={() => setFilter("NEGATIVE")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              filter === "NEGATIVE"
                ? "bg-amber-600 text-white"
                : "text-gray-500 hover:text-amber-600"
            }`}
          >
            Constructive Feedback (1-3★)
          </button>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {loading ? (
            <p className="text-xs text-gray-400 py-6">Loading tags...</p>
          ) : filteredTags.length === 0 ? (
            <p className="text-xs text-gray-400 py-6">No tags in this category.</p>
          ) : (
            filteredTags.map((tag) => (
              <div
                key={tag.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  tag.isActive
                    ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm"
                    : "bg-gray-50/50 dark:bg-gray-950 border-gray-100 dark:border-gray-900 opacity-60"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 block truncate">
                    {tag.tagText}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        tag.sentiment === "POSITIVE"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {tag.sentiment}
                    </span>
                    {tag.isCustom && (
                      <span className="text-[10px] text-gray-400">
                        Custom dish
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleToggleTag(tag.id, tag.isActive)}
                    title={tag.isActive ? "Deactivate tag" : "Activate tag"}
                    className={`text-[11px] px-2 py-1 rounded-lg font-medium transition ${
                      tag.isActive
                        ? "text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {tag.isActive ? "Active" : "Paused"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDeleteTag(tag.id)}
                    title="Delete custom tag"
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
