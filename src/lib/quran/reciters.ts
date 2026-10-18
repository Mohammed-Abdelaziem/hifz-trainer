export interface ReciterOption {
  id: number;
  name: string;
  /** mp3quran.net folder for full-surah audio, trailing slash included. */
  server: string;
  /** mp3quran.net ayat_timing read id, used to fetch verse timings. */
  readId: number;
}

// Single source of truth: the per-reciter name AND audio routing (server,
// readId) used to live in two parallel tables — lib/quran/select and
// lib/audio/full-surah — whose names had begun to drift ("Sa`ud" vs "Saud").
export const RECITERS: ReciterOption[] = [
  { id: 7, name: "Mishary Alafasy", readId: 123, server: "https://server8.mp3quran.net/afs/" },
  { id: 6, name: "Mahmoud Al-Husary", readId: 118, server: "https://server13.mp3quran.net/husr/" },
  { id: 12, name: "Al-Husary (Muallim)", readId: 118, server: "https://server13.mp3quran.net/husr/" },
  { id: 2, name: "AbdulBaset (Murattal)", readId: 53, server: "https://server7.mp3quran.net/basit/" },
  { id: 1, name: "AbdulBaset (Mujawwad)", readId: 51, server: "https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/" },
  { id: 3, name: "Abdur-Rahman as-Sudais", readId: 54, server: "https://server11.mp3quran.net/sds/" },
  { id: 9, name: "Al-Minshawi (Murattal)", readId: 112, server: "https://server10.mp3quran.net/minsh/" },
  { id: 4, name: "Abu Bakr al-Shatri", readId: 4, server: "https://server11.mp3quran.net/shatri/" },
  { id: 5, name: "Hani ar-Rifai", readId: 89, server: "https://server8.mp3quran.net/hani/" },
  { id: 10, name: "Saud ash-Shuraym", readId: 31, server: "https://server7.mp3quran.net/shur/" },
];

export const DEFAULT_RECITER_ID = 7;
export const DEFAULT_RECITER = RECITERS.find((r) => r.id === DEFAULT_RECITER_ID)!;

export const VALID_RECITER_IDS = new Set(RECITERS.map((r) => r.id));
