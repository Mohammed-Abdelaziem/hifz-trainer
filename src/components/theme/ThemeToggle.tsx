"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { THEMES, type Theme, useThemeStore } from "@/stores/theme-store";

const ICONS: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };
const LABELS: Record<Theme, string> = { light: "Light", dark: "Dark", system: "System" };

// Lint-safe "has the client mounted" flag: no setState in an effect. The
// server snapshot says false, the client snapshot says true, so it flips
// during hydration without triggering a cascading render accusation from
// react-hooks/set-state-in-effect.
const NO_SUBSCRIBE = () => () => {};

/**
 * Header control cycling light → dark → system. The full three-way picker
 * lives in Settings; this is the one-click control. Renders "light" until the
 * persisted store rehydrates so SSR markup matches the client's first render.
 */
export function ThemeToggle() {
  const mounted = useSyncExternalStore(NO_SUBSCRIBE, () => true, () => false);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Rehydrate here as well as in ThemeSync: skipHydration defers reads until
  // someone calls it, and a control this visible must not depend on a
  // sibling's mount ordering.
  useEffect(() => {
    void useThemeStore.persist.rehydrate();
  }, []);

  const current = mounted ? theme : "light";
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
  const Icon = ICONS[current];

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      onClick={() => setTheme(next)}
      title={`Theme: ${LABELS[current]} (click for ${LABELS[next]})`}
      aria-label={`Theme: ${LABELS[current]}. Switch to ${LABELS[next]}.`}
      className="inline-flex cursor-pointer items-center rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
