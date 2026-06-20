"use client";

import { Moon, Sun } from "lucide-react";
import { usePreferences } from "@/components/language-provider";

export function ThemeToggle() {
  const { resolvedTheme, setThemeMode } = usePreferences();
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="grid size-11 place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-sm)] transition-colors hover:bg-muted"
      onClick={() => setThemeMode(nextTheme)}
    >
      {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
