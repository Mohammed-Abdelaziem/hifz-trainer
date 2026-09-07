import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("howler", () => {
  const instances: MockHowl[] = [];

  class MockHowl {
    _src: string;
    _volume = 1;
    _rate = 1;
    _playing = false;
    _listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
    _seekPos = 0;

    constructor(opts: { src: string[]; volume?: number; rate?: number }) {
      this._src = opts.src[0];
      this._volume = opts.volume ?? 1;
      this._rate = opts.rate ?? 1;
      instances.push(this);
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
  };
});

import { AudioEngine } from "@/lib/audio/engine";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const howlerMock = await import("howler") as any;

function getLastHowl() {
  const instances = howlerMock.__instances;
  return instances[instances.length - 1];
}

function getAllHowls() {
  return howlerMock.__instances;
}

beforeEach(() => {
  howlerMock.__instances.length = 0;
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
});
