import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("howler", () => {
  const instances: MockHowl[] = [];
  /** Every Howl ever constructed, including unloaded ones. */
  const all: MockHowl[] = [];

  class MockHowl {
    _src: string;
    _volume = 1;
    _rate = 1;
    _playing = false;
    _listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
    _seekPos = 0;
    _unloaded = false;

    constructor(opts: { src: string[]; volume?: number; rate?: number }) {
      this._src = opts.src[0];
      this._volume = opts.volume ?? 1;
      this._rate = opts.rate ?? 1;
      instances.push(this);
      all.push(this);
    }

    on(event: string, cb: (...args: unknown[]) => void) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(cb);
    }

    once(event: string, cb: (...args: unknown[]) => void) {
      this.on(event, cb);
    }

    off() {
      this._listeners = {};
    }

    play() {
      this._playing = true;
      return this;
    }

    pause() {
      this._playing = false;
      return this;
    }

    stop() {
      this._playing = false;
      this._seekPos = 0;
      return this;
    }

    unload() {
      this._unloaded = true;
      const idx = instances.indexOf(this);
      if (idx >= 0) instances.splice(idx, 1);
    }

    playing() {
      return this._playing;
    }

    seek(s?: number) {
      if (s !== undefined) {
        this._seekPos = s;
        return s;
      }
      return this._seekPos;
    }

    duration() {
      return 10;
    }

    volume(v?: number) {
      if (v !== undefined) this._volume = v;
      return this._volume;
    }

    rate(r?: number) {
      if (r !== undefined) this._rate = r;
      return this._rate;
    }

    state() {
      return "loaded";
    }

    fireEnd() {
      this._playing = false;
      const cbs = [...(this._listeners["end"] ?? [])];
      for (const cb of cbs) cb();
    }

    fireLoad() {
      const cbs = [...(this._listeners["load"] ?? [])];
      for (const cb of cbs) cb();
    }

    fireLoadError(err: string) {
      const cbs = [...(this._listeners["loaderror"] ?? [])];
      for (const cb of cbs) cb(0, err);
    }
  }

  return {
    Howl: MockHowl,
    __instances: instances,
    __all: all,
  };
});

import { AudioEngine } from "@/lib/audio/engine";
import type { VerseTiming } from "@/lib/audio/full-surah";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const howlerMock = await import("howler") as any;

function getLastHowl() {
  const instances = howlerMock.__instances;
  return instances[instances.length - 1];
}

function getAllHowls() {
  return howlerMock.__instances;
}

/** Every Howl ever constructed in this test, unloaded ones included. */
function getEveryHowlEverCreated() {
  return howlerMock.__all as Array<{ _src: string; _unloaded: boolean }>;
}

beforeEach(() => {
  howlerMock.__instances.length = 0;
  howlerMock.__all.length = 0;
});

