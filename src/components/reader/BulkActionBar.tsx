"use client";

import { useState } from "react";
import { Check, ListPlus, X } from "lucide-react";
import { useReaderStore } from "@/stores/reader-store";
import { SABAQ_BATCH_MAX, KNOWN_RANGE_MAX } from "@/lib/constants";

/**
 * Floating action strip for bulk verse selection: "Mark known" and
 * "Add to Sabaq" both already have bulk server endpoints, so this only
 * needs to chunk oversized selections client-side.
 */
export function BulkActionBar({
  allKeys,
  isGuest,
  onResult,
  onProgressChange,
}: {
  /** Every verse key of the current surah — powers the "Select all" affordance. */
  allKeys: string[];
  /** Guests keep exploring: taps flash a sign-in hint instead of a request. */
  isGuest?: boolean;
  /** Fires with the user-facing outcome line; the workspace routes it to its flash toast. */
  onResult: (message: string) => void;
  /** Fired when progress data changed server-side; the workspace refreshes the RSC chip. */
  onProgressChange: () => void;
}) {
  const bulkSelected = useReaderStore((s) => s.bulkSelected);
  const clearBulkSelection = useReaderStore((s) => s.clearBulkSelection);
  const setBulkMode = useReaderStore((s) => s.setBulkMode);
  const selectBulkAll = useReaderStore((s) => s.selectBulkAll);

  const [busy, setBusy] = useState(false);

  const count = bulkSelected.length;

  const post = async (url: string, body: unknown): Promise<Response> =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  const handleMarkKnown = async () => {
    if (count === 0 || busy) return;
    if (isGuest) {
      onResult("Sign in to mark verses as known");
      return;
    }
    setBusy(true);
    try {
      // markKnown caps a single request at KNOWN_RANGE_MAX (a whole surah),
      // so a full-surah selection is one call; the mode's selection cannot
      // exceed one surah anyway.
      let ok = 0;
      for (let i = 0; i < bulkSelected.length; i += KNOWN_RANGE_MAX) {
        const chunk = bulkSelected.slice(i, i + KNOWN_RANGE_MAX);
        const res = await post("/api/memory-state", { verseKeys: chunk, known: true });
        if (res.ok) ok += chunk.length;
      }
      if (ok === count) onResult(`Marked ${ok} verses known`);
      else onResult(`Marked ${ok} of ${count} known — retry the rest`);
      clearBulkSelection();
      // The header progress chip is server-rendered data.
      if (ok > 0) onProgressChange();
    } catch {
      onResult("Could not reach the server — selection kept");
    } finally {
      setBusy(false);
    }
  };

  const handleAddToSabaq = async () => {
    if (count === 0 || busy) return;
    if (isGuest) {
      onResult("Sign in to add verses to Sabaq");
      return;
    }
    setBusy(true);
    try {
      // Sabaq batches are capped at SABAQ_BATCH_MAX; chunk sequentially so a
      // 286-verse "select all" still lands in the right order.
      let ok = 0;
      for (let i = 0; i < bulkSelected.length; i += SABAQ_BATCH_MAX) {
        const chunk = bulkSelected.slice(i, i + SABAQ_BATCH_MAX);
        const res = await post("/api/plan", { verseKeys: chunk });
        if (res.ok) ok += chunk.length;
      }
      if (ok === count) onResult(`Added ${ok} verses to Sabaq`);
      else onResult(`Added ${ok} of ${count} — retry the rest`);
      clearBulkSelection();
      if (ok > 0) onProgressChange();
    } catch {
      onResult("Could not reach the server — selection kept");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Bulk verse actions"
      className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-2 shadow-lg dark:border-amber-700/60 dark:bg-amber-950/70"
    >
      <span className="rounded-full bg-amber-600 px-2.5 py-1 text-xs font-bold text-white">
        {count} selected
      </span>

      <button
        onClick={handleMarkKnown}
        disabled={busy || count === 0}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer"
      >
        <Check className="h-3.5 w-3.5" /> Mark known
      </button>

      <button
        onClick={handleAddToSabaq}
        disabled={busy || count === 0}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer"
      >
        <ListPlus className="h-3.5 w-3.5" /> Add to Sabaq
      </button>

      <button
        onClick={() => selectBulkAll(allKeys)}
        disabled={busy || count === allKeys.length}
        className="rounded-full px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-800 disabled:opacity-50 dark:text-stone-400 dark:hover:text-stone-200 cursor-pointer"
      >
        Select all
      </button>

      <button
        onClick={clearBulkSelection}
        disabled={busy || count === 0}
        className="rounded-full px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-800 disabled:opacity-50 dark:text-stone-400 dark:hover:text-stone-200 cursor-pointer"
      >
        Clear
      </button>

      <button
        onClick={() => setBulkMode(false)}
        aria-label="Exit selection mode"
        className="rounded-full p-1 text-stone-400 transition-colors hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
