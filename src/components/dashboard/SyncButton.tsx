"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CloudDownload,
  DatabaseZap,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CorpusState = "idle" | "syncing" | "done" | "error";

export function SyncButton({ corpusSynced }: { corpusSynced: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<CorpusState>(corpusSynced ? "done" : "idle");
  const [message, setMessage] = useState<string | null>(null);

  const [warmState, setWarmState] = useState<"idle" | "running">("idle");
  const [warmMessage, setWarmMessage] = useState<string | null>(null);

  async function runSync() {
    setState("syncing");
    setMessage("Fetching 6,236 verses across 604 mushaf pages…");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = (await res.json()) as {
        ok?: boolean;
        verses?: number;
        failedPages?: number[];
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setState("error");
        setMessage(data.error ?? "Sync failed");
        return;
      }
      setState("done");
      setMessage(
        `Synced ${data.verses} verses${data.failedPages && data.failedPages.length > 0 ? ` (${data.failedPages.length} pages failed)` : ""}`
      );
      router.refresh();
    } catch {
      setState("error");
      setMessage("Network error during sync");
    }
  }

  async function runWarm() {
    setWarmState("running");
    try {
      const res = await fetch("/api/sync?scope=words&limit=500", { method: "POST" });
      const data = (await res.json()) as { enriched?: number; remaining?: number };
      if (res.ok) {
        setWarmMessage(`+${data.enriched ?? 0} · ${data.remaining ?? "?"} left`);
        router.refresh();
      } else {
        setWarmMessage("failed");
      }
    } catch {
      setWarmMessage("network error");
    } finally {
      setWarmState("idle");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!corpusSynced && (
        <button
          onClick={runSync}
          disabled={state === "syncing"}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors disabled:cursor-wait",
            state === "done"
              ? "bg-emerald-600 text-white"
              : state === "error"
                ? "bg-red-600 text-white"
                : "bg-stone-900 text-white hover:bg-stone-700 dark:bg-amber-600 dark:hover:bg-amber-500"
          )}
        >
          {state === "syncing" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : state === "done" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : state === "error" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CloudDownload className="h-4 w-4" />
          )}
          {state === "syncing"
            ? "Syncing…"
            : state === "done"
              ? "Full corpus synced"
              : state === "error"
                ? "Retry sync"
                : "Sync full Quran"}
        </button>
      )}

      <button
        onClick={runWarm}
        disabled={warmState === "running"}
        title="Pre-fetch canonical words, translations and tafsir for 500 verses"
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-600 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-wait dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        {warmState === "running" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
        ) : (
          <DatabaseZap className="h-3.5 w-3.5 text-amber-600" />
        )}
        Warm word data
        {warmMessage && <span className="tabular-nums text-stone-400">{warmMessage}</span>}
      </button>

      {message && !corpusSynced && (
        <span className="text-xs text-stone-500">{message}</span>
      )}
    </div>
  );
}
