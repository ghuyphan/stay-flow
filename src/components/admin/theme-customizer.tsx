"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StoredTheme } from "@/server/repositories/app-repository";

export function ThemeCustomizer({ initialTheme }: { initialTheme: StoredTheme }) {
  const [theme, setTheme] = useState(initialTheme);
  const [saved, setSaved] = useState(false);

  async function save() {
    const response = await fetch("/api/settings/theme", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(theme),
    });
    if (response.ok) {
      document.documentElement.style.setProperty("--color-primary", theme.primary);
      document.documentElement.style.setProperty("--color-accent", theme.accent);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    }
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[300px_1fr]">
      <div>
        <div className="grid gap-5">
          <label><span className="mb-2 block text-sm font-semibold">Primary</span><div className="flex gap-2"><input type="color" value={theme.primary} onChange={(event) => setTheme({ ...theme, primary: event.target.value })} className="h-11 w-12 rounded-lg bg-card p-1 shadow-[var(--shadow-sm)] ring-1 ring-black/[0.045]" /><Input value={theme.primary} onChange={(event) => setTheme({ ...theme, primary: event.target.value })} /></div></label>
          <label><span className="mb-2 block text-sm font-semibold">Accent</span><div className="flex gap-2"><input type="color" value={theme.accent} onChange={(event) => setTheme({ ...theme, accent: event.target.value })} className="h-11 w-12 rounded-lg bg-card p-1 shadow-[var(--shadow-sm)] ring-1 ring-black/[0.045]" /><Input value={theme.accent} onChange={(event) => setTheme({ ...theme, accent: event.target.value })} /></div></label>
          <div><span className="mb-2 block text-sm font-semibold">Appearance</span><div className="grid grid-cols-3 gap-2">
            {([["light", Sun], ["dark", Moon], ["system", Monitor]] as const).map(([mode, Icon]) => (
              <button key={mode} onClick={() => setTheme({ ...theme, mode })} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl bg-card text-xs font-semibold capitalize shadow-[var(--shadow-sm)] ring-1 transition ${theme.mode === mode ? "bg-secondary text-primary ring-primary/20" : "ring-black/[0.045] hover:bg-muted"}`}><Icon className="size-4" />{mode}</button>
            ))}
          </div></div>
          <Button onClick={save}>{saved ? <><Check className="size-4" /> Saved</> : "Save theme"}</Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#eadfce] bg-[#fff9ef] p-4 text-[#182033] shadow-[var(--shadow-sm)]">
        <div className="overflow-hidden rounded-[1.5rem] bg-[#fffdf8] shadow-lg">
          <div className="relative min-h-[330px] overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#fffdf8_0%,rgba(255,253,248,.95)_36%,rgba(255,253,248,.42)_64%,transparent_100%),url('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85')] bg-cover bg-[64%_center]" />
            <div className="relative p-6">
              <p className="text-sm font-semibold" style={{ color: theme.accent }}>District One Studio</p>
              <h3 className="mt-16 max-w-[10ch] font-display text-5xl font-semibold leading-[0.98]">
                Stay for a few hours or the night
              </h3>
              <div className="mt-4 h-1 w-16 rounded-full" style={{ background: theme.primary }} />
              <p className="mt-5 max-w-[16rem] text-sm leading-6 text-[#6e6b66]">
                Comfortable stays, on your terms.
              </p>
            </div>
          </div>
          <div className="-mt-12 p-4">
            <div className="relative rounded-[1.5rem] border border-[#eadfce] bg-[#fffdf8] p-3 shadow-[0_18px_42px_rgb(111_88_62_/_0.14)]">
              <div className="grid grid-cols-3 gap-2">
                {["Place", "Date", "Guests"].map((item) => (
                  <div key={item} className="rounded-xl border border-[#eadfce] bg-[#fff9ef] px-3 py-3">
                    <p className="text-xs font-semibold text-[#6e6b66]">{item}</p>
                    <p className="mt-1 truncate text-sm font-semibold">{item === "Place" ? "Bangalore" : item === "Date" ? "May 24" : "2 guests"}</p>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full rounded-xl px-5 py-3 text-sm font-semibold text-[#1f1720]" style={{ background: theme.primary }}>
                Find stays
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
