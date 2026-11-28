"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import { usePace } from "@/hooks/use-srs-data";
import { computePace, type PaceStats } from "@/lib/progress/pace";
import { DAY_MS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PACE_TARGET_KEY = "pace-target-date";

function defaultTargetDateMs() {
  // End of next Ramadan is unknowable; a full khatm over the coming 'umrah
  // season works: last day of the calendar year, three months out.
  const nextYearEnd = new Date(new Date().getUTCFullYear() + 1, 0, 0, 23, 59, 59);
  return Math.max(nextYearEnd.getTime(), Date.now() + 30 * DAY_MS);
}

export function PacePlannerCard() {
  const { data: paceCounts, isError } = usePace();
  const [targetMs, setTargetMs] = useState<number | null>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(PACE_TARGET_KEY);
    } catch {
      stored = null;
    }
    const parsed = stored ? Date.parse(stored) : Number.NaN;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot hydration read; the target date lives in localStorage, which SSR cannot see.
    setTargetMs(Number.isNaN(parsed) ? defaultTargetDateMs() : parsed);
  }, []);

  const stats = useMemo(
    () =>
      paceCounts
        ? computePace({
            memorized: paceCounts.memorized,
            total: paceCounts.total,
            targetDateMs: targetMs,
          })
        : null,
    [paceCounts, targetMs]
  );

  const onTargetChange = useCallback((value: string) => {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return;
    const ms = Math.max(parsed, Date.now());
    setTargetMs(ms);
    try {
      localStorage.setItem(PACE_TARGET_KEY, new Date(ms).toISOString().slice(0, 10));
    } catch {
      // Quota or privacy-mode browsers just don't persist the preference.
    }
  }, []);

  const dateValue = targetMs ? new Date(targetMs).toISOString().slice(0, 10) : "";

  function statusText(s: PaceStats) {
    if (s.remaining === 0) return "Khatam — the whole corpus is marked memorized.";
    if (s.perDay === null) return "Pick a target date to see the pace you need.";
    const week = s.perWeek ?? 0;
    return `About ${s.perDay} verse${s.perDay === 1 ? "" : "s"} per day (${week} per week) to finish by the target date.`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-4 w-4 text-amber-600" />
          Memorization Pace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isError ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">Pace data unavailable.</p>
        ) : !stats ? (
          <div className="h-14 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tabular-nums text-stone-900 dark:text-stone-100">
                {stats.memorized.toLocaleString()}
                <span className="text-sm font-medium text-stone-400">
                  {" "}
                  / {stats.total.toLocaleString()} verses marked
                </span>
              </p>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">{statusText(stats)}</p>
            </div>
            <label className="text-xs text-stone-500 dark:text-stone-400">
              Target date
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={dateValue}
                onChange={(e) => onTargetChange(e.target.value)}
                className="ml-2 rounded-md border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
                aria-label="Khatm target date"
              />
            </label>
          </div>
        )}
        <p className="text-[11px] text-stone-400">
          Every verse with a memory state counts, in any stage.{" "}
          <Link href="/quran" className="underline">
            Open the reader
          </Link>{" "}
          to memorize more.
        </p>
      </CardContent>
    </Card>
  );
}
