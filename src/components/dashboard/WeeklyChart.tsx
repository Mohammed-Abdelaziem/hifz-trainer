"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";

interface DayData {
  date: string;
  count: number;
}

export function WeeklyChart({ perDay }: { perDay: DayData[] }) {
  const last7 = useMemo(() => {
    // UTC everywhere: /api/stats keys each day by toISOString().slice(0, 10),
    // so bucket keys and "today" must both be UTC calendar days. The old loop
    // walked local dates but keyed UTC — for any UTC offset the bars lit the
    // wrong day near midnight.
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(`${todayKey}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = perDay.find((p) => p.date === key);
      days.push({
        label: d.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" }),
        count: found?.count ?? 0,
      });
    }
    return days;
  }, [perDay]);

  const maxCount = Math.max(1, ...last7.map((d) => d.count));
  const totalCount = last7.reduce((s, d) => s + d.count, 0);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">This Week</h3>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {totalCount} reviews
        </span>
      </div>
      <div className="flex items-end gap-1.5" style={{ height: 64 }}>
        {last7.map((day) => (
          <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-amber-500/80 transition-all dark:bg-amber-400/80"
              style={{
                height: `${Math.max(2, (day.count / maxCount) * 100)}%`,
                minHeight: day.count > 0 ? 4 : 2,
              }}
            />
            <span className="text-[9px] text-stone-400 dark:text-stone-500">
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
