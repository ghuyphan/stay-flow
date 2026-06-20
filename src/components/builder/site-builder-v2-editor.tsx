"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  Copy,
  Eye,
  LayoutGrid,
  Monitor,
  Palette,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Type,
} from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BuilderRenderer } from "@/components/builder/builder-renderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonSkeleton } from "@/components/ui/skeleton";
import { usePreferences } from "@/components/language-provider";
import {
  createBuilderBlock,
  type BuilderV2Block,
  type BuilderV2BlockType,
  type BuilderV2Config,
  type BuilderV2RouteId,
  type BuilderV2State,
} from "@/lib/site-builder-v2";
import type { BuilderText } from "@/lib/site-builder";
import type { Homestay } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { StoredTheme } from "@/server/repositories/app-repository";

type BuilderProps = {
  initialSiteBuilder: BuilderV2State;
  homestays: Homestay[];
};

const viewports = {
  desktop: { label: "Desktop", width: 1440, height: 900 },
  tablet: { label: "Tablet", width: 768, height: 1024 },
  mobile: { label: "Phone", width: 390, height: 844 },
} as const;

const pageLabels: Record<BuilderV2RouteId, string> = {
  home: "Trang chủ",
  homestays: "Danh sách phòng",
  detail: "Chi tiết homestay",
  room: "Chi tiết phòng",
  booking: "Booking redirect",
  bookingPayment: "Thanh toán",
  bookingStatus: "Trạng thái booking",
  support: "Hỗ trợ",
};

const blockLibrary: Array<{ type: BuilderV2BlockType; label: string }> = [
  { type: "Section", label: "Section" },
  { type: "Container", label: "Container" },
  { type: "Grid", label: "Grid" },
  { type: "Stack", label: "Stack" },
  { type: "Hero", label: "Hero" },
  { type: "Text", label: "Text" },
  { type: "Button", label: "Button" },
  { type: "Image", label: "Image" },
  { type: "Gallery", label: "Gallery" },
  { type: "FeatureList", label: "Features" },
  { type: "FAQ", label: "FAQ" },
  { type: "Divider", label: "Divider" },
  { type: "Spacer", label: "Spacer" },
  { type: "CustomLinkList", label: "Links" },
  { type: "SearchWidget", label: "Search widget" },
  { type: "HomestayGrid", label: "Stay grid" },
  { type: "RoomList", label: "Room list" },
  { type: "BookingPanel", label: "Booking panel" },
  { type: "PaymentPanel", label: "Payment panel" },
  { type: "BookingStatus", label: "Booking status" },
];

const themePresets = [
  { name: "Ấm áp", primary: "#F49A6C", accent: "#89906E", background: "#F8F8F4", foreground: "#182033", card: "#FFFFFF", muted: "#EFF0EA", border: "#E1E2DA" },
  { name: "Tối giản", primary: "#2F6B5F", accent: "#C89B5C", background: "#F6F3EE", foreground: "#17201D", card: "#FFFCF7", muted: "#E9E4DC", border: "#D9D1C5" },
  { name: "Trẻ", primary: "#FF7A90", accent: "#6C7DF4", background: "#FFF7FA", foreground: "#231922", card: "#FFFFFF", muted: "#F4E9F0", border: "#EBD7E3" },
] as const;

