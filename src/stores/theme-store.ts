import { create } from "zustand";
import { persist } from "zustand/middleware";

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

/** Runtime guard for values read out of localStorage, which may be junk. */
export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

type ResolvedTheme = "light" | "dark";

/** "light"/"dark" follow the stored choice; "system" defers to the OS. */
export function resolveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return systemPrefersDark ? "dark" : "light";
}

/** Applies a resolved theme to the document root. Idempotent. */
export function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme",
      // The boot script in the root layout reads this key before React loads
      // and must stay in sync with how the boot script validates it.
      onRehydrateStorage: () => (state) => {
        if (state && !isTheme(state.theme)) useThemeStore.setState({ theme: "system" });
      },
      skipHydration: true,
    }
  )
);
