"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SABAQ_BATCH_MAX } from "@/lib/constants";

/** The 114 surah names, used to label the intake control. */
const SURAHS: { id: number; name: string }[] = [
  { id: 1, name: "Al-Fatiha" }, { id: 2, name: "Al-Baqarah" }, { id: 3, name: "Ali 'Imran" },
  { id: 4, name: "An-Nisa" }, { id: 5, name: "Al-Ma'idah" }, { id: 6, name: "Al-An'am" },
  { id: 7, name: "Al-A'raf" }, { id: 8, name: "Al-Anfal" }, { id: 9, name: "At-Tawbah" },
  { id: 10, name: "Yunus" }, { id: 11, name: "Hud" }, { id: 12, name: "Yusuf" },
  { id: 13, name: "Ar-Ra'd" }, { id: 14, name: "Ibrahim" }, { id: 15, name: "Al-Hijr" },
  { id: 16, name: "An-Nahl" }, { id: 17, name: "Al-Isra" }, { id: 18, name: "Al-Kahf" },
  { id: 19, name: "Maryam" }, { id: 20, name: "Taha" }, { id: 21, name: "Al-Anbiya" },
  { id: 22, name: "Al-Hajj" }, { id: 23, name: "Al-Mu'minun" }, { id: 24, name: "An-Nur" },
  { id: 25, name: "Al-Furqan" }, { id: 26, name: "Ash-Shu'ara" }, { id: 27, name: "An-Naml" },
  { id: 28, name: "Al-Qasas" }, { id: 29, name: "Al-Ankabut" }, { id: 30, name: "Ar-Rum" },
  { id: 31, name: "Luqman" }, { id: 32, name: "As-Sajdah" }, { id: 33, name: "Al-Ahzab" },
  { id: 34, name: "Sabа" }, { id: 35, name: "Fatir" }, { id: 36, name: "Ya-Sin" },
  { id: 37, name: "As-Saffat" }, { id: 38, name: "Sad" }, { id: 39, name: "Az-Zumar" },
  { id: 40, name: "Ghafir" }, { id: 41, name: "Fussilat" }, { id: 42, name: "Ash-Shura" },
  { id: 43, name: "Az-Zukhruf" }, { id: 44, name: "Ad-Dukhan" }, { id: 45, name: "Al-Jathiyah" },
  { id: 46, name: "Al-Ahqaf" }, { id: 47, name: "Muhammad" }, { id: 48, name: "Al-Fath" },
  { id: 49, name: "Al-Hujurat" }, { id: 50, name: "Qaf" }, { id: 51, name: "Adh-Dhariyat" },
  { id: 52, name: "At-Tur" }, { id: 53, name: "An-Najm" }, { id: 54, name: "Al-Qamar" },
  { id: 55, name: "Ar-Rahman" }, { id: 56, name: "Al-Waqi'ah" }, { id: 57, name: "Al-Hadid" },
  { id: 58, name: "Al-Mujadila" }, { id: 59, name: "Al-Hashr" }, { id: 60, name: "Al-Mumtahanah" },
  { id: 61, name: "As-Saff" }, { id: 62, name: "Al-Jumu'ah" }, { id: 63, name: "Al-Munafiqun" },
  { id: 64, name: "At-Taghabun" }, { id: 65, name: "At-Talaq" }, { id: 66, name: "At-Tahrim" },
  { id: 67, name: "Al-Mulk" }, { id: 68, name: "Al-Qalam" }, { id: 69, name: "Al-Haqqah" },
  { id: 70, name: "Al-Ma'arij" }, { id: 71, name: "Nuh" }, { id: 72, name: "Al-Jinn" },
  { id: 73, name: "Al-Muzzammil" }, { id: 74, name: "Al-Muddaththir" }, { id: 75, name: "Al-Qiyamah" },
  { id: 76, name: "Al-Insan" }, { id: 77, name: "Al-Mursalat" }, { id: 78, name: "An-Naba" },
  { id: 79, name: "An-Nazi'at" }, { id: 80, name: "Abasa" }, { id: 81, name: "At-Takwir" },
  { id: 82, name: "Al-Infitar" }, { id: 83, name: "Al-Mutaffifin" }, { id: 84, name: "Al-Inshiqaq" },
  { id: 85, name: "Al-Buruj" }, { id: 86, name: "At-Tariq" }, { id: 87, name: "Al-A'la" },
  { id: 88, name: "Al-Ghashiyah" }, { id: 89, name: "Al-Fajr" }, { id: 90, name: "Al-Balad" },
  { id: 91, name: "Ash-Shams" }, { id: 92, name: "Al-Layl" }, { id: 93, name: "Ad-Duha" },
  { id: 94, name: "Ash-Sharh" }, { id: 95, name: "At-Tin" }, { id: 96, name: "Al-Alaq" },
  { id: 97, name: "Al-Qadr" }, { id: 98, name: "Al-Bayyinah" }, { id: 99, name: "Az-Zalzalah" },
  { id: 100, name: "Al-Adiyat" }, { id: 101, name: "Al-Qari'ah" }, { id: 102, name: "At-Takathur" },
  { id: 103, name: "Al-Asr" }, { id: 104, name: "Al-Humazah" }, { id: 105, name: "Al-Fil" },
  { id: 106, name: "Quraysh" }, { id: 107, name: "Al-Ma'un" }, { id: 108, name: "Al-Kawthar" },
  { id: 109, name: "Al-Kafirun" }, { id: 110, name: "An-Nasr" }, { id: 111, name: "Al-Masad" },
  { id: 112, name: "Al-Ikhlas" }, { id: 113, name: "Al-Falaq" }, { id: 114, name: "An-Nas" },
];

