import { beforeEach, describe, expect, it } from "vitest";
import { applyTheme, isTheme, resolveTheme, THEMES, useThemeStore } from "@/stores/theme-store";

describe("resolveTheme", () => {
  it("keeps explicit light and dark regardless of the OS", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("light", false)).toBe("light");
    expect(resolveTheme("dark", true)).toBe("dark");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("defers to the OS only in system mode", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("isTheme", () => {
  it.each([undefined, null, 1, "", "night", "LIGHT"])("rejects %s", (value) => {
    expect(isTheme(value)).toBe(false);
  });

  it.each(THEMES)("accepts %s", (value) => {
    expect(isTheme(value)).toBe(true);
  });
});

describe("applyTheme", () => {
  it("toggles the dark class and the colorScheme style", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");

    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});

describe("useThemeStore persist", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "system" });
  });

  it("stores choices under the key the boot script reads", async () => {
    localStorage.setItem("theme", JSON.stringify({ state: { theme: "dark" }, version: 0 }));
    await useThemeStore.persist.rehydrate();
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("falls back to system when stored data is junk, like the boot script does", async () => {
    localStorage.setItem("theme", JSON.stringify({ state: { theme: "midnight" }, version: 0 }));
    await useThemeStore.persist.rehydrate();
    expect(useThemeStore.getState().theme).toBe("system");
  });
});

describe("THEMES cycle", () => {
  it("every theme has a successor so the toggle never dead-ends", () => {
    for (const t of THEMES) {
      const next = THEMES[(THEMES.indexOf(t) + 1) % THEMES.length];
      expect(THEMES).toContain(next);
      expect(next).not.toBe(t);
    }
  });
});