describe("AudioEngine", () => {
  describe("load", () => {
    it("creates a Howl instance with correct src", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/audio.mp3");
      expect(getLastHowl()._src).toBe("https://example.com/audio.mp3");
    });

    it("does not load empty URL", async () => {
      const engine = new AudioEngine();
      await engine.load("");
      expect(getAllHowls().length).toBe(0);
    });

    it("does not reload same URL when in howler mode", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      expect(getAllHowls().length).toBe(1);
      await engine.load("https://example.com/a.mp3");
      expect(getAllHowls().length).toBe(1);
    });

    it("reloads when URL changes", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      await engine.load("https://example.com/b.mp3");
      expect(getAllHowls().length).toBe(1);
      expect(getLastHowl()._src).toBe("https://example.com/b.mp3");
    });

    it("sets mode to idle after SSR check returns", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      // In jsdom, typeof window is "object", so SSR early return doesn't happen.
      // Mode will be "loading" until fireLoad sets it to "howler".
      expect(engine.getMode()).toBe("loading");
    });

    it("mode becomes howler after fireLoad", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      expect(engine.getMode()).toBe("howler");
    });
  });

  describe("play / pause", () => {
    it("sets pendingPlay when mode is loading", async () => {
      const engine = new AudioEngine();
      engine.load("https://example.com/a.mp3");
      engine.play();
      expect(engine.getMode()).toBe("loading");
    });

    it("plays when howler mode and not playing", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.play();
      expect(getLastHowl()._playing).toBe(true);
    });

    it("does not call play again if already playing", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      const howl = getLastHowl();
      const spy = vi.spyOn(howl, "play");
      engine.play();
      engine.play();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("pauses when howler mode", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.play();
      engine.pause();
      expect(getLastHowl()._playing).toBe(false);
    });

    it("auto-plays after load when pendingPlay was set", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      engine.play();
      expect(engine.getMode()).toBe("loading");
      getLastHowl().fireLoad();
      expect(getLastHowl()._playing).toBe(true);
    });
  });

  describe("playFromVerse", () => {
    const timings: VerseTiming[] = [
      { verseKey: "1:1", start_ms: 0, end_ms: 4000 },
      { verseKey: "1:2", start_ms: 4000, end_ms: 9000 },
      { verseKey: "1:3", start_ms: 9000, end_ms: 15000 },
      { verseKey: "1:4", start_ms: 15000, end_ms: 20000 },
    ];

    async function loadedEngineWithTimings(url = "https://example.com/surah.mp3") {
      const engine = new AudioEngine();
      await engine.load(url);
      getLastHowl().fireLoad();
      engine.setSurahTimings(timings);
      return engine;
    }

    it("seeks to the selected verse's start when paused elsewhere", async () => {
      const engine = await loadedEngineWithTimings();
      engine.playFromVerse("1:3");
      expect(getLastHowl()._playing).toBe(true);
      expect(getLastHowl()._seekPos).toBe(9); // 9000 ms = verse 3 start
    });

    it("resumes without seeking when paused inside the selected verse", async () => {
      const engine = await loadedEngineWithTimings();
      // Park the file inside verse 2 and pause there.
      engine.playFromVerse("1:2");
      engine.pause();
      expect(getLastHowl()._seekPos).toBe(4);
      // Starting the SAME verse again must resume, not restart.
      engine.playFromVerse("1:2");
      expect(getLastHowl()._seekPos).toBe(4);
      expect(getLastHowl()._playing).toBe(true);
    });

    it("seeks the file even when play was pressed while still loading", async () => {
      const engine = new AudioEngine();
      // Awaited only through Howl creation; fireLoad below is the LOADED event,
      // so the engine is genuinely still in "loading" mode here.
      await engine.load("https://example.com/surah.mp3");
      expect(engine.getMode()).toBe("loading");
      engine.setSurahTimings(timings);
      engine.play();
      engine.playFromVerse("1:3");
      // Selection and play intent queued before the file is ready...
      getLastHowl().fireLoad();
      // ...must start at the verse's first millisecond, not 0.
      expect(getLastHowl()._playing).toBe(true);
      expect(getLastHowl()._seekPos).toBe(9);
    });

    it("starts from the verse after an explicit stop", async () => {
      const engine = await loadedEngineWithTimings();
      engine.playFromVerse("1:3");
      engine.stop();
      expect(getLastHowl()._seekPos).toBe(0);
      engine.playFromVerse("1:3");
      expect(getLastHowl()._playing).toBe(true);
      expect(getLastHowl()._seekPos).toBe(9);
    });

    it("does not seek in verse-clip mode (no timings)", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/verse.mp3");
      getLastHowl().fireLoad();
      engine.playFromVerse("1:2");
      expect(getLastHowl()._playing).toBe(true);
      expect(getLastHowl()._seekPos).toBe(0);
    });
  });

  describe("stop", () => {
    it("stops and resets position to 0", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.play();
      engine.stop();
      expect(getLastHowl()._playing).toBe(false);
    });
  });

  describe("seekMs", () => {
    it("sets anchor position and seeks Howl", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.seekMs(5000);
      expect(getLastHowl()._seekPos).toBe(5);
    });

    it("clamps negative values to 0", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.seekMs(-100);
      expect(getLastHowl()._seekPos).toBe(0);
    });
  });

  describe("setRate / getRate", () => {
    it("clamps rate between 0.5 and 1.5", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.setRate(2);
      expect(engine.getRate()).toBe(1.5);
      engine.setRate(0.1);
      expect(engine.getRate()).toBe(0.5);
    });

    it("applies rate to Howl", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.setRate(1.25);
      expect(getLastHowl()._rate).toBe(1.25);
    });

    it("applies rate when creating new Howl", async () => {
      const engine = new AudioEngine();
      engine.setRate(0.75);
      await engine.load("https://example.com/a.mp3");
      expect(getLastHowl()._rate).toBe(0.75);
    });

    it("re-anchors position in virtual mode when rate changes", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("fail");
      engine.play();
      engine.setRate(1.2);
      expect(engine.getRate()).toBe(1.2);
    });

    it("clamps exactly at boundary 0.5", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.setRate(0.5);
      expect(engine.getRate()).toBe(0.5);
    });

    it("clamps exactly at boundary 1.5", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.setRate(1.5);
      expect(engine.getRate()).toBe(1.5);
    });
  });

  describe("setVolume / getVolume", () => {
    it("clamps volume between 0 and 1", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.setVolume(2);
      expect(engine.getVolume()).toBe(1);
      engine.setVolume(-1);
      expect(engine.getVolume()).toBe(0);
    });

    it("applies volume to Howl", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.setVolume(0.5);
      expect(getLastHowl()._volume).toBe(0.5);
    });

    it("applies volume when creating new Howl", async () => {
      const engine = new AudioEngine();
      engine.setVolume(0.3);
      await engine.load("https://example.com/a.mp3");
      expect(getLastHowl()._volume).toBe(0.3);
    });
  });

  describe("isPlaying", () => {
    it("returns false when idle", () => {
      const engine = new AudioEngine();
      expect(engine.isPlaying()).toBe(false);
    });

    it("returns true when howler is playing", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.play();
      expect(engine.isPlaying()).toBe(true);
    });

    it("returns false after pause", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.play();
      engine.pause();
      expect(engine.isPlaying()).toBe(false);
    });
  });

  describe("durationMs", () => {
    it("returns null when idle", () => {
      const engine = new AudioEngine();
      expect(engine.durationMs()).toBeNull();
    });

    it("returns duration in ms when loaded", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      expect(engine.durationMs()).toBe(10000);
    });
  });

  describe("nowMs", () => {
    it("returns 0 when idle", () => {
      const engine = new AudioEngine();
      expect(engine.nowMs()).toBe(0);
    });

    it("returns howl seek position when loaded", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.seekMs(3000);
      expect(engine.nowMs()).toBe(3000);
    });
  });

  describe("onEnd callback", () => {
    it("fires callback when Howl ends", async () => {
      const engine = new AudioEngine();
      const cb = vi.fn();
      engine.onEnd(cb);
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      getLastHowl().fireEnd();
      await vi.waitFor(() => expect(cb).toHaveBeenCalled());
    });

    it("does not fire callback after onEnd(null)", async () => {
      const engine = new AudioEngine();
      const cb = vi.fn();
      engine.onEnd(cb);
      engine.onEnd(null);
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      getLastHowl().fireEnd();
      await new Promise((r) => setTimeout(r, 50));
      expect(cb).not.toHaveBeenCalled();
    });

    it("clears howl reference and sets mode to idle after end", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      expect(engine.getMode()).toBe("howler");
      getLastHowl().fireEnd();
      await vi.waitFor(() => expect(engine.getMode()).toBe("idle"));
    });
  });

  describe("destroy", () => {
    it("clears all state", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      engine.play();
      engine.destroy();
      expect(engine.getMode()).toBe("idle");
      expect(engine.isPlaying()).toBe(false);
    });

    it("clears end callback", async () => {
      const engine = new AudioEngine();
      const cb = vi.fn();
      engine.onEnd(cb);
      engine.destroy();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      getLastHowl().fireEnd();
      await new Promise((r) => setTimeout(r, 50));
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe("load fallback", () => {
    it("falls back to previous URL on load error", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/good.mp3");
      getLastHowl().fireLoad();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("network error");
      await vi.waitFor(() => {
        expect(getLastHowl()._src).toBe("https://example.com/good.mp3");
      });
    });

    it("falls back to virtual mode when no previous URL", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("network error");
      await vi.waitFor(() => expect(engine.getMode()).toBe("virtual"));
    });

    it("does not retry the same URL after it failed into virtual mode", async () => {
      // With html5 audio Howler pools only three Audio objects, so creating a
      // fresh Howl on every effect run exhausted the pool and it started
      // handing back objects that were still locked.
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("network error");
      await vi.waitFor(() => expect(engine.getMode()).toBe("virtual"));

      const createdAfterFailure = getAllHowls().length;
      for (let i = 0; i < 10; i += 1) {
        await engine.load("https://example.com/bad.mp3");
      }
      expect(getAllHowls().length).toBe(createdAfterFailure);
    });

    it("releases the failed Howl so its audio object returns to the pool", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      const failed = getLastHowl();
      failed.fireLoadError("network error");
      expect(failed._unloaded).toBe(true);
      // Nothing left holding a pooled Audio object.
      expect(getAllHowls()).toHaveLength(0);
    });

    it("does not ping-pong when two URLs both fail", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoadError("fail");
      await engine.load("https://example.com/b.mp3");
      getLastHowl().fireLoadError("fail");

      await vi.waitFor(() => expect(engine.getMode()).toBe("virtual"));
      // a fails -> b, b fails -> must not go back to a.
      const attempts = getEveryHowlEverCreated().filter(
        (h) => h._src === "https://example.com/a.mp3"
      );
      expect(attempts).toHaveLength(1);
    });

    it("still falls back to a known-good URL on a transient failure", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/good.mp3");
      getLastHowl().fireLoad();
      await engine.load("https://example.com/flaky.mp3");
      getLastHowl().fireLoadError("fail");
      await vi.waitFor(() =>
        expect(
          getAllHowls().some(
            (h: { _src: string }) => h._src === "https://example.com/good.mp3"
          )
        ).toBe(true)
      );
    });

    it("auto-plays in virtual mode when pendingPlay", async () => {
      const engine = new AudioEngine();
      engine.load("https://example.com/bad.mp3");
      engine.play();
      await vi.waitFor(() => {
        getLastHowl().fireLoadError("fail");
      });
      await vi.waitFor(() => {
        expect(engine.getMode()).toBe("virtual");
        expect(engine.isPlaying()).toBe(true);
      });
    });
  });

  describe("virtual mode", () => {
    it("plays virtual timer", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("fail");
      engine.play();
      expect(engine.isPlaying()).toBe(true);
    });

    it("pauses virtual mode", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("fail");
      engine.play();
      engine.pause();
      expect(engine.isPlaying()).toBe(false);
    });

    it("returns virtualNow when playing", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("fail");
      engine.play();
      const pos = engine.nowMs();
      expect(pos).toBeGreaterThanOrEqual(0);
    });

    it("setVolume applies in virtual mode", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("fail");
      engine.setVolume(0.5);
      expect(engine.getVolume()).toBe(0.5);
    });

    it("position advances while playing in virtual mode", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("fail");
      engine.play();
      const pos1 = engine.nowMs();
      await new Promise((r) => setTimeout(r, 50));
      const pos2 = engine.nowMs();
      expect(pos2).toBeGreaterThanOrEqual(pos1);
    });

    it("stop in virtual mode resets position", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/bad.mp3");
      getLastHowl().fireLoadError("fail");
      engine.play();
      engine.stop();
      expect(engine.nowMs()).toBe(0);
    });
  });

  describe("continuous play flow", () => {
    it("end handler clears howl, play sets pendingPlay, load picks it up", async () => {
      const engine = new AudioEngine();
      const endCb = vi.fn();
      engine.onEnd(endCb);

      await engine.load("https://example.com/verse1.mp3");
      const howl1 = getLastHowl();
      howl1.fireLoad();

      engine.play();
      expect(howl1._playing).toBe(true);

      howl1.fireEnd();
      await vi.waitFor(() => expect(endCb).toHaveBeenCalled());

      expect(engine.getMode()).toBe("idle");

      engine.play();
      await engine.load("https://example.com/verse2.mp3");
      const howl2 = getLastHowl();
      expect(howl2._src).toBe("https://example.com/verse2.mp3");
      howl2.fireLoad();
      expect(howl2._playing).toBe(true);
    });
  });

  describe("playClip", () => {
    it("resolves when clip ends", async () => {
      const engine = new AudioEngine();
      const promise = engine.playClip("https://example.com/clip1.mp3");
      await vi.waitFor(() => {
        getLastHowl().fireLoad();
        getLastHowl().fireEnd();
      });
      await expect(promise).resolves.toBeUndefined();
    });

    it("aborts clips when abortClips is called", async () => {
      const engine = new AudioEngine();
      const promise = engine.playClip("https://example.com/clip1.mp3");
      engine.abortClips();
      await expect(promise).resolves.toBeUndefined();
    });

    it("resolves immediately if clipSeq changes", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      const p1 = engine.playClip("https://example.com/a.mp3");
      const p2 = engine.playClip("https://example.com/b.mp3");
      await vi.waitFor(() => expect(getLastHowl()._src).toBe("https://example.com/b.mp3"));
      getLastHowl().fireLoad();
      getLastHowl().fireEnd();
      await expect(p1).resolves.toBeUndefined();
      await expect(p2).resolves.toBeUndefined();
    });

    it("does not fall back to previous word audio when a clip URL fails into virtual mode", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/prev.mp3");
      getLastHowl().fireLoad();
      const promise = engine.playClip("https://example.com/broken.mp3");
      await vi.waitFor(() => {
        expect(getLastHowl()._src).toBe("https://example.com/broken.mp3");
      });
      getLastHowl().fireLoadError("fail");
      await vi.waitFor(() => expect(engine.getMode()).toBe("virtual"));
      // Virtual clip must still resolve via the fallback timer instead of
      // hanging forever (transport previously stayed stuck on "Pause").
      await expect(promise).resolves.toBeUndefined();
      // The previous word's audio must not be replayed as a fallback.
      expect(getAllHowls().some((h: { _src: string }) => h._src === "https://example.com/prev.mp3")).toBe(false);
    });

    it("resolves a virtual clip whose URL failed on an earlier attempt", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/broken.mp3");
      getLastHowl().fireLoadError("fail");
      await vi.waitFor(() => expect(engine.getMode()).toBe("virtual"));
      const promise = engine.playClip("https://example.com/broken.mp3");
      // The dedupe early-return skips the loaderror path entirely, so the
      // fallback timer must be scheduled from playClip itself.
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe("stop suppression", () => {
    it("does not fire onVerseChange when stop rewinds to 0", async () => {
      const engine = new AudioEngine();
      engine.setSurahTimings([
        { verseKey: "1:1", start_ms: 0, end_ms: 1000 },
        { verseKey: "1:2", start_ms: 1000, end_ms: 3000 },
      ] satisfies VerseTiming[]);
      const onVerseChange = vi.fn();
      engine.onVerseChange(onVerseChange);

      engine.seekMs(1500);
      await vi.waitFor(() => expect(onVerseChange).toHaveBeenCalledWith("1:2"));

      engine.stop();
      // The rewind happened, but the user's selection must stay where it was.
      await new Promise((r) => setTimeout(r, 30));
      expect(onVerseChange).not.toHaveBeenCalledWith("1:1");
    });

    it("still fires onVerseChange when the user seeks across a verse boundary", async () => {
      const engine = new AudioEngine();
      engine.setSurahTimings([
        { verseKey: "1:1", start_ms: 0, end_ms: 1000 },
        { verseKey: "1:2", start_ms: 1000, end_ms: 3000 },
      ] satisfies VerseTiming[]);
      const onVerseChange = vi.fn();
      engine.onVerseChange(onVerseChange);

      engine.seekMs(1500);
      await vi.waitFor(() => expect(onVerseChange).toHaveBeenCalledWith("1:2"));
      // A user seek back into the previous verse must reselect it.
      engine.seekMs(200);
      await vi.waitFor(() => expect(onVerseChange).toHaveBeenCalledWith("1:1"));
    });
  });

  describe("getMode", () => {
    it("returns idle initially", () => {
      const engine = new AudioEngine();
      expect(engine.getMode()).toBe("idle");
    });

    it("returns loading during load", () => {
      const engine = new AudioEngine();
      engine.load("https://example.com/a.mp3");
      expect(engine.getMode()).toBe("loading");
    });

    it("returns howler after load completes", async () => {
      const engine = new AudioEngine();
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      expect(engine.getMode()).toBe("howler");
    });
  });

  describe("repeat", () => {
    function endListenerCounts(howl: { _listeners: Record<string, Array<() => void>> }) {
      return howl._listeners["end"]?.length ?? 0;
    }

    it("defaults to no repeat: end still unloads and fires callback", async () => {
      const engine = new AudioEngine();
      const cb = vi.fn();
      engine.onEnd(cb);
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      getLastHowl().fireEnd();
      await vi.waitFor(() => expect(cb).toHaveBeenCalled());
      expect(engine.getMode()).toBe("idle");
    });

    it("replays the same Howl until the budget is exhausted", async () => {
      const engine = new AudioEngine();
      const cb = vi.fn();
      engine.onEnd(cb);
      engine.setRepeat(2);
      await engine.load("https://example.com/a.mp3");
      const howl = getLastHowl();
      howl.fireLoad();
      howl.play();

      howl.fireEnd();
      expect(howl._seekPos).toBe(0);
      expect(howl._playing).toBe(true);
      expect(howl._unloaded).toBe(false);
      expect(cb).not.toHaveBeenCalled();

      howl.fireEnd();
      expect(howl._playing).toBe(true);
      expect(howl._unloaded).toBe(false);
      expect(cb).not.toHaveBeenCalled();

      howl.fireEnd();
      await vi.waitFor(() => expect(cb).toHaveBeenCalled());
      expect(howl._unloaded).toBe(true);
      expect(engine.getMode()).toBe("idle");
    });

    it("loops forever on -1 and never fires the end callback", async () => {
      const engine = new AudioEngine();
      const cb = vi.fn();
      engine.onEnd(cb);
      engine.setRepeat(-1);
      await engine.load("https://example.com/a.mp3");
      const howl = getLastHowl();
      howl.fireLoad();
      for (let i = 0; i < 6; i += 1) howl.fireEnd();
      expect(endListenerCounts(howl)).toBeGreaterThan(0);
      expect(cb).not.toHaveBeenCalled();
      // Seeking back to the start each rep keeps the transport usable.
      expect(howl._seekPos).toBe(0);
    });

    it("ignores junk totals", async () => {
      const engine = new AudioEngine();
      engine.setRepeat(Number.NaN);
      await engine.load("https://example.com/a.mp3");
      getLastHowl().fireLoad();
      const howl = getLastHowl();
      howl.fireEnd();
      await vi.waitFor(() => expect(engine.getMode()).toBe("idle"));
    });

    it("a new load resets the leftover budget", async () => {
      const engine = new AudioEngine();
      const cb = vi.fn();
      engine.onEnd(cb);
      engine.setRepeat(3);
      await engine.load("https://example.com/a.mp3");
      const howl = getLastHowl();
      howl.fireLoad();
      howl.fireEnd();
      howl.fireEnd();
      // Switch tracks mid-run: the new URL gets a full budget again.
      await engine.load("https://example.com/b.mp3");
      const next = getLastHowl();
      next.fireLoad();
      next.fireEnd();
      next.fireEnd();
      next.fireEnd();
      expect(cb).not.toHaveBeenCalled();
      next.fireEnd();
      await vi.waitFor(() => expect(cb).toHaveBeenCalled());
    });

    it("resolves the clip promise on the first end even while repeating", async () => {
      const engine = new AudioEngine();
      engine.setRepeat(3);
      const promise = engine.playClip("https://example.com/clip.mp3");
      await vi.waitFor(() => {
        getLastHowl().fireLoad();
        getLastHowl().fireEnd();
      });
      // Study UI unblocks after the first listen, audio keeps looping.
      await expect(promise).resolves.toBeUndefined();
      expect(getLastHowl()._playing).toBe(true);
    });
  });

  describe("per-verse repeat and verse stepping (surah mode)", () => {
    const timings: VerseTiming[] = [
      { verseKey: "1:1", start_ms: 0, end_ms: 4000 },
      { verseKey: "1:2", start_ms: 4000, end_ms: 9000 },
      { verseKey: "1:3", start_ms: 9000, end_ms: 15000 },
      { verseKey: "1:4", start_ms: 15000, end_ms: 20000 },
    ];

    async function surahEngine(repeat = 0) {
      const engine = new AudioEngine();
      if (repeat !== 0) engine.setRepeat(repeat);
      await engine.load("https://example.com/surah.mp3");
      getLastHowl().fireLoad();
      engine.setSurahTimings(timings);
      return engine;
    }

    /** Position the mock Howl at `ms` and run the tick the provider drives. */
    function atPosition(engine: AudioEngine, ms: number) {
      getLastHowl()._seekPos = ms / 1000;
      engine.checkVerseChange();
    }

    it("repeats the verse at each crossing before flowing to the next", async () => {
      const engine = await surahEngine(3);
      const changed = vi.fn();
      engine.onVerseChange(changed);
      atPosition(engine, 2000); // inside 1:1
      await vi.waitFor(() => expect(changed).toHaveBeenCalledTimes(1));

      // ×3 budget: the first three crossings from 1:1 into 1:2 rewind to the
      // verse's start instead of moving the selection on.
      for (let i = 0; i < 3; i += 1) {
        atPosition(engine, 4600);
        expect(getLastHowl()._seekPos).toBe(0);
        expect(changed).toHaveBeenCalledTimes(1);
      }
      // Budget exhausted: the fourth crossing is real.
      atPosition(engine, 4600);
      expect(getLastHowl()._seekPos).toBe(4.6);
      await vi.waitFor(() => {
        expect(changed).toHaveBeenCalledTimes(2);
        expect(changed).toHaveBeenLastCalledWith("1:2");
      });
    });

    it("a backward manual seek does not trigger the repeat rewind", async () => {
      const engine = await surahEngine(3);
      const changed = vi.fn();
      engine.onVerseChange(changed);
      atPosition(engine, 10000); // selects 1:3
      atPosition(engine, 2000); // drag back to 1:1: deliberate, not a crossing
      await vi.waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
      expect(getLastHowl()._seekPos).toBe(2);
    });

    it("turning repeats on mid-verse starts repeating that verse", async () => {
      const engine = await surahEngine(0);
      const changed = vi.fn();
      engine.onVerseChange(changed);
      atPosition(engine, 2000);
      await vi.waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
      engine.setRepeat(3); // re-arms the per-verse budget
      atPosition(engine, 4500);
      expect(getLastHowl()._seekPos).toBe(0);
      expect(changed).toHaveBeenCalledTimes(1);
    });

    it("a deliberate seekToVerse restarts the verse's repeat budget", async () => {
      const engine = await surahEngine(1);
      const changed = vi.fn();
      engine.onVerseChange(changed);
      atPosition(engine, 2000);
      await vi.waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
      atPosition(engine, 4600); // intercepted: the verse's one repeat played
      expect(getLastHowl()._seekPos).toBe(0);
      engine.seekToVerse("1:1"); // fresh start → fresh budget
      atPosition(engine, 4600); // intercepted again
      expect(getLastHowl()._seekPos).toBe(0);
      atPosition(engine, 4600); // now the real crossing
      await vi.waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
    });

    it("does not loop the whole surah file on end when per-verse repeat is on", async () => {
      const engine = await surahEngine(3);
      const cb = vi.fn();
      engine.onEnd(cb);
      const howl = getLastHowl();
      howl.fireEnd();
      // Whole-file repeat would replay from 0; per-verse repeats happen at
      // the crossings, so the end falls through to the surah-end callback.
      await vi.waitFor(() => expect(cb).toHaveBeenCalled());
      expect(howl._unloaded).toBe(true);
      expect(howl._playing).toBe(false);
    });

    it("still loops the whole surah file on -1 in surah mode", async () => {
      const engine = await surahEngine(-1);
      const cb = vi.fn();
      engine.onEnd(cb);
      const howl = getLastHowl();
      howl.fireEnd();
      expect(howl._unloaded).toBe(false);
      expect(howl._playing).toBe(true);
      expect(cb).not.toHaveBeenCalled();
    });

    it("sungVerseKey reports the verse at the playhead", async () => {
      const engine = await surahEngine();
      atPosition(engine, 10000);
      expect(engine.sungVerseKey()).toBe("1:3");
      atPosition(engine, 500);
      expect(engine.sungVerseKey()).toBe("1:1");
      // End-of-file region (past every window) still reads as the last verse.
      atPosition(engine, 22000);
      expect(engine.sungVerseKey()).toBe("1:4");
    });

    it("verse helpers are false without surah timings or unknown keys", async () => {
      const rawEngine = new AudioEngine();
      expect(rawEngine.sungVerseKey()).toBe(null); // no timings at all
      expect(rawEngine.seekToVerse("1:2")).toBe(false);
      expect(rawEngine.stepVerse(1)).toBe(false);

      const engine = await surahEngine();
      expect(engine.seekToVerse("9:9")).toBe(false); // key outside this surah
    });

    it("stepVerse jumps relative to the sung verse and clamps at the edges", async () => {
      const engine = await surahEngine();
      atPosition(engine, 10000); // 1:3
      expect(engine.stepVerse(1)).toBe(true);
      expect(getLastHowl()._seekPos).toBe(15); // 1:4 starts at 15000ms
      expect(engine.stepVerse(1)).toBe(false); // already the last verse
      expect(getLastHowl()._seekPos).toBe(15);
      expect(engine.stepVerse(-3)).toBe(true); // clamps to the first verse
      expect(getLastHowl()._seekPos).toBe(0);
      expect(engine.stepVerse(-1)).toBe(false); // already the first verse
    });
  });
});
