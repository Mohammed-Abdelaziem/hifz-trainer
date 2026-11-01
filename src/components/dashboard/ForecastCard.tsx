"use client";

import { CalendarClock } from "lucide-react";
import type { DueForecast } from "@/types/srs";

/**
 * Due-forecast card: how many verses are coming up by the next day / 3 / 7
 * / 30 days (cumulative counts past today, which the queue above already
 * owns). The bar length is relative to the widest horizon.
 */
export function ForecastCard({ forecast }: { forecast?: DueForecast }) {
  if (!forecast || forecast.dueBy30Days === 0) return null;
  const max = Math.max(forecast.dueBy30Days, 1);
  const rows = [
    { label: "by tomorrow", count: forecast.dueByDay, classes: "bg-amber-500" },
    { label: "by 3 days", count: forecast.dueBy3Days, classes: "bg-emerald-500" },
    { label: "by 7 days", count: forecast.dueBy7Days, classes: "bg-sky-500" },
    { label: "by 30 days", count: forecast.dueBy30Days, classes: "bg-stone-400" },
  ];

  return (
    <div className="mb-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-semibold">Coming up</h3>
        <span className="ml-auto text-xs text-stone-500 dark:text-stone-400">
          verses due · total {forecast.dueBy30Days}
        </span>
      </div>
      <div className="space-y-2">
        {rows.map(({ label, count, classes }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-xs text-stone-500 dark:text-stone-400">{label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className={`h-full rounded-full ${classes}`}
                style={{ width: `${Math.max((count / max) * 100, count > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-stone-700 dark:text-stone-200">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
