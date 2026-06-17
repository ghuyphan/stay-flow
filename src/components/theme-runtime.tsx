"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import type { StoredTheme } from "@/server/repositories/app-repository";

export function ThemeRuntime() {
  const { setTheme } = useTheme();

  useEffect(() => {
    let active = true;
    void fetch("/api/settings/theme")
      .then((response) => response.json())
      .then((theme: StoredTheme) => {
        if (!active) return;
        document.documentElement.style.setProperty("--color-primary", theme.primary);
        document.documentElement.style.setProperty("--color-accent", theme.accent);
        setTheme(theme.mode === "dark" ? "light" : theme.mode);
      });
    return () => {
      active = false;
    };
  }, [setTheme]);

  return null;
}
