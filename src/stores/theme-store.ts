import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") {
      return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

export function applyThemeClass(mode: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => {
        set({ theme });
        applyThemeClass(theme);
      },
      toggleTheme: () => {
        const { theme } = get();
        const resolved = resolveTheme(theme);
        get().setTheme(resolved === "dark" ? "light" : "dark");
      },
    }),
    {
      name: "sitio-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeClass(state.theme);
        }
      },
    },
  ),
);
