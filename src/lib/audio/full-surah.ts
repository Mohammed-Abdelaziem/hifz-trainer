import { DEFAULT_RECITER, RECITERS } from "@/lib/quran/reciters";

export interface VerseTiming {
  verseKey: string;
  start_ms: number;
  end_ms: number;
}

interface RawTiming {
  ayah: number;
  start_time: number;
  end_time: number;
}

/** Falls back to the default reciter for ids the catalog doesn't carry. */
function getReciter(reciterId: number) {
  return RECITERS.find((r) => r.id === reciterId) ?? DEFAULT_RECITER;
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

export function getSurahAudioUrl(surahId: number, reciterId: number): string {
  return `${getReciter(reciterId).server}${pad3(surahId)}.mp3`;
}

function getReadId(reciterId: number): number {
  return getReciter(reciterId).readId;
}

function cacheKey(surahId: number, reciterId: number): string {
  return `verse-timing-${surahId}-${reciterId}`;
}

export async function fetchVerseTimings(
  surahId: number,
  reciterId: number,
  ayahCount: number
): Promise<VerseTiming[]> {
  const cached = getCachedTimings(surahId, reciterId);
  if (cached && cached.length === ayahCount) return cached;

  const readId = getReadId(reciterId);
  const res = await fetch(
    `https://mp3quran.net/api/v3/ayat_timing?surah=${surahId}&read=${readId}`
  );
  if (!res.ok) return [];

  const data: RawTiming[] = await res.json();
  const timings: VerseTiming[] = [];

  for (let i = 0; i < data.length; i++) {
    const raw = data[i];
    const verseNum = raw.ayah === 0 ? 1 : raw.ayah;
    timings.push({
      verseKey: `${surahId}:${verseNum}`,
      start_ms: raw.start_time,
      end_ms: raw.end_time,
    });
  }

  cacheTimings(surahId, reciterId, timings);
  return timings;
}

function getCachedTimings(surahId: number, reciterId: number): VerseTiming[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(surahId, reciterId));
    if (!raw) return null;
    return JSON.parse(raw) as VerseTiming[];
  } catch {
    return null;
  }
}

function cacheTimings(surahId: number, reciterId: number, timings: VerseTiming[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cacheKey(surahId, reciterId), JSON.stringify(timings));
  } catch {}
}
