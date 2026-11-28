"use client";

import { useEffect, useRef, useState } from "react";
import { SYNC_STATUS_RESET_MS } from "@/lib/constants";

export type SwSyncStatus = "idle" | "syncing" | "completed" | "failed";

/**
 * Listens for Service Worker background-sync progress messages
 * (`SYNC_STARTED`, `SYNC_COMPLETED`, `SYNC_FAILED`) and resets the indicator
 * cleanly on unmount.
 */
export function useSwSyncStatus(): SwSyncStatus {
  const [syncStatus, setSyncStatus] = useState<SwSyncStatus>("idle");
  const swTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const handleSWMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "SYNC_STARTED") {
        setSyncStatus("syncing");
      } else if (data?.type === "SYNC_COMPLETED") {
        setSyncStatus("completed");
        const t = setTimeout(() => setSyncStatus("idle"), SYNC_STATUS_RESET_MS);
        swTimeoutsRef.current.push(t);
      } else if (data?.type === "SYNC_FAILED") {
        setSyncStatus("failed");
        const t = setTimeout(() => setSyncStatus("idle"), SYNC_STATUS_RESET_MS);
        swTimeoutsRef.current.push(t);
      }
    };
    navigator.serviceWorker.addEventListener("message", handleSWMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      swTimeoutsRef.current.forEach(clearTimeout);
      swTimeoutsRef.current = [];
    };
  }, []);

  return syncStatus;
}
