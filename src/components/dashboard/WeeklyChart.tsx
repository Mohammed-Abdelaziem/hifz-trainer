"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";

interface DayData {
  date: string;
  count: number;
  reads?: number;
}

export function WeeklyChart({ perDay }: { perDay: DayData[] }) {
  const last7 = useMemo(() => {
    // UTC everywhere: /api/stats keys each day by toISOString().slice(0, 10),
    // so bucket keys and "today" must both be UTC calendar days. The old loop
    // walked local dates but keyed UTC — for any UTC offset the bars lit the
    // wrong day near midnight.
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const days: { date: string; label: string; count: number; reads: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(`${todayKey}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = perDay.find((p) => p.date === key);
      days.push({
        date: key,
        label: d.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" }),
        count: found?.count ?? 0,
        reads: found?.reads ?? 0,
      });
    }
    return days;
  }, [perDay]);

  const maxTotal = Math.max(1, ...last7.map((d) => d.count + d.reads));
  const totalReviews = last7.reduce((s, d) => s + d.count, 0);
  const totalReads = last7.reduce((s, d) => s + d.reads, 0);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">This Week</h3>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {totalReviews} review{totalReviews === 1 ? "" : "s"}
          {totalReads > 0 && ` · ${totalReads} read${totalReads === 1 ? "" : "s"}`}
        </span>
      </div>
      <div className="flex items-end gap-1.5" style={{ height: 64 }}>
        {last7.map((day) => {
          const total = day.count + day.reads;
          const totalPct = total === 0 ? 4 : Math.max(10, (total / maxTotal) * 100);
          const reviewPct = total > 0 ? (day.count / total) * 100 : 0;
          const readPct = total > 0 ? (day.reads / total) * 100 : 0;
          return (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} review${day.count === 1 ? "" : "s"}${
                day.reads > 0 ? `, ${day.reads} read${day.reads === 1 ? "" : "s"}` : ""
              }`}
              className="flex h-full flex-1 flex-col items-center gap-1"
            >
              <div className="flex w-full flex-1 items-end">
                <div
                  className={`flex w-full flex-col overflow-hidden rounded-t transition-all ${
                    total === 0 ? "bg-stone-200 dark:bg-stone-700" : ""
                  }`}
                  style={{
                    height: `${totalPct}%`,
                    minHeight: total > 0 ? 4 : 2,
                  }}
                >
                  {day.reads > 0 && (
                    <div
                      className="w-full bg-sky-500/80 dark:bg-sky-400/80"
                      style={{ height: `${readPct}%` }}
                    />
                  )}
                  {day.count > 0 && (
                    <div
                      className="w-full bg-amber-500/80 dark:bg-amber-400/80"
                      style={{ height: `${reviewPct}%` }}
                    />
                  )}
                </div>
              </div>
              <span className="text-[9px] text-stone-400 dark:text-stone-500">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
