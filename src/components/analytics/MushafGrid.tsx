"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MemoryCell } from "@/types/srs";
import { useMemoryMap } from "@/hooks/use-srs-data";
import { STABILITY_COLORS, stabilityColor } from "@/lib/srs/stability";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TOTAL_SURAHS = 114;
const TOTAL_PAGES = 604;

/** Color for verses/surahs the user marked as already memorized — KNOWN is
 *  excluded from the stability heat scale because it is not "growing". */
const KNOWN_COLOR = "#0d9488";

type GridMode = "pages" | "surahs";

function aggregate(cells: MemoryCell[]): {
  score: number | null;
  total: number;
  tracked: number;
  read: number;
  known: number;
} {
  const trackedCells = cells.filter((c) => c.stability !== null);
  const knownCells = trackedCells.filter((c) => c.state === "KNOWN");
  // KNOWN is fully stable by definition; averaging its 100s would drown the
  // real signal of verses still in the hifz cycle.
  const heatCells = trackedCells.filter((c) => c.state !== "KNOWN");
  const readCells = cells.filter((c) => c.readCount > 0 && c.stability === null);
  const score =
    heatCells.length > 0
      ? Math.round(
          heatCells.reduce((sum, c) => sum + (c.stability ?? 0), 0) / heatCells.length
        )
      : null;
  return {
    score,
    total: cells.length,
    tracked: trackedCells.length,
    read: readCells.length,
    known: knownCells.length,
  };
}

