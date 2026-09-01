"use client";

import { useEffect } from "react";
import { Pause, Play, Square, Repeat, Volume2, VolumeX } from "lucide-react";
import { useAudioSyncContext, usePlayback } from "@/hooks/use-audio-sync";
import { useReaderStore } from "@/stores/reader-store";
import { RECITERS } from "@/lib/quran/reciters";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatMs } from "@/lib/utils";

export function QuranAudioBar() {
  const { engine } = useAudioSyncContext();
  const positionMs = usePlayback((p) => p.positionMs);
  const playing = usePlayback((p) => p.playing);

  const speed = useReaderStore((s) => s.speed);
  const setSpeed = useReaderStore((s) => s.setSpeed);
  const volume = useReaderStore((s) => s.volume);
  const setVolume = useReaderStore((s) => s.setVolume);
  const continuousPlay = useReaderStore((s) => s.continuousPlay);
  const setContinuousPlay = useReaderStore((s) => s.setContinuousPlay);
  const reciterId = useReaderStore((s) => s.reciterId);
  const setReciterId = useReaderStore((s) => s.setReciterId);

  useEffect(() => {
    engine.setRate(speed);
  }, [engine, speed]);

  useEffect(() => {
    engine.setVolume(volume);
  }, [engine, volume]);

  const maxMs = engine.durationMs() ?? Math.max(8000, positionMs + 1000);

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
          onClick={() => (playing ? engine.pause() : engine.play())}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant={continuousPlay ? "default" : "outline"}
          onClick={() => setContinuousPlay(!continuousPlay)}
          aria-label={continuousPlay ? "Stop after verse" : "Continue reading"}
          className="gap-1.5"
          title={continuousPlay ? "Playing continuously" : "Keep playing through verses"}
        >
          <Repeat className="h-4 w-4" />
          {continuousPlay ? "On" : "Off"}
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
