"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  GripVertical,
  ImageIcon,
  LayoutGrid,
  Monitor,
  RotateCcw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getLayoutSectionDefinition,
  layoutSectionDefinitions,
  type LayoutSectionId,
} from "@/lib/layout-sections";
import { cn } from "@/lib/utils";
import type { StoredLayoutSection } from "@/server/repositories/app-repository";

const iconBySection: Record<LayoutSectionId, typeof LayoutGrid> = {
  hero: ImageIcon,
  search: LayoutGrid,
  rooms: LayoutGrid,
  trust: LayoutGrid,
  gallery: ImageIcon,
  amenities: LayoutGrid,
  faq: LayoutGrid,
};

function normalizeSections(sections: StoredLayoutSection[]) {
  const seen = new Set<string>();
  const normalized = sections.flatMap((section) => {
    const definition = getLayoutSectionDefinition(section.id);
    if (!definition || seen.has(definition.id)) return [];
    seen.add(definition.id);
    return [{ id: definition.id, name: definition.name, enabled: section.enabled }];
  });

  for (const definition of layoutSectionDefinitions) {
    if (!seen.has(definition.id)) {
      normalized.push({
        id: definition.id,
        name: definition.name,
        enabled: definition.defaultEnabled,
      });
    }
  }

  return normalized;
}

function defaultSections() {
  return layoutSectionDefinitions.map((section) => ({
    id: section.id,
    name: section.name,
    enabled: section.defaultEnabled,
  }));
}

