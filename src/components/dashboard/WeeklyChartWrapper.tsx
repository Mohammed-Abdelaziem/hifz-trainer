"use client";

import { useReviewStats } from "@/hooks/use-srs-data";
import { WeeklyChart } from "./WeeklyChart";

export function WeeklyChartWrapper() {
  const { data: stats } = useReviewStats();

  if (!stats?.perDay?.length) return null;

  return <WeeklyChart perDay={stats.perDay} />;
}
