"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, WholeWord, ListMusic, Repeat, Volume2, VolumeX, Disc } from "lucide-react";
import type { QuranWord } from "@/types/quran";
import { useAudioSyncContext, usePlayback } from "@/hooks/use-audio-sync";
import { useReaderStore } from "@/stores/reader-store";
import { RECITERS } from "@/lib/quran/reciters";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatMs } from "@/lib/utils";
import { SPEED_MIN, SPEED_MAX } from "@/lib/constants";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof WholeWord;
  label: string;
  title: string;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      aria-label={title}
      title={title}
      className="gap-1 px-2"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export function AudioControlBar({ words, verseKey, syncStatus }: { words: QuranWord[]; verseKey: string; syncStatus?: "idle" | "syncing" | "completed" | "failed" }) {
  const { engine } = useAudioSyncContext();
  const positionMs = usePlayback((p) => p.positionMs);
  const playing = usePlayback((p) => p.playing);

  const speed = useReaderStore((s) => s.speed);
  const setSpeed = useReaderStore((s) => s.setSpeed);
  const volume = useReaderStore((s) => s.volume);
  const setVolume = useReaderStore((s) => s.setVolume);
  const loopA = useReaderStore((s) => s.loopA);
  const loopB = useReaderStore((s) => s.loopB);
  const setLoopA = useReaderStore((s) => s.setLoopA);
  const setLoopB = useReaderStore((s) => s.setLoopB);
  const clearLoop = useReaderStore((s) => s.clearLoop);
  const playbackMode = useReaderStore((s) => s.playbackMode);
  const setPlaybackMode = useReaderStore((s) => s.setPlaybackMode);
  const setForcedActiveIndex = useReaderStore((s) => s.setForcedActiveIndex);
  const reciterId = useReaderStore((s) => s.reciterId);
  const setReciterId = useReaderStore((s) => s.setReciterId);
  const continuousPlay = useReaderStore((s) => s.continuousPlay);
  const setContinuousPlay = useReaderStore((s) => s.setContinuousPlay);
  const surahAudioMode = useReaderStore((s) => s.surahAudioMode);
  const setSurahAudioMode = useReaderStore((s) => s.setSurahAudioMode);

  const seqRunningRef = useRef(false);
  const seqGenRef = useRef(0);
  const forcedIndex = useReaderStore((s) => s.forcedActiveIndex);
  const [seqActive, setSeqActive] = useState(false);

  useEffect(() => {
    seqGenRef.current++;
    seqRunningRef.current = false;
    engine.abortClips();
    setForcedActiveIndex(null);
  }, [verseKey, engine, setForcedActiveIndex]);

  useEffect(() => {
    engine.setRate(speed);
  }, [engine, speed]);

  useEffect(() => {
    engine.setVolume(volume);
  }, [engine, volume]);

  async function runSequence(list: QuranWord[]) {
    const gen = ++seqGenRef.current;
    seqRunningRef.current = true;
    setSeqActive(true);
    try {
      for (let i = 0; i < list.length; i++) {
        if (gen !== seqGenRef.current || !seqRunningRef.current) break;
        setForcedActiveIndex(i);
        const clip = list[i];
        if (clip.audio_url) {
          await engine.playClip(clip.audio_url);
        } else {
          await sleep(700 / speed);
        }
      }
    } finally {
      if (gen === seqGenRef.current) {
        seqRunningRef.current = false;
        setForcedActiveIndex(null);
        setSeqActive(false);
      }
    }
  }

  function stopSequence() {
    seqRunningRef.current = false;
    seqGenRef.current++;
    engine.stop();
    setForcedActiveIndex(null);
    setSeqActive(false);
  }

  function handleTogglePlay() {
    if (playbackMode === "word") {
      if (seqRunningRef.current) stopSequence();
      else void runSequence(words.filter((w) => w.text_uthmani.trim().length > 0));
    } else if (playing) {
      engine.pause();
    } else {
      engine.play();
    }
  }

  const isWord = playbackMode === "word";
  const isPlaying = isWord ? seqActive : playing;
  const maxMs = engine.durationMs() ?? Math.max(8000, positionMs + 1000);

  return (
    <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      {/* Row 1: Transport + Modes */}
      <div className="flex items-center gap-1.5">
        {/* Transport */}
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" aria-label="Stop" onClick={stopSequence} className="h-8 w-8">
            <Square className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" aria-label={isPlaying ? "Pause" : "Play"} onClick={handleTogglePlay} className="h-8 w-8">
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className="h-5 w-px bg-stone-200 dark:bg-stone-700" />

        {/* Mode toggles */}
        <ModeButton
          active={isWord}
          onClick={() => { stopSequence(); setPlaybackMode(playbackMode === "word" ? "continuous" : "word"); }}
          icon={isWord ? WholeWord : ListMusic}
          label={isWord ? "WbW" : "Full"}
          title={isWord ? "Word-by-word drill" : "Full verse recitation"}
        />
        <ModeButton
          active={surahAudioMode}
          onClick={() => { stopSequence(); setSurahAudioMode(!surahAudioMode); }}
          icon={Disc}
          label={surahAudioMode ? "Surah" : "Verse"}
          title={surahAudioMode ? "Playing full surah" : "Play entire surah continuously"}
        />
        {!surahAudioMode && (
          <ModeButton
            active={continuousPlay}
            onClick={() => setContinuousPlay(!continuousPlay)}
            icon={Repeat}
            label={continuousPlay ? "Loop On" : "Loop Off"}
            title={continuousPlay ? "Continuous play enabled" : "Continuous play disabled"}
          />
        )}

        {/* Sync status */}
        {syncStatus && syncStatus !== "idle" && (
          <span className="ml-1 flex items-center gap-1 text-xs text-stone-400">
            {syncStatus === "syncing" && <span className="animate-spin">⟳</span>}
            {syncStatus === "completed" && <span className="text-emerald-500">✓</span>}
            {syncStatus === "failed" && <span className="text-red-500">✕</span>}
          </span>
        )}

        {/* A-B loop */}
        {!isWord && (loopA !== null || loopB !== null) && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-stone-500 dark:bg-stone-800">
              {formatMs(loopA ?? 0)} – {loopB !== null ? formatMs(loopB) : "…"}
            </span>
            <Button size="sm" variant="ghost" onClick={clearLoop} className="h-6 px-1.5 text-xs">
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Row 2: Seek + Time + Speed + Volume + Reciter */}
      <div className="flex items-center gap-2">
        {/* Play mode: Word counter or Seek bar */}
        {isWord ? (
          <p className="flex-1 text-center text-xs tabular-nums text-stone-500 dark:text-stone-400">
            {forcedIndex !== null ? `Word ${forcedIndex + 1} / ${words.length}` : `${words.length} words`}
          </p>
        ) : (
          <>
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-stone-400">
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
            <span className="w-10 shrink-0 text-[11px] tabular-nums text-stone-400">
              {formatMs(maxMs)}
            </span>
          </>
        )}

        <div className="h-5 w-px bg-stone-200 dark:bg-stone-700" />

        {/* Speed */}
        <div className="flex items-center gap-1.5" title={`Speed: ${speed.toFixed(2)}x`}>
          <span className="w-9 shrink-0 text-center text-[11px] font-medium tabular-nums text-stone-600 dark:text-stone-300">
            {speed.toFixed(1)}x
          </span>
          <Slider
            value={[speed]}
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={0.05}
            onValueChange={(v) => setSpeed(v[0])}
            className="w-16"
            aria-label="Playback speed"
          />
        </div>

        <div className="h-5 w-px bg-stone-200 dark:bg-stone-700" />

        {/* Volume */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(v) => setVolume(v[0])}
            className="w-14"
            aria-label="Volume"
          />
        </div>

        {/* Reciter */}
        <Select
          value={String(reciterId)}
          onChange={(e) => setReciterId(Number(e.target.value))}
          aria-label="Reciter"
          className="hidden max-w-[140px] shrink-0 md:block"
          options={RECITERS.map((r) => ({
            value: String(r.id),
            label: r.name,
          }))}
        />
      </div>

      {/* Row 3: A-B loop set buttons (when no loop active) */}
      {!isWord && loopA === null && loopB === null && (
        <div className="flex items-center gap-1.5 border-t border-stone-100 pt-2 dark:border-stone-800">
          <span className="text-[10px] uppercase tracking-wide text-stone-400">Loop</span>
          <Button size="sm" variant="outline" onClick={() => setLoopA(positionMs)} className="h-6 px-2 text-xs">
            Set A
          </Button>
          <Button size="sm" variant="outline" onClick={() => setLoopB(positionMs)} className="h-6 px-2 text-xs">
            Set B
          </Button>
        </div>
      )}
    </div>
  );
}