/** Largest ayah count, used to bound the range input. */
const MAX_AYAH = 286;

export function SabaqIntake() {
  const queryClient = useQueryClient();
  const [surahId, setSurahId] = useState(1);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(5);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const surah = SURAHS.find((s) => s.id === surahId);
  const count = Math.max(0, toAyah - fromAyah + 1);
  const valid =
    Number.isInteger(surahId) &&
    surahId >= 1 &&
    surahId <= 114 &&
    Number.isInteger(fromAyah) &&
    Number.isInteger(toAyah) &&
    fromAyah >= 1 &&
    toAyah >= fromAyah &&
    toAyah <= MAX_AYAH &&
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
        skipped?: number;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Could not add those verses");
        return;
      }
      const added = data.added ?? 0;
      const skipped = data.skipped ?? 0;
      setStatus(
        added === 0
          ? skipped > 0
            ? "Those verses are already in your plan"
            : "No verses were added"
          : `Added ${added} verse${added === 1 ? "" : "s"} to Sabaq${
              skipped > 0 ? ` (${skipped} already tracked)` : ""
            }`
      );
      await queryClient.invalidateQueries({ queryKey: ["queue"] });
      await queryClient.invalidateQueries({ queryKey: ["memory-map"] });
    } catch {
      setStatus("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />
          Add to Sabaq
        </span>

        <Select
          value={String(surahId)}
          onChange={(e) => setSurahId(Number(e.target.value))}
          options={SURAHS.map((s) => ({ value: String(s.id), label: `${s.id}. ${s.name}` }))}
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
          max={MAX_AYAH}
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
          max={MAX_AYAH}
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
              ? `Add ${count} verse${count === 1 ? "" : "s"} from ${surah?.name ?? ""}`
              : `Enter a range of 1–${SABAQ_BATCH_MAX} verses`
          }
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Add {valid ? count : ""}
        </Button>
      </div>

      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400" role="status">
        {status ?? `Add up to ${SABAQ_BATCH_MAX} new verses to your daily plan.`}
      </p>
    </div>
  );
}