export function SiteBuilderV2Editor({ initialSiteBuilder, homestays }: BuilderProps) {
  const { resolvedTheme, setSiteTheme } = usePreferences();
  const [config, setConfig] = useState<BuilderV2Config>(initialSiteBuilder.draft);
  const [draftSnapshot, setDraftSnapshot] = useState(() => JSON.stringify(initialSiteBuilder.draft));
  const [activePageId, setActivePageId] = useState<BuilderV2RouteId>("home");
  const [selectedBlockId, setSelectedBlockId] = useState(config.pages.home.blocks[0]?.id ?? "");
  const [viewport, setViewport] = useState<keyof typeof viewports>("desktop");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "publishing" | "published" | "error">("idle");
  const [message, setMessage] = useState("");

  const activePage = config.pages[activePageId];
  const selectedBlock = findBlock(activePage.blocks, selectedBlockId) ?? activePage.blocks[0];
  const dirty = JSON.stringify(config) !== draftSnapshot;
  const previewTheme = useMemo(() => ({ ...config.site.theme, mode: config.site.theme.mode === "system" ? resolvedTheme : config.site.theme.mode }), [config.site.theme, resolvedTheme]);
  const previewStyle = useMemo(() => getPreviewStyle(previewTheme), [previewTheme]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function replaceConfig(next: BuilderV2Config) {
    setConfig({ ...next, updatedAt: new Date().toISOString() });
    setStatus("idle");
    setMessage("");
  }

  function updatePageBlocks(blocks: BuilderV2Block[]) {
    replaceConfig({
      ...config,
      pages: {
        ...config.pages,
        [activePageId]: { ...activePage, blocks },
      },
    });
  }

  function updateSelectedBlock(changes: Partial<BuilderV2Block>) {
    updatePageBlocks(updateBlock(activePage.blocks, selectedBlock?.id ?? "", (block) => ({ ...block, ...changes })));
  }

  function updateSelectedProps(changes: BuilderV2Block["props"]) {
    if (!selectedBlock) return;
    updateSelectedBlock({ props: { ...selectedBlock.props, ...changes } });
  }

  function updateSelectedStyle(changes: BuilderV2Block["style"]) {
    if (!selectedBlock) return;
    updateSelectedBlock({ style: { ...selectedBlock.style, ...changes } });
  }

  function addBlock(type: BuilderV2BlockType) {
    const block = createBuilderBlock(type, defaultBlockOverrides(type));
    updatePageBlocks([...activePage.blocks, block]);
    setSelectedBlockId(block.id);
  }

  function duplicateBlock() {
    if (!selectedBlock) return;
    const duplicate = cloneBlock(selectedBlock);
    updatePageBlocks(insertAfterBlock(activePage.blocks, selectedBlock.id, duplicate));
    setSelectedBlockId(duplicate.id);
  }

  function deleteBlock() {
    if (!selectedBlock || selectedBlock.locked) return;
    const next = removeBlock(activePage.blocks, selectedBlock.id);
    updatePageBlocks(next);
    setSelectedBlockId(next[0]?.id ?? "");
  }

  function moveBlock(direction: -1 | 1) {
    if (!selectedBlock) return;
    updatePageBlocks(moveTopLevelBlock(activePage.blocks, selectedBlock.id, direction));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = activePage.blocks.findIndex((block) => block.id === active.id);
    const newIndex = activePage.blocks.findIndex((block) => block.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    updatePageBlocks(arrayMove(activePage.blocks, oldIndex, newIndex));
  }

  function updateTheme(changes: Partial<StoredTheme>) {
    replaceConfig({ ...config, site: { ...config.site, theme: { ...config.site.theme, ...changes } } });
  }

  async function saveDraft() {
    setStatus("saving");
    const response = await fetch("/api/settings/site-builder/draft", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      setStatus("error");
      setMessage((await response.json().catch(() => null))?.error ?? "Could not save draft.");
      return;
    }
    const saved = await response.json() as BuilderV2Config;
    setConfig(saved);
    setDraftSnapshot(JSON.stringify(saved));
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1600);
  }

  async function publish() {
    setStatus("publishing");
    await fetch("/api/settings/site-builder/draft", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(config),
    });
    const response = await fetch("/api/settings/site-builder/publish", { method: "POST" });
    if (!response.ok) {
      setStatus("error");
      setMessage((await response.json().catch(() => null))?.error ?? "Could not publish.");
      return;
    }
    const state = await response.json() as BuilderV2State;
    setConfig(state.draft);
    setDraftSnapshot(JSON.stringify(state.draft));
    setSiteTheme(state.live.site.theme, { persistMode: true });
    setStatus("published");
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <div className="grid gap-3">
      <div className="builder-toolbar sticky top-3 z-50 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-sm backdrop-blur">
        <select
          value={activePageId}
          onChange={(event) => {
            const pageId = event.target.value as BuilderV2RouteId;
            setActivePageId(pageId);
            setSelectedBlockId(config.pages[pageId].blocks[0]?.id ?? "");
          }}
          className="h-9 max-w-[190px] rounded-full border-0 bg-muted px-3 text-sm font-semibold outline-none"
          aria-label="Chọn trang"
        >
          {(Object.keys(config.pages) as BuilderV2RouteId[]).map((pageId) => <option key={pageId} value={pageId}>{pageLabels[pageId]}</option>)}
        </select>
        <div className="hidden items-center gap-1 rounded-full bg-muted/70 p-1 md:flex">
          {([
            ["desktop", Monitor],
            ["tablet", Tablet],
            ["mobile", Smartphone],
          ] as const).map(([value, Icon]) => (
            <button key={value} type="button" onClick={() => setViewport(value)} className={cn("grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-card", viewport === value && "bg-card text-foreground shadow-sm")} aria-label={`Preview ${value}`}>
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        <span className={cn("ml-auto hidden h-9 items-center rounded-full px-3 text-xs font-semibold md:inline-flex", dirty ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground")}>{dirty ? "Có sửa" : "Đã lưu"}</span>
        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => window.open(activePage.path.replace("[slug]", homestays[0]?.slug ?? "").replace("[roomId]", homestays[0]?.rooms[0]?.id ?? "").replace("[bookingRef]", "demo"), "_blank")}><Eye className="size-4" /></Button>
        {status === "saving" ? <ButtonSkeleton className="min-h-9 w-20 rounded-full" /> : <Button variant="ghost" size="sm" className="rounded-full" onClick={saveDraft}>{status === "saved" ? <Check className="size-4" /> : <Save className="size-4" />} Lưu</Button>}
        {status === "publishing" ? <ButtonSkeleton className="min-h-9 w-24 rounded-full" /> : <Button size="sm" className="rounded-full" onClick={publish}>{status === "published" ? "Đã xuất bản" : "Xuất bản"}</Button>}
      </div>

      {message ? <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">{message}</p> : null}

      <div className="grid gap-3 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <Card className="h-fit rounded-xl p-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><LayoutGrid className="size-4 text-primary" /> Blocks</div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activePage.blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              <div className="mt-3 grid gap-1.5">
                {activePage.blocks.map((block, index) => (
                  <SortableLayerButton
                    key={block.id}
                    block={block}
                    index={index}
                    selected={selectedBlock?.id === block.id}
                    onSelect={() => setSelectedBlockId(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="mt-4">
            <label className="text-xs font-semibold text-muted-foreground">
              Add block
              <select className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm" defaultValue="" onChange={(event) => { if (event.target.value) addBlock(event.target.value as BuilderV2BlockType); event.target.value = ""; }}>
                <option value="">Choose...</option>
                {blockLibrary.map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}
              </select>
            </label>
          </div>
        </Card>

        <PreviewFrame viewport={viewport} style={previewStyle}>
          <PreviewInteractionGuard>
            <BuilderRenderer
              config={{ ...config, site: { ...config.site, theme: previewTheme } }}
              page={activePage}
              context={{
                routeId: activePageId,
                homestays,
                results: homestays,
                homestay: homestays[0],
                room: homestays[0]?.rooms[0],
                builderEditing: {
                  selectedBlockId,
                  onSelectBlock: setSelectedBlockId,
                  onTextChange: (blockId, field, value, language) => {
                    updatePageBlocks(updateBlock(activePage.blocks, blockId, (block) => ({
                      ...block,
                      props: { ...block.props, [field]: { ...(block.props[field] as BuilderText | undefined), [language]: value } },
                    })));
                  },
                },
              }}
            />
          </PreviewInteractionGuard>
        </PreviewFrame>

        <div className="grid h-fit gap-3">
          <BlockInspector block={selectedBlock} onDuplicate={duplicateBlock} onDelete={deleteBlock} onMove={moveBlock} onPropsChange={updateSelectedProps} onStyleChange={updateSelectedStyle} />
          <SiteInspector config={config} onConfigChange={replaceConfig} onThemeChange={updateTheme} />
        </div>
      </div>
    </div>
  );
}

function BlockInspector({
  block,
  onDuplicate,
  onDelete,
  onMove,
  onPropsChange,
  onStyleChange,
}: {
  block?: BuilderV2Block;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onPropsChange: (changes: BuilderV2Block["props"]) => void;
  onStyleChange: (changes: BuilderV2Block["style"]) => void;
}) {
  if (!block) return null;
  return (
    <Card className="rounded-xl p-3">
      <div className="flex items-center gap-2">
        <Palette className="size-4 text-primary" />
        <h2 className="min-w-0 flex-1 truncate font-semibold">{block.name ?? block.type}</h2>
        <button type="button" onClick={onDuplicate} className="grid size-8 place-items-center rounded-full hover:bg-muted" aria-label="Duplicate"><Copy className="size-4" /></button>
        <button type="button" onClick={onDelete} disabled={block.locked} className="grid size-8 place-items-center rounded-full hover:bg-muted disabled:opacity-30" aria-label="Delete"><Trash2 className="size-4" /></button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onMove(-1)}>Up</Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onMove(1)}>Down</Button>
      </div>
      <div className="mt-4 grid gap-3">
        <TextPair label="Eyebrow" value={block.props.eyebrow} onChange={(eyebrow) => onPropsChange({ eyebrow })} />
        <TextPair label="Title" value={block.props.title} onChange={(title) => onPropsChange({ title })} />
        <TextPair label="Subtitle" value={block.props.subtitle} onChange={(subtitle) => onPropsChange({ subtitle })} />
        <TextPair label="Body" value={block.props.body} onChange={(body) => onPropsChange({ body })} multiline />
        <TextInput label="Link" value={block.props.href ?? ""} onChange={(href) => onPropsChange({ href })} />
        <TextInput label="Image URL" value={block.props.image ?? ""} onChange={(image) => onPropsChange({ image })} />
        <Segment label="Align" value={block.style.align ?? "left"} options={["left", "center", "right"]} onChange={(align) => onStyleChange({ align: align as BuilderV2Block["style"]["align"] })} />
        <Segment label="Width" value={block.style.width ?? "container"} options={["container", "narrow", "wide", "full"]} onChange={(width) => onStyleChange({ width: width as BuilderV2Block["style"]["width"] })} />
        <Segment label="Padding" value={block.style.paddingY?.base ?? "md"} options={["none", "sm", "md", "lg", "xl"]} onChange={(value) => onStyleChange({ paddingY: { ...block.style.paddingY, base: value as "none" | "sm" | "md" | "lg" | "xl" } })} />
        <Segment label="Radius" value={block.style.radius ?? "lg"} options={["none", "sm", "md", "lg", "full"]} onChange={(radius) => onStyleChange({ radius: radius as BuilderV2Block["style"]["radius"] })} />
      </div>
    </Card>
  );
}

function SortableLayerButton({
  block,
  index,
  selected,
  onSelect,
}: {
  block: BuilderV2Block;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-muted",
        selected && "bg-secondary text-primary",
        isDragging && "relative z-10 shadow-[var(--shadow-md)]",
      )}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <span className="block truncate">{index + 1}. {block.name ?? block.type}{block.locked ? " · protected" : ""}</span>
    </button>
  );
}

function SiteInspector({ config, onConfigChange, onThemeChange }: { config: BuilderV2Config; onConfigChange: (config: BuilderV2Config) => void; onThemeChange: (theme: Partial<StoredTheme>) => void }) {
  return (
    <Card className="rounded-xl p-3">
      <div className="flex items-center gap-2 font-semibold"><Type className="size-4 text-primary" /> Site</div>
      <div className="mt-3 grid gap-3">
        <TextInput label="Website name" value={config.site.header.siteName} onChange={(siteName) => onConfigChange({ ...config, site: { ...config.site, header: { ...config.site.header, siteName } } })} />
        <TextPair label="Footer tagline" value={config.site.footer.tagline} onChange={(tagline) => onConfigChange({ ...config, site: { ...config.site, footer: { ...config.site.footer, tagline } } })} />
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Theme presets</p>
          <div className="grid grid-cols-3 gap-2">
            {themePresets.map((preset) => <button key={preset.name} type="button" onClick={() => onThemeChange(preset)} className="rounded-lg border border-border p-2 text-xs font-semibold hover:border-primary">{preset.name}</button>)}
          </div>
        </div>
        <Color label="Primary" value={config.site.theme.primary} onChange={(primary) => onThemeChange({ primary })} />
        <Color label="Accent" value={config.site.theme.accent} onChange={(accent) => onThemeChange({ accent })} />
        <Color label="Background" value={config.site.theme.background} onChange={(background) => onThemeChange({ background })} />
      </div>
    </Card>
  );
}

function PreviewFrame({ viewport, style, children }: { viewport: keyof typeof viewports; style: CSSProperties; children: React.ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const styleRef = useRef(style);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const frame = viewports[viewport];

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    setMountNode(null);
    doc.open();
    doc.write("<!doctype html><html><head><base target=\"_parent\" /></head><body><div id=\"preview-root\"></div></body></html>");
    doc.close();
    document.head.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => doc.head.appendChild(node.cloneNode(true)));
    doc.body.style.margin = "0";
    doc.body.style.minHeight = "100%";
    applyPreviewStyle(doc.body, styleRef.current);
    setMountNode(doc.getElementById("preview-root"));
  }, [viewport]);

  useEffect(() => {
    styleRef.current = style;
    const doc = iframeRef.current?.contentDocument;
    if (doc) applyPreviewStyle(doc.body, style);
  }, [style]);

  return (
    <div className={cn("builder-preview-surface mx-auto overflow-hidden bg-background", viewport === "desktop" ? "w-full" : "rounded-lg shadow-[var(--shadow-md)]")} style={{ ...style, width: viewport === "desktop" ? "100%" : frame.width, maxWidth: "100%" }}>
      <iframe ref={iframeRef} title={`${frame.label} preview`} className="block w-full border-0 bg-background" style={{ height: viewport === "desktop" ? "calc(100vh - 9rem)" : frame.height, minHeight: 720 }} />
      {mountNode ? createPortal(children, mountNode) : null}
    </div>
  );
}

function PreviewInteractionGuard({ children }: { children: React.ReactNode }) {
  function elementFromTarget(target: EventTarget | null) {
    if (!target || typeof target !== "object") return null;
    const view = (target as { ownerDocument?: Document }).ownerDocument?.defaultView;
    return view && target instanceof view.HTMLElement ? target as HTMLElement : null;
  }
  function shouldBlock(target: EventTarget | null) {
    const element = elementFromTarget(target);
    if (!element) return false;
    if (element.closest("[data-builder-editable='true']")) return false;
    return Boolean(element.closest("a, button, input, select, textarea, label, summary, [role='button']"));
  }
  function block(event: React.SyntheticEvent) {
    if (!shouldBlock(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
  }
  return <div onClickCapture={block} onPointerDownCapture={block} onSubmitCapture={block} onKeyDownCapture={(event) => { if (["Enter", " "].includes(event.key)) block(event); }}>{children}</div>;
}

function TextPair({ label, value, onChange, multiline = false }: { label: string; value?: BuilderText; onChange: (value: BuilderText) => void; multiline?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <TextInput label="EN" value={value?.en ?? ""} onChange={(en) => onChange({ en, vi: value?.vi ?? en })} multiline={multiline} />
      <TextInput label="VI" value={value?.vi ?? ""} onChange={(vi) => onChange({ en: value?.en ?? vi, vi })} multiline={multiline} />
    </div>
  );
}

function TextInput({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <label className="text-xs font-semibold text-muted-foreground">
      {label}
      {multiline ? (
        <textarea className="mt-1 min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input className="mt-1 min-h-9" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function Segment({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => <button key={option} type="button" onClick={() => onChange(option)} className={cn("rounded-full border border-border px-2.5 py-1 text-xs font-semibold", value === option && "border-primary bg-secondary text-primary")}>{option}</button>)}
      </div>
    </div>
  );
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-semibold text-muted-foreground">{label}<input type="color" className="mt-1 h-9 w-full rounded-lg border border-border bg-background" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function findBlock(blocks: BuilderV2Block[], blockId: string): BuilderV2Block | undefined {
  for (const block of blocks) {
    if (block.id === blockId) return block;
    const child = block.children ? findBlock(block.children, blockId) : undefined;
    if (child) return child;
  }
}

function updateBlock(blocks: BuilderV2Block[], blockId: string, updater: (block: BuilderV2Block) => BuilderV2Block): BuilderV2Block[] {
  return blocks.map((block) => block.id === blockId ? updater(block) : { ...block, children: block.children ? updateBlock(block.children, blockId, updater) : block.children });
}

function removeBlock(blocks: BuilderV2Block[], blockId: string): BuilderV2Block[] {
  return blocks.flatMap((block) => block.id === blockId ? [] : [{ ...block, children: block.children ? removeBlock(block.children, blockId) : block.children }]);
}

function insertAfterBlock(blocks: BuilderV2Block[], blockId: string, nextBlock: BuilderV2Block): BuilderV2Block[] {
  return blocks.flatMap((block) => block.id === blockId ? [block, nextBlock] : [{ ...block, children: block.children ? insertAfterBlock(block.children, blockId, nextBlock) : block.children }]);
}

function moveTopLevelBlock(blocks: BuilderV2Block[], blockId: string, direction: -1 | 1) {
  const index = blocks.findIndex((block) => block.id === blockId);
  if (index < 0) return blocks;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= blocks.length) return blocks;
  const next = [...blocks];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

function cloneBlock(block: BuilderV2Block): BuilderV2Block {
  const duplicate = structuredClone(block);
  duplicate.id = `${block.type}-${Date.now()}`;
  duplicate.locked = false;
  duplicate.name = `${block.name ?? block.type} copy`;
  return duplicate;
}

function defaultBlockOverrides(type: BuilderV2BlockType): Partial<BuilderV2Block> {
  if (type === "Hero") return { props: { title: { en: "New hero", vi: "Hero mới" }, subtitle: { en: "Add your message.", vi: "Thêm nội dung của bạn." } }, style: { paddingY: { base: "lg" } } };
  if (type === "Text") return { props: { title: { en: "New title", vi: "Tiêu đề mới" }, body: { en: "Write something useful here.", vi: "Viết nội dung ở đây." } }, style: { width: "narrow" } };
  if (["SearchWidget", "HomestayGrid", "RoomList", "BookingPanel", "PaymentPanel", "BookingStatus"].includes(type)) return { locked: true };
  return {};
}

function applyPreviewStyle(element: HTMLElement, style: CSSProperties) {
  const inlineStyle = element.style as CSSStyleDeclaration & Record<string, string>;
  Object.entries(style).forEach(([key, value]) => {
    if (value == null) return;
    if (key.startsWith("--")) element.style.setProperty(key, String(value));
    else inlineStyle[key] = String(value);
  });
}

function getPreviewStyle(theme: StoredTheme) {
  const radii = {
    sm: { sm: "0.375rem", md: "0.5rem", lg: "0.75rem" },
    md: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
    lg: { sm: "0.625rem", md: "1rem", lg: "1.5rem" },
  }[theme.radius];
  const density = {
    compact: { section: "2rem", sectionSm: "1.5rem" },
    comfortable: { section: "3rem", sectionSm: "2rem" },
    spacious: { section: "4.5rem", sectionSm: "3rem" },
  }[theme.density];
  return {
    "--radius-sm": radii.sm,
    "--radius-md": radii.md,
    "--radius-lg": radii.lg,
    "--color-primary": theme.primary,
    "--color-accent": theme.accent,
    "--color-background": theme.mode === "dark" ? "#191c22" : theme.background,
    "--color-foreground": theme.mode === "dark" ? "#fff7ed" : theme.foreground,
    "--color-card": theme.mode === "dark" ? "#202431" : theme.card,
    "--color-muted": theme.mode === "dark" ? "#292b35" : theme.muted,
    "--color-border": theme.mode === "dark" ? "#3a3640" : theme.border,
    "--section-y": density.section,
    "--section-y-sm": density.sectionSm,
    backgroundColor: theme.mode === "dark" ? "#191c22" : theme.background,
    color: theme.mode === "dark" ? "#fff7ed" : theme.foreground,
  } as CSSProperties;
}
