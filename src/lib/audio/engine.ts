import type { Howl } from "howler";

type EngineMode = "idle" | "loading" | "howler" | "virtual";

const WORD_CLIP_FALLBACK_MS = 900;

export class AudioEngine {
  private howl: Howl | null = null;
  private url: string | null = null;
  private mode: EngineMode = "idle";
  private rateFactor = 1;
  private virtualPlaying = false;
  private anchorWall = 0;
  private anchorPos = 0;
  private pendingPlay = false;
  private loadSeq = 0;
  private clipResolve: (() => void) | null = null;
  private clipSeq = 0;
  private virtualClipTimer: ReturnType<typeof setTimeout> | null = null;

  async load(url: string) {
    if (!url) return;
    if (this.url === url && this.mode !== "idle" && this.mode !== "virtual") return;
    this.softStop();
    this.unload();
    this.url = url;
    this.anchorPos = 0;
    if (typeof window === "undefined") return;
    this.mode = "loading";
    const myLoad = ++this.loadSeq;
    try {
      const { Howl: HowlCtor } = await import("howler");
      const howl = new HowlCtor({
        src: [url],
        format: ["mp3"],
        html5: true,
        preload: true,
        rate: this.rateFactor,
      });
      howl.once("end", () => {
        if (this.loadSeq === myLoad) {
          this.anchorPos = Number(howl.duration() || 0) * 1000;
          this.resolveClipIfCurrent(myLoad);
          this.loadSeq++;
        }
      });
      howl.on("load", () => {
        this.mode = "howler";
        howl.rate(this.rateFactor);
        if (this.pendingPlay) {
          this.pendingPlay = false;
          howl.play();
        }
      });
      howl.on("loaderror", () => {
        this.mode = "virtual";
        if (this.pendingPlay) {
          this.pendingPlay = false;
          this.playVirtual();
        }
        if (this.clipResolve && !this.virtualClipTimer) {
          this.virtualClipTimer = setTimeout(
            () => {
              this.virtualClipTimer = null;
              this.resolveClipIfCurrent(this.loadSeq);
            },
            WORD_CLIP_FALLBACK_MS / this.rateFactor
          );
        }
      });
      this.howl = howl;
    } catch {
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

  getRate() {
    return this.rateFactor;
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

  private virtualNow() {
    if (!this.virtualPlaying) return this.anchorPos;
    return this.anchorPos + (Date.now() - this.anchorWall) * this.rateFactor;
  }

  private softStop() {
    this.clearVirtualClipTimer();
    this.pendingPlay = false;
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
    this.pause();
    this.unload();
    this.url = null;
    this.mode = "idle";
  }
}
