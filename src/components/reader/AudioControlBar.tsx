"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, WholeWord, ListMusic, Repeat } from "lucide-react";
import type { QuranWord } from "@/types/quran";
import { useAudioSyncContext, usePlayback } from "@/hooks/use-audio-sync";
import { useReaderStore } from "@/stores/reader-store";
import { RECITERS } from "@/lib/quran/reciters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatMs } from "@/lib/utils";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function AudioControlBar({ words, verseKey, syncStatus }: { words: QuranWord[]; verseKey: string; syncStatus?: "idle" | "syncing" | "completed" | "failed" }) {
  const { engine } = useAudioSyncContext();
  const positionMs = usePlayback((p) => p.positionMs);
  const playing = usePlayback((p) => p.playing);

  const speed = useReaderStore((s) => s.speed);
  const setSpeed = useReaderStore((s) => s.setSpeed);
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
    engine.abortClips();
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

  function handleStop() {
    stopSequence();
  }

  function handleModeToggle() {
    stopSequence();
    setPlaybackMode(playbackMode === "word" ? "continuous" : "word");
  }

  function handleContinuousToggle() {
    setContinuousPlay(!continuousPlay);
  }

  const isWord = playbackMode === "word";
  const isPlaying = isWord ? seqActive : playing;
  const maxMs = engine.durationMs() ?? Math.max(8000, positionMs + 1000);
  const progressLabel =
    isWord && forcedIndex !== null
      ? `word ${forcedIndex + 1}/${words.length}`
      : `${formatMs(positionMs)} / ${formatMs(maxMs)}`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-1.5">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Stop"
          onClick={handleStop}
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button size="icon" aria-label={isPlaying ? "Pause" : "Play"} onClick={handleTogglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
<Button
            size="sm"
            variant={isWord ? "default" : "outline"}
            onClick={handleModeToggle}
            aria-label={isWord ? "Switch to continuous recitation" : "Switch to word-by-word drill"}
            className="gap-1.5"
          >
            {isWord ? <WholeWord className="h-4 w-4" /> : <ListMusic className="h-4 w-4" />}
            {isWord ? "WbW" : "Full"}
          </Button>
          <Button
            size="sm"
            variant={continuousPlay ? "default" : "outline"}
            onClick={handleContinuousToggle}
            aria-label={continuousPlay ? "Disable continuous play" : "Enable continuous play"}
            className="gap-1.5"
            title={continuousPlay ? "Playing continuously — click to stop after verse" : "Click to keep playing through verses"}
          >
            <Repeat className="h-4 w-4" />
            {continuousPlay ? "On" : "Off"}
          </Button>
          {syncStatus && syncStatus !== "idle" && (
            <span className="ml-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              {syncStatus === "syncing" && <span className="animate-spin">⟳</span>}
              {syncStatus === "completed" && <span className="text-emerald-600">✓</span>}
              {syncStatus === "failed" && <span className="text-red-600">✕</span>}
              <span className="capitalize">{syncStatus}</span>
            </span>
          )}
        {!isWord && (
          <div className="flex items-center gap-1 pl-1">
            <Button
              size="sm"
              variant={loopA !== null ? "default" : "outline"}
              onClick={() => setLoopA(positionMs)}
              title="Set loop start at current position"
            >
              A
            </Button>
            <Button
              size="sm"
              variant={loopB !== null ? "default" : "outline"}
              onClick={() => setLoopB(positionMs)}
              title="Set loop end at current position"
            >
              B
            </Button>
            {loopA !== null || loopB !== null ? (
              <>
                <Badge variant="warning" className="gap-1">
                  {formatMs(loopA ?? 0)}–{loopB !== null ? formatMs(loopB) : "…"}
                </Badge>
                <Button size="sm" variant="ghost" onClick={clearLoop}>
                  Clear
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>

      {isWord ? (
        <p className="flex min-w-0 flex-1 items-center justify-center text-xs tabular-nums text-stone-500 dark:text-stone-400">
          {progressLabel}
        </p>
      ) : (
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
      )}

      <div className="flex items-center gap-2 sm:w-44">
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
          aria-label="Playback speed"
        />
      </div>

      <Select
        value={String(reciterId)}
        onChange={(e) => setReciterId(Number(e.target.value))}
        aria-label="Reciter"
        className="hidden max-w-[150px] shrink-0 md:block"
        options={RECITERS.map((r) => ({
          value: String(r.id),
          label: r.name,
        }))}
      />
    </div>
  );
}
