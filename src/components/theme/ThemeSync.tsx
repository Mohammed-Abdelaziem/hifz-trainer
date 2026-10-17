"use client";

import { useEffect } from "react";
import { applyTheme, resolveTheme, useThemeStore } from "@/stores/theme-store";

/**
 * Rehydrates the persisted theme and keeps <html> in sync with it. Mounted
 * once in the root layout's Providers, so system-following keeps working
 * wherever the user navigates. First paint is already themed by the boot
 * script in the root layout; this reconciles React with what the script did
 * and then tracks subsequent changes.
 */
export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    // skipHydration is set on the store (same pattern as the onboarding
    // store), so rehydration is deferred to here on the client.
    void useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(resolveTheme(theme, mq.matches));
    if (theme !== "system") return;
    const onChange = (event: MediaQueryListEvent) => {
      applyTheme(resolveTheme("system", event.matches));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return null;
}
