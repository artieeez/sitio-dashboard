import { useEffect } from "react";
import {
  applyThemeClass,
  resolveTheme,
  useThemeStore,
} from "@/stores/theme-store";

/**
 * Keeps `document.documentElement` in sync with the persisted theme and OS preference when mode is `system`.
 */
export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }
    const handler = () => applyThemeClass("system");
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  return null;
}

/** Theme state from the persisted store. `resolvedTheme` is a snapshot; the `dark` class on `html` is the source of truth for styling. */
export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const resolvedTheme = resolveTheme(theme);
  return { theme, setTheme, resolvedTheme };
}