function Cell({
  score,
  knownFull,
  readCount,
  label,
  sublabel,
  large,
  href,
}: {
  score: number | null;
  knownFull?: boolean;
  readCount?: number;
  label: string;
  sublabel?: string;
  large?: boolean;
  href?: string;
}) {
  const isRead = (!score && score !== 0) && (readCount ?? 0) > 0;
  const bgColor = knownFull ? KNOWN_COLOR : isRead ? "#bae6fd" : stabilityColor(score);
  const body = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      title={sublabel ? `${label} — ${sublabel}` : label}
      className={cn(
        "flex cursor-default items-center justify-center rounded-[3px] transition-transform hover:scale-125 hover:z-10",
        large ? "aspect-square text-[11px] font-semibold" : "aspect-square",
        href && "cursor-pointer"
      )}
      style={{
        backgroundColor: bgColor,
        color: knownFull || (score !== null && score >= 60) ? "#fff" : undefined,
        outline: !knownFull && score !== null && score < 20 ? "2px solid #fecaca" : "none",
      }}
    >
      {large ? label : ""}
    </motion.div>
  );
  return href ? (
    <Link href={href} aria-label={label} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export function MushafGrid() {
  const [mode, setMode] = useState<GridMode>("surahs");
  const { data, isLoading, isError } = useMemoryMap();

  const bySurah = useMemo(() => {
    const map = new Map<number, MemoryCell[]>();
    for (const cell of data?.verses ?? []) {
      const list = map.get(cell.surahId) ?? [];
      list.push(cell);
      map.set(cell.surahId, list);
    }
    return map;
  }, [data]);

  const byPage = useMemo(() => {
    const map = new Map<number, MemoryCell[]>();
    for (const cell of data?.verses ?? []) {
      const list = map.get(cell.pageNumber) ?? [];
      list.push(cell);
      map.set(cell.pageNumber, list);
    }
    return map;
  }, [data]);

  const stats = useMemo(() => {
    const verses = data?.verses ?? [];
    const counts = { SABAQ: 0, SABQI: 0, MANZIL: 0, KNOWN: 0 };
    let tracked = 0;
    let readOnly = 0;
    let sum = 0;
    for (const v of verses) {
      if (v.state && v.stability !== null) {
        counts[v.state] += 1;
        tracked += 1;
        // KNOWN is deliberately out of the average: a fixed 100 would mask
        // the actual decay signal of verses still being memorized.
        if (v.state !== "KNOWN") sum += v.stability;
      } else if (v.readCount > 0) {
        readOnly += 1;
      }
    }
    return {
      ...counts,
      readOnly,
      untracked: verses.length - tracked - readOnly,
      avgStability:
        tracked > counts.KNOWN ? Math.round(sum / (tracked - counts.KNOWN)) : null,
    };
  }, [data]);

  if (isError) {
    return (
      <Card className="border-red-200 p-6 text-sm text-red-700 dark:border-red-900 dark:text-red-300">
        Failed to load the memory map.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 dark:border-stone-700 dark:bg-stone-800">
          {(["surahs", "pages"] as GridMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-selected={mode === m}
              role="tab"
              className={cn(
                "cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors",
                mode === m
                  ? "bg-white text-stone-900 shadow-sm dark:bg-stone-950 dark:text-amber-400"
                  : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              )}
            >
              {m === "surahs" ? "114 Surahs" : "604 Pages"}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
          {STABILITY_COLORS.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: t.color }} />
              {t.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-500">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: KNOWN_COLOR }} /> Already known
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-500">
            <span className="h-3 w-3 rounded-sm bg-sky-200" /> Read only
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-500">
            <span className="h-3 w-3 rounded-sm bg-stone-300" /> Not started
          </span>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        {isLoading ? (
          <div className="grid h-64 place-items-center text-sm text-stone-400">Loading map…</div>
        ) : mode === "surahs" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(34px,1fr))] gap-1.5">
            {Array.from({ length: TOTAL_SURAHS }, (_, i) => i + 1).map((n) => {
              const cells = bySurah.get(n) ?? [];
              const agg = aggregate(cells);
              const name = cells[0]?.surahName ?? `Surah ${n}`;
              const readCount = cells.reduce((sum, c) => sum + c.readCount, 0);
              const fullyKnown = agg.total > 0 && agg.known === agg.total;
              // Surahs mixing known and in-process verses need both numbers;
              // stability only describes the in-process remainder.
              const sublabel = fullyKnown
                ? `${name} · ${agg.known}/${agg.total} verses · fully known`
                : `${name}${
                    agg.known > 0 ? ` · ${agg.known}/${agg.total} already known` : ""
                  }${
                    agg.tracked - agg.known > 0
                      ? ` · ${agg.tracked - agg.known}/${agg.total} in hifz · stability ${agg.score}`
                      : agg.known === 0
                        ? agg.read > 0
                          ? ` · ${agg.read} read`
                          : " · not started"
                        : ""
                  }`;
              return (
                <Cell
                  key={n}
                  large
                  score={agg.score}
                  knownFull={fullyKnown}
                  readCount={readCount}
                  label={String(n)}
                  href={agg.tracked > 0 || agg.read > 0 ? `/reader/${n}` : undefined}
                  sublabel={sublabel}
                />
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(18px,1fr))] gap-1">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((n) => {
              const cells = byPage.get(n) ?? [];
              const agg = aggregate(cells);
              return (
                <Cell
                  key={n}
                  score={agg.score}
                  readCount={cells.reduce((sum, c) => sum + c.readCount, 0)}
                  label={`Page ${n}`}
                  href={
                    agg.tracked > 0 || agg.read > 0 && cells[0]
                      ? `/reader/${cells[0].surahId}?verse=${cells[0].verseKey}`
                      : undefined
                  }
                  sublabel={agg.tracked ? `${agg.tracked}/${agg.total} verses · stability ${agg.score}` : agg.read > 0 ? `${agg.read} read` : "not started"}
                />
              );
            })}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-center sm:grid-cols-6 dark:border-stone-800">
          <Stat value={stats.KNOWN} label="Known" accentClass="text-teal-600" />
          <Stat value={stats.SABAQ} label="Sabaq" accentClass="text-amber-600" />
          <Stat value={stats.SABQI} label="Sabqi" accentClass="text-emerald-600" />
          <Stat value={stats.MANZIL} label="Manzil" accentClass="text-sky-600" />
          <Stat value={stats.readOnly} label="Read only" accentClass="text-sky-500" />
          <Stat
            value={stats.avgStability !== null ? `${stats.avgStability}%` : "—"}
            label="Avg stability"
            accentClass="text-stone-700 dark:text-stone-200"
          />
        </div>
      </Card>
    </div>
  );
}

function Stat({ value, label, accentClass }: { value: number | string; label: string; accentClass: string }) {
  return (
    <div>
      <p className={cn("text-xl font-bold tabular-nums", accentClass)}>{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-stone-400">{label}</p>
    </div>
  );
}
