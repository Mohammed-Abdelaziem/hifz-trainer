"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReviewStats } from "@/hooks/use-srs-data";
import { Card } from "@/components/ui/card";

const GRADE_META = [
  { key: "AGAIN", label: "Again", color: "bg-red-500" },
  { key: "HARD", label: "Hard", color: "bg-amber-500" },
  { key: "GOOD", label: "Good", color: "bg-emerald-500" },
  { key: "EASY", label: "Easy", color: "bg-sky-500" },
];

function ChartSkeleton() {
  return <div className="h-40 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />;
}

export function ReviewActivity() {
  const { data, isLoading } = useReviewStats();

  const maxPerDay = useMemo(
    () => Math.max(1, ...(data?.perDay ?? []).map((d) => d.count)),
    [data]
  );

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
          Review activity — last 30 days
        </h2>
        {data && (
          <p className="text-xs text-stone-500">
            {data.totalReviews} reviews · {data.activeDays} active days
            {data.avgDurationMs > 0 && ` · ~${Math.round(data.avgDurationMs / 1000)}s per review`}
          </p>
        )}
      </div>

      {isLoading || !data ? (
        <ChartSkeleton />
      ) : (
        <>
          <div className="flex h-36 items-end gap-[3px]">
            {data.perDay.map((d, i) => {
              const h = d.count === 0 ? 3 : Math.max(6, (d.count / maxPerDay) * 100);
              return (
                <motion.div
                  key={d.date}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.012, duration: 0.35, ease: "easeOut" }}
                  title={`${d.date}: ${d.count} review${d.count === 1 ? "" : "s"}`}
                  className={`flex-1 rounded-t-sm ${
                    d.count > 0
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-stone-200 dark:bg-stone-700"
                  }`}
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-stone-400">
            <span>{data.perDay[0]?.date.slice(5)}</span>
            <span>{data.perDay[data.perDay.length - 1]?.date.slice(5)}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-stone-100 pt-3 dark:border-stone-800">
            {GRADE_META.map((g) => (
              <span key={g.key} className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                <span className={`h-2.5 w-2.5 rounded-full ${g.color}`} />
                {g.label}
                <strong className="tabular-nums">{data.grades[g.key] ?? 0}</strong>
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
