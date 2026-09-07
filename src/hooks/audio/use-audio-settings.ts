"use client";

import { useEffect } from "react";
import type { AudioEngine } from "@/lib/audio/engine";
import { useReaderStore } from "@/stores/reader-store";

export function useAudioSettings(engine: AudioEngine) {
  const speed = useReaderStore((s) => s.speed);
  const volume = useReaderStore((s) => s.volume);

  useEffect(() => {
    engine.setRate(speed);
  }, [engine, speed]);

  useEffect(() => {
    engine.setVolume(volume);
  }, [engine, volume]);
}
