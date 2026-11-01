"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { countEarned, type Achievement } from "@/lib/achievements";
import type { RecapData } from "@/app/api/stats/route";
import { Hourglass, Sparkles, TrendingUp } from "lucide-react";

interface StatsShape {
  xp: { level: number; intoLevel: number; toNextLevel: number; totalXp: number };
  recap: RecapData;
  achievements: Achievement[];
}

function AchievementChip({ a }: { a: Achievement }) {
  if (a.earned) {
    return (
      <div
        title={`${a.description} — unlocked`}
        className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200"
      >
        <span aria-hidden>{a.emoji}</span>
        <span>{a.title}</span>
      </div>
    );
  }
  const pct = a.progress ? Math.min(100, Math.round((a.progress.current / a.progress.target) * 100)) : 0;
  return (
    <div
      title={`${a.description} — ${a.progress?.current ?? 0}/${a.progress?.target ?? a.target}`}
      className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-400 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-500"
    >
      <span aria-hidden className="opacity-40 grayscale">
        {a.emoji}
      </span>
      <span className="truncate">{a.title}</span>
      <span className="tabular-nums">{pct}%</span>
    </div>
  );
}

export function BadgesCard() {
  const { data: stats } = useQuery<StatsShape>({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
    staleTime: 60_000,
  });
  if (!stats?.achievements?.length) return null;

  const earned = countEarned(stats.achievements);
  // Only show the closest-tier unearned badges to keep the row readable;
  // the full catalogue would bury the "next up" signals max.
  const visible = stats.achievements.filter((a) => a.earned).concat(
    stats.achievements.filter((a) => !a.earned).slice(0, 6)
  );

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-200">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Badges
          <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
            {earned}/{stats.achievements.length}
          </span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Level <strong className="text-stone-700 dark:text-stone-200">{stats.xp.level}</strong>
          <span className="mx-1">·</span>
          {stats.xp.totalXp} XP
          <span className="mx-1">·</span>
          {stats.xp.toNextLevel} XP to level {stats.xp.level + 1}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {visible.map((a) => (
          <AchievementChip key={a.id} a={a} />
        ))}
      </div>
    </Card>
  );
}

export function RecapCard() {
  const { data: stats } = useQuery<StatsShape>({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
    staleTime: 60_000,
  });
  const recap = stats?.recap;
  if (!recap || (recap.reviewsThisWeek === 0 && recap.reviewsLastWeek === 0)) return null;

  const delta = recap.reviewsThisWeek - recap.reviewsLastWeek;
  const deltaLabel =
    recap.reviewsLastWeek === 0
      ? null
      : `${delta >= 0 ? "+" : ""}${Math.round((delta / Math.max(1, recap.reviewsLastWeek)) * 100)}% vs last week`;

  return (
    <Card className="p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-200">
        <TrendingUp className="h-4 w-4 text-sky-500" />
        Weekly recap
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">This week</dt>
          <dd className="font-bold tabular-nums">{recap.reviewsThisWeek}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">Vs last week</dt>
          <dd className={`font-bold tabular-nums ${delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {deltaLabel ?? "first week"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">Days active</dt>
          <dd className="font-bold tabular-nums">{recap.activeDaysThisWeek}/7</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">XP earned</dt>
          <dd className="font-bold tabular-nums">{recap.xpThisWeek}</dd>
        </div>
      </dl>
      {(recap.topSurah || recap.bestDay) && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
          {recap.topSurah && (
            <span>
              Most reviewed: <strong>{recap.topSurah.name}</strong> ({recap.topSurah.count})
            </span>
          )}
          {recap.bestDay && recap.bestDay.count > 0 && (
            <span className="inline-flex items-center gap-1">
              <Hourglass className="h-3 w-3" />
              Best day {recap.bestDay.date.slice(5)} with {recap.bestDay.count} reviews
            </span>
          )}
        </p>
      )}
    </Card>
  );
}