export function LayoutBuilder({ initialSections }: { initialSections: StoredLayoutSection[] }) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [sections, setSections] = useState(() => normalizeSections(initialSections));
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(normalizeSections(initialSections)));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const enabledCount = sections.filter((section) => section.enabled).length;
  const dirty = JSON.stringify(sections) !== savedSnapshot;

  const sectionRows = useMemo(
    () =>
      sections.map((section, index) => {
        const definition = getLayoutSectionDefinition(section.id);
        return { ...section, description: definition?.description ?? "", index };
      }),
    [sections],
  );

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sections.length) return;
    const next = [...sections];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setSections(next);
    setStatus("idle");
  }

  function toggle(id: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section,
      ),
    );
    setStatus("idle");
  }

  async function publish() {
    setStatus("saving");
    const payload = sections.map((section) => {
      const definition = getLayoutSectionDefinition(section.id);
      return {
        id: section.id,
        name: definition?.name ?? section.name,
        enabled: section.enabled,
      };
    });
    const response = await fetch("/api/settings/layout", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const saved = normalizeSections((await response.json()) as StoredLayoutSection[]);
      setSections(saved);
      setSavedSnapshot(JSON.stringify(saved));
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 1800);
      return;
    }
    setStatus("error");
  }

  return (
    <div className="grid min-h-[680px] overflow-hidden rounded-[var(--radius-lg)] bg-card shadow-[var(--shadow-sm)] ring-1 ring-black/[0.035] xl:grid-cols-[360px_1fr]">
      <aside className="bg-card shadow-[0_1px_0_rgb(24_32_29_/_0.05)] xl:shadow-[1px_0_0_rgb(24_32_29_/_0.05)]">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Homepage layout</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Reorder trusted sections. Published changes affect the public homepage.
              </p>
            </div>
            <Badge tone={dirty ? "warning" : "success"}>{dirty ? "Draft" : "Live"}</Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const next = defaultSections();
                setSections(next);
                setStatus("idle");
              }}
            >
              <RotateCcw className="size-4" /> Reset
            </Button>
            <Button size="sm" className="flex-1" onClick={publish} disabled={status === "saving"}>
              {status === "saved" ? <Check className="size-4" /> : null}
              {status === "saving" ? "Saving..." : status === "saved" ? "Published" : "Publish"}
            </Button>
          </div>
          {status === "error" ? <p className="mt-3 text-xs text-destructive">Could not save layout. Check your session and try again.</p> : null}
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span>Sections</span>
            <span>{enabledCount}/{sections.length} visible</span>
          </div>
          <div className="grid gap-2">
            {sectionRows.map(({ id, name, enabled, description, index }) => {
              const Icon = iconBySection[id as LayoutSectionId] ?? LayoutGrid;
              return (
                <div key={id} className={cn("rounded-xl p-3 shadow-[var(--shadow-sm)]", enabled ? "bg-background" : "bg-muted/40 shadow-none")}>
                  <div className="flex items-center gap-2">
                    <GripVertical className="size-4 text-muted-foreground" />
                    <Icon className="size-4 text-primary" />
                    <span className="min-w-0 flex-1 text-sm font-semibold">{name}</span>
                    <button type="button" aria-label={`Move ${name} up`} onClick={() => move(index, -1)} disabled={index === 0} className="disabled:opacity-25"><ArrowUp className="size-3.5" /></button>
                    <button type="button" aria-label={`Move ${name} down`} onClick={() => move(index, 1)} disabled={index === sections.length - 1} className="disabled:opacity-25"><ArrowDown className="size-3.5" /></button>
                    <button
                      type="button"
                      aria-label={`${enabled ? "Hide" : "Show"} ${name}`}
                      onClick={() => toggle(id)}
                      className={cn("relative h-6 w-10 rounded-full transition", enabled ? "bg-primary" : "bg-muted")}
                    >
                      <span className={cn("absolute top-1 size-4 rounded-full bg-white transition", enabled ? "left-5" : "left-1")} />
                    </button>
                  </div>
                  <p className="mt-2 pl-10 text-xs leading-5 text-muted-foreground">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="min-w-0 bg-muted/50">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 shadow-[0_1px_0_rgb(24_32_29_/_0.05)]">
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            {[
              ["desktop", Monitor],
              ["tablet", Tablet],
              ["mobile", Smartphone],
            ].map(([value, Icon]) => {
              const ViewIcon = Icon as typeof Monitor;
              return (
                <button
                  key={value as string}
                  onClick={() => setViewport(value as typeof viewport)}
                  className={cn("grid size-9 place-items-center rounded-lg", viewport === value && "bg-card shadow-sm")}
                  aria-label={`${value} preview`}
                >
                  <ViewIcon className="size-4" />
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <p className="hidden text-xs text-muted-foreground md:block">
              Preview shows draft order. Public site updates after publish.
            </p>
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}><Eye className="size-4" /> Open live</Button>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div
            className={cn(
              "mx-auto min-h-[560px] overflow-hidden rounded-xl bg-white text-[#18201d] shadow-[var(--shadow-md)] transition-all",
              viewport === "desktop" && "max-w-5xl",
              viewport === "tablet" && "max-w-2xl",
              viewport === "mobile" && "max-w-[390px]",
            )}
          >
            {sections.filter((section) => section.enabled).map((section) => <PreviewSection key={section.id} id={section.id as LayoutSectionId} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ id }: { id: LayoutSectionId }) {
  if (id === "hero") {
    return (
      <div className="bg-[linear-gradient(90deg,rgba(10,20,16,.75),rgba(10,20,16,.12)),url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center px-8 py-20 text-white">
        <p className="text-xs font-bold uppercase tracking-wider">District One Studio, Saigon</p>
        <h3 className="mt-3 max-w-xl font-display text-5xl font-semibold">Book a private room by the hour.</h3>
        <button className="mt-6 rounded-xl bg-[#1f6f5f] px-5 py-3 text-sm font-semibold">Explore rooms</button>
      </div>
    );
  }

  if (id === "search") {
    return (
      <div className="bg-[#f8f7f2] p-6">
        <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]">
          <div><p className="text-xs font-semibold">Location</p><p className="mt-1 text-sm text-[#66706c]">District 1 or Thao Dien</p></div>
          <div><p className="text-xs font-semibold">Date</p><p className="mt-1 text-sm text-[#66706c]">Tomorrow</p></div>
          <button className="rounded-xl bg-[#1f6f5f] px-5 py-3 text-sm font-semibold text-white">Search</button>
        </div>
      </div>
    );
  }

  if (id === "rooms") {
    return (
      <div className="p-8">
        <p className="font-display text-3xl font-semibold">Featured stays</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {["City Nap Studio", "Work Break Room"].map((room) => (
            <div key={room} className="rounded-xl bg-white p-5 shadow-sm"><div className="mb-8 h-28 rounded-lg bg-[#e8efe9]" /><p className="font-semibold">{room}</p><p className="mt-1 text-sm text-[#66706c]">From $18 / hour</p></div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "trust") {
    return (
      <div className="grid gap-3 p-6 sm:grid-cols-3">
        {["Exact hours", "Private rooms", "Secure payment"].map((item) => <div key={item} className="rounded-xl bg-[#f8f7f2] p-4 text-sm font-semibold">{item}</div>)}
      </div>
    );
  }

  if (id === "gallery") {
    return (
      <div className="grid h-64 gap-2 p-6 sm:grid-cols-3">
        <div className="rounded-xl bg-[#d9e5df] sm:col-span-2" />
        <div className="grid gap-2"><div className="rounded-xl bg-[#e8efe9]" /><div className="rounded-xl bg-[#cfded5]" /></div>
      </div>
    );
  }

  if (id === "amenities") {
    return (
      <div className="p-8">
        <p className="font-display text-3xl font-semibold">Good for short stays</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Self check-in", "Smart TV", "Fast Wi-Fi", "Fresh towels"].map((item) => <span key={item} className="rounded-full bg-[#e8efe9] px-3 py-1 text-sm">{item}</span>)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <p className="font-display text-3xl font-semibold">Before guests arrive</p>
      <p className="mt-4 text-sm text-[#66706c]">Hourly, overnight, and daily stays · Exact arrival time required.</p>
    </div>
  );
}
