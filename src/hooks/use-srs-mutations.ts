"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SchedulerKind } from "@/types/quran";

export interface SettingsUpdatePayload {
  scheduler?: SchedulerKind | string;
  requestRetention?: number;
  dailyTargetCount?: number;
}

export interface SettingsUpdateResponse {
  ok: true;
  scheduler: SchedulerKind;
  requestRetention: number;
  dailyTargetCount: number;
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SettingsUpdatePayload): Promise<SettingsUpdateResponse> => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to save settings");
      }
      return res.json() as Promise<SettingsUpdateResponse>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });
}
