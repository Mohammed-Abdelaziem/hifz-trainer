"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { KNOWN_RANGE_MAX, SABAQ_BATCH_MAX } from "@/lib/constants";

export interface IntakeSurah {
  id: number;
  name_simple: string;
  ayah_count: number;
}

export function SabaqIntake({ availableSurahs }: { availableSurahs: IntakeSurah[] }) {
  const queryClient = useQueryClient();
  const [surahId, setSurahId] = useState(availableSurahs[0]?.id ?? 1);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(5);
  // "I already know this" bypasses the Sabaq plan entirely: the range is
  // labeled KNOWN (bulk import of memorized passages) instead of scheduled.
  const [knownMode, setKnownMode] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Names and ayah counts come from the catalog the page already fetched,
  // instead of a second, drift-prone 114-entry table (which had a Cyrillic
  // "а" smuggled into "Sabа" and a hardcoded max of 286 for every surah).
  const surah = availableSurahs.find((s) => s.id === surahId);
  const maxAyah = surah?.ayah_count ?? 0;
  const count = Number.isInteger(fromAyah) && Number.isInteger(toAyah)
    ? Math.max(0, toAyah - fromAyah + 1)
    : 0;
  // Sabaq intake is a daily learning slice (capped low); marking known is a
  // bulk import (whole surahs are common), so it gets a much higher cap.
  const cap = knownMode ? KNOWN_RANGE_MAX : SABAQ_BATCH_MAX;
  const valid =
    Boolean(surah) &&
    Number.isInteger(fromAyah) &&
    Number.isInteger(toAyah) &&
    fromAyah >= 1 &&
    toAyah >= fromAyah &&
    toAyah <= maxAyah &&
    count <= cap;

  // The why, not just the yes/no — the old tooltip-only validation left
  // mobile users with a dead button and no explanation.
  function invalidReason(): string | null {
    if (!surah) return null;
    if (!Number.isInteger(fromAyah) || fromAyah < 1) {
      return '"From" must be a whole verse number of 1 or more.';
    }
    if (!Number.isInteger(toAyah)) return '"To" must be a whole verse number.';
    if (toAyah < fromAyah) return '"To" must not be before "From".';
    if (toAyah > maxAyah) {
      return `Surah ${surah.name_simple} has ${maxAyah} ayah${maxAyah === 1 ? "" : "s"} — "To" is above that.`;
    }
    if (count > cap) {
      return knownMode
        ? `Mark at most ${KNOWN_RANGE_MAX} verses at a time — split very long spans.`
        : `Up to ${SABAQ_BATCH_MAX} verses per request — split the range and add in parts.`;
    }
    return null;
  }
  const hint = valid ? null : invalidReason();

  async function submit() {
    if (!valid || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      if (knownMode) {
        const res = await fetch("/api/memory-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ surahId, fromAyah, toAyah, known: true }),
        });
        if (res.status === 401) {
          setStatus("Sign in to mark verses as known");
          return;
        }
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          changed?: number;
          created?: number;
          alreadyKnown?: number;
          invalid?: number;
        };
        if (!res.ok) {
          setStatus(data.error ?? "Could not mark those verses");
          return;
        }
        const changed = data.changed ?? 0;
        const created = data.created ?? 0;
        const alreadyKnown = data.alreadyKnown ?? 0;
        const invalid = data.invalid ?? 0;
        const parts: string[] = [];
        if (created > 0) parts.push(`${created} labeled known`);
        if (changed > 0) parts.push(`${changed} moved from the hifz cycle`);
        if (alreadyKnown > 0) parts.push(`${alreadyKnown} already known`);
        if (invalid > 0) parts.push(`${invalid} not in the Quran`);
        setStatus(parts.length === 0 ? "Nothing changed" : `Known ✓ ${parts.join(" — ")}`);
        await queryClient.invalidateQueries({ queryKey: ["queue"] });
        await queryClient.invalidateQueries({ queryKey: ["memory-map"] });
        return;
      }

      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surahId, fromAyah, toAyah }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        added?: number;
        invalid?: number;
        duplicate?: number;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Could not add those verses");
        return;
      }
      // Partly-real ranges are possible (e.g. "2:280–287" picks up two
      // nonexistent ayah numbers), so report each cause on its own.
      const added = data.added ?? 0;
      const invalid = data.invalid ?? 0;
      const duplicate = data.duplicate ?? 0;
      const parts: string[] = [];
      if (added > 0) parts.push(`Added ${added} verse${added === 1 ? "" : "s"} to Sabaq`);
      if (duplicate > 0) parts.push(`${duplicate} already tracked`);
      if (invalid > 0) parts.push(`${invalid} not in the Quran`);
      setStatus(parts.length === 0 ? "Nothing was added" : parts.join(" — "));
      await queryClient.invalidateQueries({ queryKey: ["queue"] });
      await queryClient.invalidateQueries({ queryKey: ["memory-map"] });
    } catch {
      setStatus("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  const noSurahs = availableSurahs.length === 0;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
          {knownMode ? (
            <Star className="h-4 w-4 text-teal-600" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />
          )}
          {knownMode ? "Already know it" : "Add to Sabaq"}
        </span>

        <Select
          value={String(surahId)}
          onChange={(e) => {
            setSurahId(Number(e.target.value));
            setFromAyah(1);
            setToAyah(Math.min(5, availableSurahs.find((s) => s.id === Number(e.target.value))?.ayah_count ?? 5));
          }}
          options={availableSurahs.map((s) => ({ value: String(s.id), label: `${s.id}. ${s.name_simple}` }))}
          aria-label="Surah"
          className="min-w-[180px] text-sm"
        />

        <label className="sr-only" htmlFor="intake-from">
          From ayah
        </label>
        <input
          id="intake-from"
          type="number"
          min={1}
          max={maxAyah || undefined}
          value={fromAyah}
          onChange={(e) => setFromAyah(Number(e.target.value))}
          className="w-20 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800"
          aria-label="From ayah"
        />

        <span aria-hidden="true" className="text-stone-400">
          to
        </span>

        <label className="sr-only" htmlFor="intake-to">
          To ayah
        </label>
        <input
          id="intake-to"
          type="number"
          min={1}
          max={maxAyah || undefined}
          value={toAyah}
          onChange={(e) => setToAyah(Number(e.target.value))}
          className="w-20 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800"
          aria-label="To ayah"
        />

        <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-teal-700 dark:text-teal-300">
          <input
            type="checkbox"
            checked={knownMode}
            onChange={(e) => setKnownMode(e.target.checked)}
            aria-label="I already know this — skip the hifz process"
            className="h-4 w-4 cursor-pointer accent-teal-600"
          />
          I already know it
        </label>

        <Button
          size="sm"
          onClick={submit}
          disabled={!valid || saving}
          title={
            valid
              ? knownMode
                ? `Mark ${count} verse${count === 1 ? "" : "s"} from ${surah?.name_simple ?? ""} as already memorized`
                : `Add ${count} verse${count === 1 ? "" : "s"} from ${surah?.name_simple ?? ""}`
              : (hint ?? "")
          }
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {knownMode ? "Mark known" : "Add"} {valid ? count : ""}
        </Button>
      </div>

      {/* Inline validation beats the old tooltip-only button: the reason is
          visible on mobile and announced to screen readers. */}
      <p
        className="mt-2 text-xs"
        role={hint ? "alert" : "status"}
        aria-live="polite"
      >
        {noSurahs ? (
          <span className="text-stone-500 dark:text-stone-400">
            The surah catalog is still loading.
          </span>
        ) : hint ? (
          <span className="font-medium text-amber-700 dark:text-amber-400">{hint}</span>
        ) : (
          <span className="text-stone-500 dark:text-stone-400">
            {status ??
              (knownMode
                ? `Marks verses as already memorized (up to ${KNOWN_RANGE_MAX} at a time) — they skip the Sabaq → Sabqi → Manzil process.`
                : `Add up to ${SABAQ_BATCH_MAX} new verses to your daily plan.`)}
          </span>
        )}
      </p>
      {status && hint ? (
        <p className="text-xs text-stone-500 dark:text-stone-400" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
