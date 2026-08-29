export type MaskMode = "FULL" | "BLUR" | "FIRST_LETTER" | "REVEAL";

export type LayoutMode = "FLOW" | "MUSHAF";

export type PlaybackMode = "continuous" | "word";

export type SchedulerKind = "sm2" | "fsrs";

export type Grade = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type MemoryState = "SABAQ" | "SABQI" | "MANZIL";

export interface QuranWord {
  id: string;
  text_uthmani: string;
  translation: string;
  transliteration?: string;
  audio_url?: string;
  root?: string;
}

export interface WordTiming {
  start_ms: number;
  end_ms: number;
}

export interface Ayah {
  ayah_number: number;
  verse_key: string;
  words: QuranWord[];
  audio_url: string;
  timings: WordTiming[];
  tafsir: string;
}

export interface SurahBundle {
  id: number;
  name_arabic: string;
  name_simple: string;
  english_name: string;
  revelation_place: "makkah" | "madinah";
  ayah_count: number;
  ayahs: Ayah[];
}

export const GRADES: readonly Grade[] = ["AGAIN", "HARD", "GOOD", "EASY"] as const;
