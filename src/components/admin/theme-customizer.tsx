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
      <div className="overflow-hidden rounded-2xl bg-[#f8f7f2] p-4 text-[#18201d] shadow-[var(--shadow-sm)] ring-1 ring-black/[0.035]">
        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="relative min-h-[300px] bg-[linear-gradient(90deg,rgba(10,20,16,.72),rgba(10,20,16,.08)),url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center p-6 text-white">
            <p className="text-sm font-semibold">District One Studio</p>
            <h3 className="mt-20 max-w-lg font-display text-4xl font-semibold">Saigon, by the hour.</h3>
            <button className="mt-6 rounded-lg px-5 py-3 text-sm font-semibold text-white" style={{ background: theme.primary }}>View rooms</button>
          </div>
          <div className="flex gap-3 p-5">{["Hourly", "Overnight", "Easy check-in"].map((item) => <span key={item} className="text-sm font-medium">{item}</span>)}</div>
        </div>
      </div>
    </div>
  );
}
