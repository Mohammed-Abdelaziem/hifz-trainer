"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SABAQ_BATCH_MAX } from "@/lib/constants";

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
  const valid =
    Boolean(surah) &&
    Number.isInteger(fromAyah) &&
    Number.isInteger(toAyah) &&
    fromAyah >= 1 &&
    toAyah >= fromAyah &&
    toAyah <= maxAyah &&
    count <= SABAQ_BATCH_MAX;

  async function submit() {
    if (!valid || saving) return;
    setSaving(true);
    setStatus(null);
    try {
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
          <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />
          Add to Sabaq
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

        <Button
          size="sm"
          onClick={submit}
          disabled={!valid || saving}
          title={
            valid
              ? `Add ${count} verse${count === 1 ? "" : "s"} from ${surah?.name_simple ?? ""}`
              : `Enter a range within surah ${surahId}${surah ? ` (${surah.name_simple}, ${surah.ayah_count} ayahs)` : ""} of 1–${SABAQ_BATCH_MAX} verses`
          }
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Add {valid ? count : ""}
        </Button>
      </div>

      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400" role="status">
        {noSurahs
          ? "The surah catalog is still loading."
          : status ?? `Add up to ${SABAQ_BATCH_MAX} new verses to your daily plan.`}
      </p>
    </div>
  );
}
