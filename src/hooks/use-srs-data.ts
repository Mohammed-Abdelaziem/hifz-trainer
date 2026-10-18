"use client";

import { useQuery } from "@tanstack/react-query";
import type { DailyQueue, MemoryMapPayload } from "@/types/srs";
import type { ReviewStats } from "@/app/api/stats/route";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function useQueue(isGuest = false) {
  return useQuery({
    queryKey: ["queue"],
    queryFn: () => fetchJson<DailyQueue>("/api/queue"),
    // Guests have no queue — the API just 401s for them — so polling it every
    // minute only generated a permanent error chat and useless traffic. The
    // initial fetch still runs so the dashboard can show its guest explainer.
    refetchInterval: isGuest ? false : 60_000,
  });
}

export function useMemoryMap() {
  return useQuery({
    queryKey: ["memory-map"],
    queryFn: () => fetchJson<MemoryMapPayload>("/api/memory-map"),
    staleTime: 30_000,
  });
}

export function useReviewStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => fetchJson<ReviewStats>("/api/stats"),
    staleTime: 30_000,
  });
}
