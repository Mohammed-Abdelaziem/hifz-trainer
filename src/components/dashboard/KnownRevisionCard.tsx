"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CalendarCheck2, Check, RefreshCw } from "lucide-react";
import type { KnownRevisionSummary, QueueItem } from "@/types/srs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDueIn } from "@/lib/utils";

interface SurahRevisionGroup {
  surahId: number;
  surahName: string;
  dueCount: number;
  firstDue: QueueItem;
}

export function KnownRevisionCard({
  knownRevision,
}: {
  knownRevision?: KnownRevisionSummary;
}) {
  const queryClient = useQueryClient();
  const [busySurahId, setBusySurahId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const groups = useMemo<SurahRevisionGroup[]>(() => {
    if (!knownRevision?.dueItems.length) return [];
    const bySurah = new Map<number, SurahRevisionGroup>();
    for (const item of knownRevision.dueItems) {
      const existing = bySurah.get(item.surahId);
      if (existing) {
        existing.dueCount += 1;
      } else {
        bySurah.set(item.surahId, {
          surahId: item.surahId,
          surahName: item.surahName,
          dueCount: 1,
          firstDue: item,
        });
      }
    }
    return [...bySurah.values()];
  }, [knownRevision]);

  if (!knownRevision || knownRevision.totalKnown === 0) return null;

  const { totalKnown, dueCount, revisedRecently, nextDueAt } = knownRevision;
  const onTrack = Math.max(0, totalKnown - dueCount);
  const onTrackPct = Math.round((onTrack / Math.max(1, totalKnown)) * 100);

  async function handleMarkRevised(group: SurahRevisionGroup) {
    if (busySurahId !== null) return;
    setBusySurahId(group.surahId);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/known-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surahId: group.surahId }),
      });
      if (!res.ok) {
        setStatusMessage(`Could not record revision for ${group.surahName} — try again`);
        return;
      }
      const data = (await res.json()) as { revised: number; nextDueAt: string | null };
      setStatusMessage(
        `Revised ${data.revised} verse${data.revised === 1 ? "" : "s"} in ${group.surahName}${
          data.nextDueAt ? ` · next check-in ${formatDueIn(data.nextDueAt)}` : ""
        }`
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["queue"] }),
        queryClient.invalidateQueries({ queryKey: ["stats"] }),
        queryClient.invalidateQueries({ queryKey: ["memory-map"] }),
        queryClient.invalidateQueries({ queryKey: ["pace"] }),
      ]);
    } catch {
      setStatusMessage(`Network error — ${group.surahName} revision not saved`);
    } finally {
      setBusySurahId(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            Periodic revision for known verses
          </h2>
        </div>
        <Badge variant={dueCount > 0 ? "warning" : "success"}>
          {dueCount > 0 ? `${dueCount} due for revision` : "All caught up"}
        </Badge>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
        {dueCount > 0
          ? `Even well-memorized verses fade without periodic review. ${dueCount} known verse${dueCount === 1 ? "" : "s"} across ${groups.length} surah${groups.length === 1 ? "" : "s"} ${dueCount === 1 ? "is" : "are"} ready for a quick revision check.`
          : nextDueAt
            ? `Your ${totalKnown} known verse${totalKnown === 1 ? "" : "s"} are on track. Periodic revision is scheduled automatically — next check-in ${formatDueIn(nextDueAt)}.`
            : `Your ${totalKnown} known verse${totalKnown === 1 ? "" : "s"} are tracked for periodic revision every 14+ days.`}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Metric label="Known verses" value={totalKnown} accent="text-teal-600 dark:text-teal-400" />
        <Metric label="On track" value={`${onTrackPct}%`} accent="text-emerald-600 dark:text-emerald-400" />
        <Metric label="Revised (14d)" value={revisedRecently} accent="text-sky-600 dark:text-sky-400" />
        <Metric
          label="Due now"
          value={dueCount}
          accent={dueCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-stone-500"}
        />
      </div>

      {statusMessage && (
        <p
          role="status"
          className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800 dark:border-teal-800/60 dark:bg-teal-950/30 dark:text-teal-300"
        >
          {statusMessage}
        </p>
      )}

      {groups.length > 0 && (
        <div className="space-y-1.5 border-t border-stone-100 pt-3 dark:border-stone-800">
          {groups.map((g) => (
            <div
              key={g.surahId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200/80 bg-stone-50/60 px-3 py-2 dark:border-stone-800 dark:bg-stone-900/60"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                  {g.surahId}. {g.surahName}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {g.dueCount} known verse{g.dueCount === 1 ? "" : "s"} due · starts at{" "}
                  <span className="tabular-nums">{g.firstDue.verseKey}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleMarkRevised(g)}
                  disabled={busySurahId !== null}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1 rounded-full border border-teal-300 bg-white px-2.5 py-1 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-teal-700 dark:bg-stone-900 dark:text-teal-300 dark:hover:bg-teal-950/40"
                  )}
                >
                  {busySurahId === g.surahId ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Mark revised
                </button>
                <Link
                  href={`/reader/${g.surahId}?verse=${g.firstDue.verseKey}`}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-teal-700"
                >
                  Revise <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200/80 bg-stone-50/50 px-3 py-2 text-center dark:border-stone-800 dark:bg-stone-900/50">
      <p className={cn("text-lg font-bold tabular-nums", accent)}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-stone-400">{label}</p>
    </div>
  );
}
