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
    <div className="grid min-h-[680px] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-sm)] xl:grid-cols-[360px_1fr]">
      <aside className="bg-card shadow-[0_1px_0_rgb(24_32_51_/_0.05)] xl:shadow-[1px_0_0_rgb(24_32_51_/_0.05)]">
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card p-3">
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
              "mx-auto min-h-[560px] overflow-hidden rounded-[1.75rem] bg-[#fff9ef] text-[#182033] shadow-[var(--shadow-md)] transition-all",
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
      <div className="relative min-h-[430px] overflow-hidden bg-[#fffdf8]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fffdf8_0%,rgba(255,253,248,.95)_35%,rgba(255,253,248,.42)_64%,transparent_100%),url('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85')] bg-cover bg-[64%_center]" />
        <div className="relative flex min-h-[430px] flex-col justify-end px-7 pb-24 pt-10">
          <p className="text-sm font-semibold text-[#89906e]">District One Studio</p>
          <h3 className="mt-3 max-w-[10ch] font-display text-5xl font-semibold leading-[.98]">
            Stay for a few hours or the night
          </h3>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#f49a6c]" />
          <p className="mt-5 max-w-[16rem] text-sm leading-6 text-[#6e6b66]">
            Comfortable stays, on your terms.
          </p>
        </div>
      </div>
    );
  }

  if (id === "search") {
    return (
      <div className="-mt-16 bg-transparent px-5 pb-6">
        <div className="rounded-[1.5rem] border border-[#eadfce] bg-[#fffdf8] p-3 shadow-[0_18px_42px_rgb(111_88_62_/_0.14)]">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {["Place", "Date", "Guests"].map((label, index) => (
              <div key={label} className={`rounded-xl border border-[#eadfce] bg-[#fff9ef] px-3 py-3 ${index === 0 ? "col-span-2 md:col-span-1" : ""}`}>
                <p className="text-xs font-semibold text-[#6e6b66]">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold">{index === 0 ? "Bangalore" : index === 1 ? "May 24" : "2 guests"}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["Short", "One day", "Overnight"].map((item, index) => (
              <div key={item} className={`rounded-xl px-3 py-3 text-center text-sm font-semibold ${index === 0 ? "bg-[#fde5d7]" : "bg-[#f5ecdf]"}`}>
                {item}
              </div>
            ))}
          </div>
          <button className="mt-3 w-full rounded-xl bg-[#f49a6c] px-5 py-3 text-sm font-semibold text-[#1f1720]">Find stays</button>
        </div>
      </div>
    );
  }

  if (id === "rooms") {
    return (
      <div className="px-7 py-8">
        <p className="text-sm font-semibold text-[#89906e]">Ho Chi Minh City</p>
        <p className="mt-1 font-display text-3xl font-semibold">Featured stays</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            ["City Nook", "Short", "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=700&q=85"],
            ["Garden View", "Overnight", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85"],
          ].map(([room, tag, image]) => (
            <div key={room} className="overflow-hidden rounded-xl border border-[#eadfce] bg-[#fffdf8] shadow-sm">
              <div className="relative h-32 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}>
                <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-semibold">{tag}</span>
                <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white text-lg">♡</span>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{room}</p>
                <p className="mt-1 text-xs text-[#6e6b66]">District 1</p>
                <p className="mt-3 text-sm font-semibold">$18 <span className="font-normal text-[#6e6b66]">/ 3h</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "trust") {
    return (
      <div className="grid gap-3 p-6 sm:grid-cols-3">
        {["Self check-in", "Food delivery", "Game console"].map((item) => <div key={item} className="rounded-xl bg-[#f5ecdf] p-4 text-sm font-semibold">{item}</div>)}
      </div>
    );
  }

  if (id === "gallery") {
    return (
      <div className="grid h-64 gap-2 p-6 sm:grid-cols-3">
        <div className="rounded-xl bg-[#e8edda] sm:col-span-2" />
        <div className="grid gap-2"><div className="rounded-xl bg-[#f5ecdf]" /><div className="rounded-xl bg-[#fde5d7]" /></div>
      </div>
    );
  }

  if (id === "amenities") {
    return (
      <div className="p-8">
        <p className="font-display text-3xl font-semibold">Good for short stays</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["No staff", "Food delivery", "Nintendo Switch", "PS5 optional"].map((item) => <span key={item} className="rounded-full bg-[#e8edda] px-3 py-1 text-sm">{item}</span>)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <p className="font-display text-3xl font-semibold">Before guests arrive</p>
      <p className="mt-4 text-sm text-[#66706c]">Self check-in · Food delivery friendly · Console options by room.</p>
    </div>
  );
}
