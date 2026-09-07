import type { Howl } from "howler";
import type { VerseTiming } from "./full-surah";

type EngineMode = "idle" | "loading" | "howler" | "virtual";

const WORD_CLIP_FALLBACK_MS = 900;

export class AudioEngine {
  private howl: Howl | null = null;
  private url: string | null = null;
  private lastGoodUrl: string | null = null;
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
    if (this.url === url && this.mode !== "idle" && this.mode !== "virtual") return;
    const previousUrl = this.url;
    this.softStop();
    this.unload();
    this.url = url;
    this.anchorPos = 0;
    if (typeof window === "undefined") return;
    this.mode = "loading";
    const myLoad = ++this.loadSeq;
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
        if (previousUrl && previousUrl !== url) {
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
    } catch (err) {
      console.warn("[AudioEngine] load exception:", url, String(err));
      if (previousUrl && previousUrl !== url) {
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
      this.clipResolve = () => {
        if (myClip === this.clipSeq) resolve();
      };
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
    const clamped = Math.min(1.5, Math.max(0.5, rate));
    if (this.virtualPlaying) {
      this.anchorPos = this.virtualNow();
      this.anchorWall = Date.now();
    }
    this.rateFactor = clamped;
    if (this.howl) this.howl.rate(clamped);
  }

  setVolume(vol: number) {
    const clamped = Math.min(1, Math.max(0, vol));
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
