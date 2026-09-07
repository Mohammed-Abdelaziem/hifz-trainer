"use client";

import { useQuery } from "@tanstack/react-query";
import { WeeklyChart } from "./WeeklyChart";

export function WeeklyChartWrapper() {
  const { data: stats } = useQuery<{
    perDay: { date: string; count: number }[];
  }>({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
    staleTime: 60_000,
  });

  if (!stats?.perDay?.length) return null;

  return <WeeklyChart perDay={stats.perDay} />;
}
