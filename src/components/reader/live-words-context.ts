"use client";

import { createContext, useContext } from "react";
import type { QuranWord } from "@/types/quran";

export interface LiveWords {
  verseKey: string;
  words: QuranWord[];
}

export const LiveWordsContext = createContext<LiveWords | null>(null);

export function useLiveWords(): LiveWords | null {
  return useContext(LiveWordsContext);
}
