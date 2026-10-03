import type { Howl } from "howler";
import type { VerseTiming } from "./full-surah";
import { SPEED_MIN, SPEED_MAX, VOLUME_MIN, VOLUME_MAX } from "@/lib/constants";

type EngineMode = "idle" | "loading" | "howler" | "virtual";

const WORD_CLIP_FALLBACK_MS = 900;

export class AudioEngine {
  private howl: Howl | null = null;
  private url: string | null = null;
  private lastGoodUrl: string | null = null;
  /** URLs that have already errored, so the fallback cannot ping-pong. */
  private failedUrls = new Set<string>();
  private mode: EngineMode = "idle";
  private rateFactor = 1;
  private volumeFactor = 1;
  private virtualPlaying = false;
  private anchorWall = 0;
  private anchorPos = 0;
  private pendingPlay = false;
  private loadSeq = 0;
  private clipResolve: (() => void) | null = null;
  private clipSeq = 0;
  private virtualClipTimer: ReturnType<typeof setTimeout> | null = null;
  private endCallback: (() => void) | null = null;

  private surahTimings: VerseTiming[] | null = null;
  private currentVerseIndex = -1;
  private verseChangeCallback: ((verseKey: string) => void) | null = null;

  onEnd(callback: (() => void) | null) {
    this.endCallback = callback;
  }

  onVerseChange(callback: ((verseKey: string) => void) | null) {
    this.verseChangeCallback = callback;
  }

  setSurahTimings(timings: VerseTiming[]) {
    this.surahTimings = timings;
    this.currentVerseIndex = -1;
  }

  clearSurahTimings() {
    this.surahTimings = null;
    this.currentVerseIndex = -1;
    this.verseChangeCallback = null;
  }

  private checkVerseChange() {
    if (!this.surahTimings || this.surahTimings.length === 0) return;
    const pos = this.nowMs();
    let idx = -1;
    for (let i = 0; i < this.surahTimings.length; i++) {
      const t = this.surahTimings[i];
      if (pos >= t.start_ms && pos < t.end_ms) {
        idx = i;
        break;
      }
    }
    if (idx === -1 && pos >= this.surahTimings[this.surahTimings.length - 1].start_ms) {
      idx = this.surahTimings.length - 1;
    }
    if (idx !== -1 && idx !== this.currentVerseIndex) {
      this.currentVerseIndex = idx;
      const cb = this.verseChangeCallback;
      if (cb) queueMicrotask(() => cb(this.surahTimings![idx].verseKey));
    }
  }

  async load(url: string) {
    if (!url) return;
    // Deduped on the URL alone. Excluding "virtual" from this check meant a
    // load that had failed into virtual mode was retried on every subsequent
    // effect run, each attempt creating another Howl — and with html5 audio
    // Howler only pools three Audio objects, so the pool was exhausted and it
    // began handing back objects that were still locked. Retry a virtual URL
    // only via an explicit load() with force, or a different URL.
    if (this.url === url && this.mode !== "idle") return;
    const previousUrl = this.url;
    this.softStop();
    this.unload();
    this.url = url;
    this.anchorPos = 0;
    if (typeof window === "undefined") return;
    this.mode = "loading";
    const myLoad = ++this.loadSeq;
    // Tracked separately so the catch can release it: a Howl that throws or
    // fails still holds an HTML5 Audio slot, and Howler's pool is three deep.
    let created: Howl | null = null;
    try {
      const { Howl: HowlCtor } = await import("howler");
      if (this.loadSeq !== myLoad) return;
      const howl = new HowlCtor({
        src: [url],
        format: ["mp3"],
        html5: true,
        preload: true,
        rate: this.rateFactor,
        volume: this.volumeFactor,
      });
      howl.once("end", () => {
        if (this.loadSeq !== myLoad) return;
        this.anchorPos = Number(howl.duration() || 0) * 1000;
        this.resolveClipIfCurrent(myLoad);
        this.loadSeq++;
        howl.off();
        howl.unload();
        this.howl = null;
        this.mode = "idle";
        this.currentVerseIndex = -1;
        const cb = this.endCallback;
        if (cb) queueMicrotask(() => cb());
      });
      howl.on("load", () => {
        if (this.loadSeq !== myLoad) return;
        this.mode = "howler";
        this.lastGoodUrl = url;
        howl.rate(this.rateFactor);
        howl.volume(this.volumeFactor);
        if (this.pendingPlay) {
          this.pendingPlay = false;
          howl.play();
        }
      });
      howl.on("play", () => {
        if (this.loadSeq !== myLoad) return;
        this.checkVerseChange();
      });
      howl.on("loaderror", (_id, err) => {
        if (this.loadSeq !== myLoad) return;
        console.warn("[AudioEngine] load failed:", url, String(err));
        this.failedUrls.add(url);
        // Release the audio object now. Leaving the failed Howl assigned means
        // it holds an HTML5 Audio slot until some later load happens to unload
        // it, and Howler's pool is only three deep.
        if (this.howl === howl) {
          this.howl = null;
        }
        howl.off();
        howl.unload();
        // Fall back only to a URL that has not already failed. Comparing against
// lastGoodUrl did not work: in the normal case the previous URL *is* the last
// good one, so that blocked the legitimate fallback. Tracking failures is what
// actually prevents two failing URLs from ping-ponging through the fallback
// recursively and spawning overlapping loads.
if (previousUrl && previousUrl !== url && !this.failedUrls.has(previousUrl)) {
          void this.load(previousUrl);
          return;
        }
        this.mode = "virtual";
        if (this.pendingPlay) {
          this.pendingPlay = false;
          this.playVirtual();
        }
        if (this.clipResolve && !this.virtualClipTimer) {
          const fallbackLoad = myLoad;
          this.virtualClipTimer = setTimeout(() => {
            this.virtualClipTimer = null;
            this.resolveClipIfCurrent(fallbackLoad);
          }, WORD_CLIP_FALLBACK_MS / this.rateFactor);
        }
      });
      this.howl = howl;
      created = howl;
    } catch (err) {
      console.warn("[AudioEngine] load exception:", url, String(err));
      this.failedUrls.add(url);
      if (created) {
        if (this.howl === created) {
          this.howl = null;
        }
        created.off();
        created.unload();
      }
      if (previousUrl && previousUrl !== url && previousUrl !== this.lastGoodUrl) {
        void this.load(previousUrl);
        return;
      }
      this.mode = "virtual";
    }
  }

