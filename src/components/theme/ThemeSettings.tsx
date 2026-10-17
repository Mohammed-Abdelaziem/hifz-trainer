"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { type Theme, useThemeStore } from "@/stores/theme-store";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; label: string; hint: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", hint: "Bright stone palette", icon: Sun },
  { value: "system", label: "System", hint: "Follow your device setting", icon: Monitor },
  { value: "dark", label: "Dark", hint: "Warm dimmed palette", icon: Moon },
];

// Same lint-safe mounted flag as the header toggle.
const NO_SUBSCRIBE = () => () => {};

/** The explicit appearance picker on the Settings page. */
export function ThemeSettings() {
  const mounted = useSyncExternalStore(NO_SUBSCRIBE, () => true, () => false);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    void useThemeStore.persist.rehydrate();
  }, []);

  const current: Theme = mounted ? theme : "system";

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Appearance"
        className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 dark:border-stone-700 dark:bg-stone-800"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={current === value}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              current === value
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-950 dark:text-amber-400"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="mt-3 text-sm text-stone-500 dark:text-stone-400">
        {OPTIONS.find((o) => o.value === current)?.hint}.
      </p>
    </div>
  );
}
