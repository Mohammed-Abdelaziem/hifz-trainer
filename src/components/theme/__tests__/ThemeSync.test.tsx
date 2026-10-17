import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ThemeSync } from "@/components/theme/ThemeSync";
import { applyTheme, useThemeStore } from "@/stores/theme-store";

// jsdom does not implement matchMedia at all; give it a minimal stub scoped
// to these tests.
function stubMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
      // Exposed for tests that want to fire an OS change.
      __emitChange: () => listeners.forEach((cb) => cb()),
    }),
  });
}

// The boot script in the root layout does this job pre-React; ThemeSync
// re-establishes it once React mounts and while the user navigates.
describe("ThemeSync", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "system" });
    stubMatchMedia(false);
  });

  it("rehydrates the persisted choice and applies it to <html>", async () => {
    localStorage.setItem("theme", JSON.stringify({ state: { theme: "dark" }, version: 0 }));
    render(<ThemeSync />);

    await vi.waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("resolves system mode to light when the OS prefers light (jsdom default)", async () => {
    render(<ThemeSync />);
    await vi.waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(document.documentElement.style.colorScheme).toBe("light");
    });
  });

  it("removes the dark class when switching from dark to light", async () => {
    applyTheme("dark");
    render(<ThemeSync />);
    useThemeStore.setState({ theme: "light" });
    await vi.waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(document.documentElement.style.colorScheme).toBe("light");
    });
  });
});
