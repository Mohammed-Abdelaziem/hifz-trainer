"use client";

import { motion } from "framer-motion";
import { Flame, Target } from "lucide-react";
import type { StreakInfo } from "@/types/srs";
import { Card } from "@/components/ui/card";

export function GoalRing({ streak }: { streak: StreakInfo }) {
  const pct = Math.min(
    100,
    Math.round((streak.todayReviewed / Math.max(1, streak.dailyTargetCount)) * 100)
  );
  const r = 52;
  const circ = 2 * Math.PI * r;

  return (
    <Card className="flex items-center gap-5 p-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-stone-200 dark:stroke-stone-700" />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            stroke="#b45309"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tabular-nums">{pct}%</span>
          <span className="text-[10px] text-stone-500">
            {streak.todayReviewed}/{streak.dailyTargetCount}
          </span>
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-200">
          <Target className="h-4 w-4 text-amber-700 dark:text-amber-400" /> Daily goal
        </div>
        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          {streak.todayReviewed >= streak.dailyTargetCount
            ? "Target reached — every review now strengthens Manzil."
            : `${streak.dailyTargetCount - streak.todayReviewed} more review${streak.dailyTargetCount - streak.todayReviewed === 1 ? "" : "s"} to close today's target.`}
        </p>
      </div>
    </Card>
  );
}

export function StreakCard({ streak }: { streak: StreakInfo }) {
  return (
    <Card className="flex items-center gap-5 p-5">
      <div className="relative flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-b from-orange-100 to-amber-50 dark:from-orange-950/40 dark:to-stone-900">
        <Flame
          className={`h-7 w-7 ${streak.current > 0 ? "text-orange-500" : "text-stone-400"}`}
          fill={streak.current > 0 ? "currentColor" : "none"}
        />
        <span className="text-2xl font-bold tabular-nums leading-none mt-1">{streak.current}</span>
        <span className="text-[10px] uppercase tracking-wide text-stone-500">day streak</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Consistency</p>
        <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          Longest streak: <strong>{streak.longest}</strong> · Reviewed today:{" "}
          <strong>{streak.todayReviewed}</strong>
        </p>
      </div>
    </Card>
  );
}
