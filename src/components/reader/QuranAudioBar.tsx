"use client";

import { useEffect } from "react";
import { Pause, Play, Square, Volume2, VolumeX } from "lucide-react";
import { useAudioSyncContext, usePlayback } from "@/hooks/use-audio-sync";
import { useReaderStore } from "@/stores/reader-store";
import { RECITERS } from "@/lib/quran/reciters";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatMs } from "@/lib/utils";
import { PROGRESS_BAR_MIN_MS } from "@/lib/constants";

export function QuranAudioBar({ surahId: _surahId, ayahCount: _ayahCount, verseKey }: { surahId: number; ayahCount: number; verseKey?: string }) {
  const { engine } = useAudioSyncContext();
  const positionMs = usePlayback((p) => p.positionMs);
  const playing = usePlayback((p) => p.playing);
  const durationMs = usePlayback((p) => p.durationMs);

  const speed = useReaderStore((s) => s.speed);
  const setSpeed = useReaderStore((s) => s.setSpeed);
  const volume = useReaderStore((s) => s.volume);
  const setVolume = useReaderStore((s) => s.setVolume);
  const reciterId = useReaderStore((s) => s.reciterId);
  const setReciterId = useReaderStore((s) => s.setReciterId);
  const autoAdvance = useReaderStore((s) => s.autoAdvance);
  const setAutoAdvance = useReaderStore((s) => s.setAutoAdvance);
  const repeatTotal = useReaderStore((s) => s.repeatTotal);
  const setRepeatTotal = useReaderStore((s) => s.setRepeatTotal);

  useEffect(() => {
    engine.setRate(speed);
  }, [engine, speed]);

  useEffect(() => {
    engine.setVolume(volume);
  }, [engine, volume]);

  const maxMs = durationMs ?? Math.max(PROGRESS_BAR_MIN_MS, positionMs + 1000);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-1.5">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Stop"
          onClick={() => engine.stop()}
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            if (playing) {
              engine.pause();
            } else if (verseKey) {
              // The full-surah file must start at the ayah the reader has
              // selected ("click an ayah to select it for audio playback"),
              // not resume from the file position.
              engine.playFromVerse(verseKey);
            } else {
              engine.play();
            }
          }}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="w-10 shrink-0 text-xs tabular-nums text-stone-500 dark:text-stone-400">
          {formatMs(positionMs)}
        </span>
        <Slider
          value={[Math.min(positionMs, maxMs)]}
          max={maxMs}
          step={100}
          onValueChange={(v) => engine.seekMs(v[0])}
          className="flex-1"
          aria-label="Seek"
        />
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-stone-500 dark:text-stone-400">
          {formatMs(maxMs)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setVolume(volume === 0 ? 1 : 0)}
          className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          aria-label={volume === 0 ? "Unmute" : "Mute"}
        >
          {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <Slider
          value={[volume]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(v) => setVolume(v[0])}
          className="w-16"
          aria-label="Volume"
        />
      </div>

      <div className="flex items-center gap-2 sm:w-36">
        <span className="shrink-0 text-xs tabular-nums text-stone-500 dark:text-stone-400">
          {speed.toFixed(2)}x
        </span>
        <Slider
          value={[speed]}
          min={0.5}
          max={1.5}
          step={0.05}
          onValueChange={(v) => setSpeed(v[0])}
          className="flex-1"
          aria-label="Speed"
        />
      </div>

      <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
        <input
          type="checkbox"
          checked={autoAdvance}
          onChange={(e) => setAutoAdvance(e.target.checked)}
          className="accent-amber-600"
        />
        Auto-advance
      </label>

      <Select
        value={String(repeatTotal)}
        onChange={(e) => setRepeatTotal(Number(e.target.value))}
        aria-label="Repeat"
        className="max-w-[82px] shrink-0"
        options={[
          { value: "0", label: "Repeat off" },
          { value: "3", label: "Repeat ×3" },
          { value: "5", label: "Repeat ×5" },
          { value: "-1", label: "Repeat loop" },
        ]}
      />

      <Select
        value={String(reciterId)}
        onChange={(e) => setReciterId(Number(e.target.value))}
        aria-label="Reciter"
        className="hidden max-w-[130px] shrink-0 md:block"
        options={RECITERS.map((r) => ({
          value: String(r.id),
          label: r.name,
        }))}
      />
    </div>
  );
}
