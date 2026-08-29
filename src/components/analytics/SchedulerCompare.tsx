"use client";

import { useReviewStats } from "@/hooks/use-srs-data";
import { Card } from "@/components/ui/card";

const SERIES = [
  { key: "sm2" as const, label: "SM-2", color: "#525252" },
  { key: "fsrs" as const, label: "FSRS", color: "#b45309" },
];

export function SchedulerCompare() {
  const { data, isLoading } = useReviewStats();

  const compare = data?.schedulerCompare;
  const hasData =
    compare && (compare.totals.sm2 > 0 || compare.totals.fsrs > 0);

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
          Interval distribution by scheduler
        </h2>
        <div className="flex items-center gap-3">
          {SERIES.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.label}
              {compare ? ` (${compare.totals[s.key]})` : ""}
            </span>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
      ) : !hasData ? (
        <p className="py-8 text-center text-sm text-stone-400">
          Review verses with both schedulers to compare how they space your workload.
        </p>
      ) : (
        <div className="space-y-3">
          {compare!.buckets.map((bucket, i) => {
            const rowMax = Math.max(compare!.sm2[i], compare!.fsrs[i], 1);
            return (
              <div key={bucket} className="grid grid-cols-[52px_1fr_64px] items-center gap-3">
                <span className="text-xs tabular-nums text-stone-500">{bucket}</span>
                <div className="space-y-1">
                  {SERIES.map((s) => {
                    const count = compare![s.key][i];
                    return (
                      <div
                        key={s.key}
                        className="h-3 rounded-r-sm transition-all"
                        style={{
                          width: `${count === 0 ? 0 : Math.max(4, (count / rowMax) * 100)}%`,
                          backgroundColor: s.color,
                          opacity: count === 0 ? 0.15 : 1,
                        }}
                        title={`${s.label}: ${count} verse${count === 1 ? "" : "s"}`}
                      />
                    );
                  })}
                </div>
                <span className="text-right text-xs tabular-nums text-stone-500">
                  {compare!.sm2[i]} / {compare!.fsrs[i]}
                </span>
              </div>
            );
          })}
          <p className="border-t border-stone-100 pt-3 text-[11px] text-stone-400 dark:border-stone-800">
            Count of reviews whose scheduled interval landed in each bucket (all-time, per
            scheduler).
          </p>
        </div>
      )}
    </Card>
  );
}
