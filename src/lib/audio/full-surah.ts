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

interface Mp3QuranReciter {
  readId: number;
  server: string;
  name: string;
}

const RECITER_MAP: Record<number, Mp3QuranReciter> = {
  7: { readId: 123, server: "https://server8.mp3quran.net/afs/", name: "Mishary Alafasy" },
  6: { readId: 118, server: "https://server13.mp3quran.net/husr/", name: "Mahmoud Al-Husary" },
  12: { readId: 118, server: "https://server13.mp3quran.net/husr/", name: "Al-Husary (Muallim)" },
  2: { readId: 53, server: "https://server7.mp3quran.net/basit/", name: "AbdulBaset (Murattal)" },
  1: { readId: 51, server: "https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/", name: "AbdulBaset (Mujawwad)" },
  3: { readId: 54, server: "https://server11.mp3quran.net/sds/", name: "Abdur-Rahman as-Sudais" },
  9: { readId: 112, server: "https://server10.mp3quran.net/minsh/", name: "Al-Minshawi (Murattal)" },
  4: { readId: 4, server: "https://server11.mp3quran.net/shatri/", name: "Abu Bakr al-Shatri" },
  5: { readId: 89, server: "https://server8.mp3quran.net/hani/", name: "Hani ar-Rifai" },
  10: { readId: 31, server: "https://server7.mp3quran.net/shur/", name: "Saud ash-Shuraym" },
};

const DEFAULT_RECITER = RECITER_MAP[7];

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

export function getSurahAudioUrl(surahId: number, reciterId: number): string {
  const reciter = RECITER_MAP[reciterId] ?? DEFAULT_RECITER;
  return `${reciter.server}${pad3(surahId)}.mp3`;
}

function getReadId(reciterId: number): number {
  return (RECITER_MAP[reciterId] ?? DEFAULT_RECITER).readId;
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
