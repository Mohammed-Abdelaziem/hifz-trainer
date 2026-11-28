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
  const { data, isLoading, isError } = useReviewStats();

  const maxPerDay = useMemo(
    () => Math.max(1, ...(data?.perDay ?? []).map((d) => d.count + d.reads)),
    [data]
  );

  const activeDays = useMemo(
    () => (data?.perDay ?? []).filter((d) => d.count > 0 || d.reads > 0).length,
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
            {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
            {data.totalReads > 0 && ` · ${data.totalReads} read${data.totalReads === 1 ? "" : "s"}`}
            {` · ${activeDays} active day${activeDays === 1 ? "" : "s"}`}
            {data.avgDurationMs > 0 && ` · ~${Math.round(data.avgDurationMs / 1000)}s per review`}
          </p>
        )}
      </div>

      {isError ? (
        <p className="py-8 text-center text-sm text-red-600 dark:text-red-400">
          Failed to load review activity.
        </p>
      ) : isLoading || !data ? (
        <ChartSkeleton />
      ) : (
        <>
          <div className="flex h-36 items-end gap-[3px]">
            {data.perDay.map((d, i) => {
              const total = d.count + d.reads;
              const totalH = total === 0 ? 3 : Math.max(8, (total / maxPerDay) * 100);
              const reviewPct = total > 0 ? (d.count / total) * 100 : 0;
              const readPct = total > 0 ? (d.reads / total) * 100 : 0;
              const parts: string[] = [];
              if (d.count > 0 || d.reads === 0) {
                parts.push(`${d.count} review${d.count === 1 ? "" : "s"}`);
              }
              if (d.reads > 0) {
                parts.push(`${d.reads} read${d.reads === 1 ? "" : "s"}`);
              }
              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${parts.join(", ")}`}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <motion.div
                    initial={{ height: "0%" }}
                    animate={{ height: `${totalH}%` }}
                    transition={{ delay: i * 0.012, duration: 0.35, ease: "easeOut" }}
                    className={`flex w-full flex-col overflow-hidden rounded-t-sm ${
                      total === 0 ? "bg-stone-200 dark:bg-stone-700" : ""
                    }`}
                  >
                    {d.reads > 0 && (
                      <div
                        style={{ height: `${readPct}%` }}
                        className="w-full bg-sky-500/85 hover:bg-sky-400"
                      />
                    )}
                    {d.count > 0 && (
                      <div
                        style={{ height: `${reviewPct}%` }}
                        className="w-full bg-amber-600 hover:bg-amber-500"
                      />
                    )}
                  </motion.div>
                </div>
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
            <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Reads
              <strong className="tabular-nums">{data.totalReads}</strong>
            </span>
          </div>

          {data.totalReviews === 0 && data.totalReads === 0 && (
            <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
              Grade verses (Again / Hard / Good / Easy) or read in the reader to log activity here.
              Marking verses as Already Known skips SRS reviews.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
