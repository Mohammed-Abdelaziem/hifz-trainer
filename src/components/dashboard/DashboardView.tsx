"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, Sparkles } from "lucide-react";
import { useQueue } from "@/hooks/use-srs-data";
import type { SchedulerKind } from "@/types/quran";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { GoalRing, StreakCard } from "./StatsCards";
import { TaskQueueTabs } from "./TaskQueueTabs";
import { SyncButton } from "./SyncButton";
import { WeeklyChartWrapper } from "./WeeklyChartWrapper";

function SchedulerControls({ active, retention }: { active: SchedulerKind; retention: number }) {
  const queryClient = useQueryClient();
  const [retentionDraft, setRetentionDraft] = useState(Math.round(retention * 100));
  const [lastSeenRetention, setLastSeenRetention] = useState(retention);
  const [saving, setSaving] = useState(false);

  if (lastSeenRetention !== retention) {
    setLastSeenRetention(retention);
    setRetentionDraft(Math.round(retention * 100));
  }

  async function patch(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await queryClient.invalidateQueries({ queryKey: ["queue"] });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-white p-1.5 dark:border-stone-700 dark:bg-stone-900">
      <span className="pl-1.5 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
        SRS
      </span>
      <div className="inline-flex">
        {(["sm2", "fsrs"] as SchedulerKind[]).map((s) => (
          <button
            key={s}
            onClick={() => void patch({ scheduler: s })}
            aria-selected={active === s}
            role="tab"
            className={cn(
              "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active === s
                ? "bg-stone-900 text-white dark:bg-amber-600"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            )}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>
      {active === "fsrs" && (
        <div className="flex items-center gap-2 border-l border-stone-200 pl-3 pr-1 dark:border-stone-700">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
            Retention
          </span>
          <Slider
            value={[retentionDraft]}
            min={70}
            max={98}
            step={1}
            disabled={saving}
            onValueChange={(v) => setRetentionDraft(v[0])}
            onValueCommit={(v) =>
              void patch({ requestRetention: Math.round(v[0]) / 100 })
            }
            className="w-24"
            aria-label="Desired retention"
          />
          <span className={cn("w-9 text-xs tabular-nums", saving ? "text-amber-600" : "text-stone-600 dark:text-stone-300")}>
            {retentionDraft}%
          </span>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-[148px] animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
        ))}
      </div>
      <div className="h-[200px] animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
    </div>
  );
}

export function DashboardView({ availableSurahs, isGuest }: { availableSurahs: { id: number; name_arabic: string; name_simple: string; ayah_count: number }[]; isGuest?: boolean }) {
  const { data: queue, isLoading, isError } = useQueue();
  const fullCorpus = availableSurahs.length >= 114;

  return (
    <div className="mx-auto max-w-5xl flex-1 px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Assalamu alaykum</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Your daily review queue — Sabaq (new), Sabqi (recent), Manzil (long-term).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {queue ? (
            <SchedulerControls active={queue.scheduler} retention={queue.requestRetention} />
          ) : null}
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 shadow-sm transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Memory heatmap
          </Link>
        </div>
      </header>

      {isGuest && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          You&apos;re browsing as a guest.{" "}
          <Link href="/login" className="font-medium underline">
            Sign in
          </Link>{" "}
          to save your progress across devices.
        </div>
      )}

      {isError ? (
        <Card className="border-red-200 p-6 text-sm text-red-700 dark:border-red-900 dark:text-red-300">
          Could not load your queue. Is the database reachable? Run{" "}
          <code className="rounded bg-red-50 px-1 dark:bg-red-950/40">npm run db:push</code> and
          reload.
        </Card>
      ) : isLoading || !queue ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <GoalRing streak={queue.streak} />
            <StreakCard streak={queue.streak} />
          </div>

          <div className="mb-4">
            <WeeklyChartWrapper />
          </div>

          <div className="mb-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold">Today&apos;s Plan</h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                ~{queue.estimatedMinutes} min
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{queue.sabaq.length}</p>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-500">Sabaq</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">New memorisation</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{queue.sabqi.length}</p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500">Sabqi</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Recent review</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-950/20">
                <p className="text-lg font-bold text-sky-700 dark:text-sky-400">{queue.manzil.length}</p>
                <p className="text-xs font-medium text-sky-600 dark:text-sky-500">Manzil</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Long-term rotation</p>
              </div>
            </div>
          </div>

          <TaskQueueTabs queue={queue} />
        </>
      )}

      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            {fullCorpus ? "All surahs" : "Open a surah to memorize"}
          </h2>
          <SyncButton corpusSynced={fullCorpus} />
        </div>
        {fullCorpus ? (
          <details className="rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <summary className="cursor-pointer select-none px-5 py-4 text-sm font-semibold">
              Browse all {availableSurahs.length} surahs
            </summary>
            <div className="grid max-h-[420px] grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1.5 overflow-y-auto px-4 pb-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
              {availableSurahs.map((s) => (
                <Link
                  key={s.id}
                  href={`/reader/${s.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-stone-200 hover:bg-stone-50 dark:hover:border-stone-700 dark:hover:bg-stone-800"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold tabular-nums text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                    {s.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.name_simple}</span>
                  </span>
                  <span dir="rtl" lang="ar" className="font-quran shrink-0 text-xl leading-none">
                    {s.name_arabic}
                  </span>
                </Link>
              ))}
            </div>
          </details>
        ) : (
          <div className="flex flex-wrap gap-3">
            {availableSurahs.map((s) => (
              <Link
                key={s.id}
                href={`/reader/${s.id}`}
                className="group inline-flex items-center gap-4 rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
              >
                <span dir="rtl" lang="ar" className="font-quran text-3xl leading-none">
                  {s.name_arabic}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{s.name_simple}</span>
                  <span className="text-xs text-stone-500">{s.ayah_count} verses</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