  async playClip(url: string): Promise<void> {
    this.clearVirtualClipTimer();
    const myClip = ++this.clipSeq;
    await new Promise<void>((resolve) => {
      // Resolve unconditionally: this closure belongs to exactly one clip, and
      // gating on clipSeq meant abortClips() (which bumps clipSeq first) left
      // the promise permanently pending.
      this.clipResolve = () => resolve();
      void this.load(url).then(() => {
        if (myClip !== this.clipSeq) {
          resolve();
          return;
        }
        this.play();
      });
    });
  }

  private resolveClipIfCurrent(loadSeqAtSchedule: number) {
    if (this.loadSeq !== loadSeqAtSchedule) return;
    this.clipResolve?.();
    this.clipResolve = null;
  }

  private clearVirtualClipTimer() {
    if (this.virtualClipTimer) {
      clearTimeout(this.virtualClipTimer);
      this.virtualClipTimer = null;
    }
  }

  abortClips() {
    this.clipSeq++;
    this.clearVirtualClipTimer();
    this.clipResolve?.();
    this.clipResolve = null;
  }

  play() {
    if (this.mode === "howler" && this.howl) {
      if (!this.howl.playing()) this.howl.play();
    } else if (this.mode === "virtual") {
      this.playVirtual();
    } else {
      this.pendingPlay = true;
    }
  }

  private playVirtual() {
    this.virtualPlaying = true;
    this.anchorWall = Date.now();
  }

  pause() {
    this.pendingPlay = false;
    if (this.mode === "howler" && this.howl) {
      this.howl.pause();
    }
    if (this.virtualPlaying) {
      this.virtualPlaying = false;
      this.anchorPos = this.virtualNow();
    }
    this.abortClips();
  }

  stop() {
    this.pause();
    if (this.howl) this.howl.stop();
    this.seekMs(0);
  }

  seekMs(ms: number) {
    if (this.mode === "howler" && this.howl?.state() === "loaded") {
      this.howl.seek(Math.max(0, ms / 1000));
    }
    this.anchorPos = Math.max(0, ms);
    this.anchorWall = Date.now();
    if (this.surahTimings) this.checkVerseChange();
  }

  setRate(rate: number) {
    const clamped = Math.min(SPEED_MAX, Math.max(SPEED_MIN, rate));
    if (this.virtualPlaying) {
      this.anchorPos = this.virtualNow();
      this.anchorWall = Date.now();
    }
    this.rateFactor = clamped;
    if (this.howl) this.howl.rate(clamped);
  }

  setVolume(vol: number) {
    const clamped = Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, vol));
    this.volumeFactor = clamped;
    if (this.howl) this.howl.volume(clamped);
  }

  getRate() {
    return this.rateFactor;
  }

  getVolume() {
    return this.volumeFactor;
  }

  isPlaying() {
    if (this.mode === "howler" && this.howl) return this.howl.playing();
    return this.virtualPlaying;
  }

  nowMs() {
    if (this.mode === "howler" && this.howl?.state() === "loaded") {
      const s = Number(this.howl.seek());
      return Number.isFinite(s) ? s * 1000 : this.virtualNow();
    }
    if (this.mode === "virtual") return this.virtualNow();
    return this.virtualPlaying ? this.virtualNow() : this.anchorPos;
  }

  durationMs(): number | null {
    if (this.mode === "howler" && this.howl?.state() === "loaded") {
      const d = this.howl.duration();
      return Number.isFinite(d) ? d * 1000 : null;
    }
    return null;
  }

  getMode(): EngineMode {
    return this.mode;
  }

  private virtualNow() {
    if (!this.virtualPlaying) return this.anchorPos;
    return this.anchorPos + (Date.now() - this.anchorWall) * this.rateFactor;
  }

  private softStop() {
    this.clearVirtualClipTimer();
    if (this.virtualPlaying) {
      this.virtualPlaying = false;
      this.anchorPos = this.virtualNow();
    }
    if (this.howl) this.howl.stop();
  }

  private unload() {
    if (this.howl) {
      this.howl.off();
      this.howl.unload();
      this.howl = null;
    }
  }

  destroy() {
    this.endCallback = null;
    this.verseChangeCallback = null;
    this.surahTimings = null;
    this.currentVerseIndex = -1;
    this.pause();
    this.unload();
    this.url = null;
    this.mode = "idle";
  }
}
