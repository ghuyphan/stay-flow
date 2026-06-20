"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Eye,
  ImageIcon,
  LayoutGrid,
  Monitor,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Sun,
  Tablet,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HomeClient } from "@/components/public-site/home-client";
import { HomestaysClient } from "@/components/public-site/homestays-client";
import { HomestayDetailClient } from "@/components/public-site/homestay-detail-client";
import { PublicSiteShell } from "@/components/layout/public-site-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonSkeleton } from "@/components/ui/skeleton";
import { usePreferences } from "@/components/language-provider";
import {
  createSectionInstance,
  defaultSiteBuilderConfig,
  getBuilderImages,
  selectableSectionTypes,
  type BuilderFaqItem,
  type BuilderItem,
  type BuilderText,
  type SiteBuilderConfig,
  type SiteBuilderLink,
  type SiteBuilderPageId,
  type SiteBuilderSectionType,
  type SiteBuilderState,
  type SiteSectionInstance,
} from "@/lib/site-builder";
import type { Homestay } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { StoredTheme } from "@/server/repositories/app-repository";

type BuilderProps = {
  initialSiteBuilder: SiteBuilderState;
  homestays: Homestay[];
};

const themePresets = [
  {
    name: "Ấm áp",
    primary: "#F49A6C",
    accent: "#89906E",
    background: "#F8F8F4",
    foreground: "#182033",
    card: "#FFFFFF",
    muted: "#EFF0EA",
    border: "#E1E2DA",
  },
  {
    name: "Tối giản",
    primary: "#2F6B5F",
    accent: "#C89B5C",
    background: "#F6F3EE",
    foreground: "#17201D",
    card: "#FFFCF7",
    muted: "#E9E4DC",
    border: "#D9D1C5",
  },
  {
    name: "Trẻ",
    primary: "#FF7A90",
    accent: "#6C7DF4",
    background: "#FFF7FA",
    foreground: "#231922",
    card: "#FFFFFF",
    muted: "#F4E9F0",
    border: "#EBD7E3",
  },
  {
    name: "Biển nhẹ",
    primary: "#3A8FB7",
    accent: "#F2B66D",
    background: "#F4FAFB",
    foreground: "#142331",
    card: "#FFFFFF",
    muted: "#E4F0F2",
    border: "#D0E1E5",
  },
] as const;

const colorFields = [
  ["primary", "Màu chính"],
  ["accent", "Màu nhấn"],
  ["background", "Nền trang"],
  ["foreground", "Chữ"],
  ["card", "Nền khối"],
  ["muted", "Nền phụ"],
  ["border", "Viền"],
] as const;

const modeCopy = { light: "Sáng", dark: "Tối", system: "Theo máy" } as const;
const radiusCopy = { sm: "Gọn", md: "Mềm", lg: "Bo nhiều" } as const;
const fontCopy = { manrope: "Ấm", inter: "Hiện đại", system: "Hệ thống" } as const;
const densityCopy = { compact: "Gọn", comfortable: "Vừa", spacious: "Thoáng" } as const;
const cardStyleCopy = { flat: "Phẳng", soft: "Mềm", elevated: "Nổi" } as const;
const previewViewports = {
  desktop: { label: "Desktop", width: 1440, height: 900 },
  tablet: { label: "Tablet", width: 768, height: 1024 },
  mobile: { label: "Phone", width: 390, height: 844 },
} as const;

const pageCopy: Record<SiteBuilderPageId, string> = {
  home: "Trang chủ",
  homestays: "Danh sách phòng",
  detail: "Chi tiết phòng",
};

const sectionCopy: Record<SiteBuilderSectionType, string> = {
  hero: "Hero",
  search: "Tìm kiếm",
  featuredStays: "Phòng nổi bật",
  trust: "Điểm tin cậy",
  gallery: "Thư viện ảnh",
  amenities: "Tiện ích",
  faq: "FAQ",
  listingHeader: "Đầu trang",
  listingSearch: "Tìm kiếm",
  resultCount: "Số kết quả",
  resultGrid: "Lưới phòng",
  detailHero: "Hero chi tiết",
  detailAmenities: "Tiện ích",
  detailRooms: "Danh sách phòng",
  detailBooking: "Khung đặt phòng",
};

export function LayoutBuilder({ initialSiteBuilder, homestays }: BuilderProps) {
  const { resolvedTheme, setSiteTheme } = usePreferences();
  const [config, setConfig] = useState<SiteBuilderConfig>(initialSiteBuilder.draft);
  const [, setLiveSnapshot] = useState(() => JSON.stringify(initialSiteBuilder.live));
  const [draftSnapshot, setDraftSnapshot] = useState(() => JSON.stringify(initialSiteBuilder.draft));
  const [activePage, setActivePage] = useState<SiteBuilderPageId>("home");
  const [selectedSectionId, setSelectedSectionId] = useState(initialSiteBuilder.draft.pages.home.sections[0]?.id ?? "");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "publishing" | "published" | "error">("idle");
  const [showStructure, setShowStructure] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

  const images = useMemo(() => getBuilderImages(homestays), [homestays]);
  const sections = config.pages[activePage].sections;
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0];
  const dirtyDraft = JSON.stringify(config) !== draftSnapshot;
  const previewTheme = useMemo(
    () => ({ ...config.theme, mode: config.theme.mode === "system" ? resolvedTheme : config.theme.mode }),
    [config.theme, resolvedTheme],
  );
  const previewConfig = useMemo(() => ({ ...config, theme: previewTheme }), [config, previewTheme]);
  const previewStyle = useMemo(
    () => getPreviewStyle(previewTheme),
    [previewTheme],
  );

  function replaceConfig(next: SiteBuilderConfig) {
    setConfig({ ...next, updatedAt: new Date().toISOString() });
    setStatus("idle");
  }

  function updateTheme(changes: Partial<StoredTheme>) {
    replaceConfig({ ...config, theme: { ...config.theme, ...changes } });
  }

  function updateHeader(changes: Partial<SiteBuilderConfig["header"]>) {
    replaceConfig({ ...config, header: { ...config.header, ...changes } });
  }

  function updateFooter(changes: Partial<SiteBuilderConfig["footer"]>) {
    replaceConfig({ ...config, footer: { ...config.footer, ...changes } });
  }

  function updateSection(sectionId: string, changes: Partial<SiteSectionInstance>) {
    replaceConfig({
      ...config,
      pages: {
        ...config.pages,
        [activePage]: {
          ...config.pages[activePage],
          sections: sections.map((section) => section.id === sectionId ? { ...section, ...changes } : section),
        },
      },
    });
  }

  function updateSectionProps(sectionId: string, changes: SiteSectionInstance["props"]) {
    const section = sections.find((candidate) => candidate.id === sectionId);
    if (!section) return;
    updateSection(sectionId, { props: { ...section.props, ...changes } });
  }

  function updateSectionStyle(sectionId: string, changes: SiteSectionInstance["style"]) {
    const section = sections.find((candidate) => candidate.id === sectionId);
    if (!section) return;
    updateSection(sectionId, { style: { ...section.style, ...changes } });
  }

  function moveSection(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sections.length) return;
    const nextSections = [...sections];
    [nextSections[index], nextSections[nextIndex]] = [nextSections[nextIndex], nextSections[index]];
    replaceConfig({
      ...config,
      pages: { ...config.pages, [activePage]: { ...config.pages[activePage], sections: nextSections } },
    });
  }

  function addSection(type: SiteBuilderSectionType) {
    const section = createSectionInstance(type, `${activePage}-${type}-${Date.now()}`);
    replaceConfig({
      ...config,
      pages: {
        ...config.pages,
        [activePage]: { ...config.pages[activePage], sections: [...sections, section] },
      },
    });
    setSelectedSectionId(section.id);
  }

  function duplicateSection(section: SiteSectionInstance) {
    const duplicate = {
      ...structuredClone(section),
      id: `${section.type}-${Date.now()}`,
      name: `${section.name} copy`,
    };
    replaceConfig({
      ...config,
      pages: {
        ...config.pages,
        [activePage]: { ...config.pages[activePage], sections: [...sections, duplicate] },
      },
    });
    setSelectedSectionId(duplicate.id);
  }

  function deleteSection(sectionId: string) {
    const nextSections = sections.filter((section) => section.id !== sectionId);
    replaceConfig({
      ...config,
      pages: {
        ...config.pages,
        [activePage]: { ...config.pages[activePage], sections: nextSections },
      },
    });
    setSelectedSectionId(nextSections[0]?.id ?? "");
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
      return;
    }
    const saved = (await response.json()) as SiteBuilderConfig;
    setConfig(saved);
    setDraftSnapshot(JSON.stringify(saved));
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1600);
  }

  async function publish() {
    setStatus("publishing");
    const draftResponse = await fetch("/api/settings/site-builder/draft", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!draftResponse.ok) {
      setStatus("error");
      return;
    }
    const publishResponse = await fetch("/api/settings/site-builder/publish", { method: "POST" });
    if (!publishResponse.ok) {
      setStatus("error");
      return;
    }
    const state = (await publishResponse.json()) as SiteBuilderState;
    setConfig(state.draft);
    setDraftSnapshot(JSON.stringify(state.draft));
    setLiveSnapshot(JSON.stringify(state.live));
    setSiteTheme(state.live.theme, { persistMode: true });
    setStatus("published");
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <div className="grid gap-3">
      <div className="builder-toolbar sticky top-3 z-50 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-sm backdrop-blur">
        <div className="flex min-w-0 items-center gap-1 rounded-full bg-muted/70 p-1">
          <select
            value={activePage}
            onChange={(event) => {
              const pageId = event.target.value as SiteBuilderPageId;
              setActivePage(pageId);
              setSelectedSectionId(config.pages[pageId].sections[0]?.id ?? "");
            }}
            className="h-9 max-w-[160px] rounded-full border-0 bg-card px-3 text-sm font-semibold shadow-[var(--shadow-sm)] outline-none"
            aria-label="Chọn trang"
          >
            {(Object.keys(pageCopy) as SiteBuilderPageId[]).map((pageId) => (
              <option key={pageId} value={pageId}>{pageCopy[pageId]}</option>
            ))}
          </select>
          <button
            type="button"
            className={cn("builder-tool-button grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground", showStructure && "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-primary hover:text-primary-foreground")}
            onClick={() => setShowStructure((value) => !value)}
            title="Lớp"
            aria-label="Lớp"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            className={cn("builder-tool-button grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground", showInspector && "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-primary hover:text-primary-foreground")}
            onClick={() => setShowInspector((value) => !value)}
            title="Sửa"
            aria-label="Sửa"
          >
            <Palette className="size-4" />
          </button>
        </div>

        <div className="ml-auto hidden items-center gap-1 rounded-full bg-muted/70 p-1 md:flex">
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
                  className={cn("builder-tool-button grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground", viewport === value && "bg-card text-foreground shadow-sm")}
                  aria-label={`Xem thử ${value}`}
                >
                  <ViewIcon className="size-4" />
                </button>
              );
            })}
        </div>

        <div className="flex items-center gap-1 rounded-full bg-muted/70 p-1">
          <span className={cn("hidden h-9 items-center rounded-full px-3 text-xs font-semibold md:inline-flex", dirtyDraft ? "bg-primary/12 text-primary" : "bg-card text-muted-foreground shadow-[var(--shadow-sm)]")}>
            {dirtyDraft ? "Có sửa" : "Đã lưu"}
          </span>
          <button
            type="button"
            className="builder-tool-button hidden size-9 place-items-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground sm:grid"
            onClick={() => window.open(activePage === "home" ? "/" : activePage === "homestays" ? "/homestays" : `/homestays/${homestays[0]?.slug ?? ""}`, "_blank")}
            title="Mở trang thật"
            aria-label="Mở trang thật"
          >
            <Eye className="size-4" />
          </button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden rounded-full px-3 lg:inline-flex"
              onClick={() => {
                const reset = defaultSiteBuilderConfig();
                setConfig(reset);
                setSelectedSectionId(reset.pages.home.sections[0]?.id ?? "");
                setStatus("idle");
              }}
              title="Đặt lại"
            >
              <RotateCcw className="size-4" /> <span className="hidden xl:inline">Đặt lại</span>
            </Button>
            {status === "saving" ? (
              <ButtonSkeleton className="min-h-9 w-20 rounded-full" />
            ) : (
              <Button variant="ghost" size="sm" className="rounded-full px-3" onClick={saveDraft} title="Lưu nháp">
                {status === "saved" ? <Check className="size-4" /> : <Save className="size-4" />}
                <span className="hidden lg:inline">{status === "saved" ? "Đã lưu" : "Lưu"}</span>
              </Button>
            )}
            {status === "publishing" ? (
              <ButtonSkeleton className="min-h-9 w-24 rounded-full" />
            ) : (
              <Button size="sm" className="rounded-full px-4" onClick={publish}>
                {status === "published" ? <Check className="size-4" /> : null}
                {status === "published" ? "Đã xuất bản" : "Xuất bản"}
              </Button>
            )}
        </div>
        {status === "error" ? <p className="mt-3 text-xs text-destructive">Chưa lưu được. Kiểm tra nội dung rồi thử lại.</p> : null}
      </div>

      <div className="relative min-h-[760px]">
        {showStructure ? (
        <Card className="builder-overlay-left builder-overlay-scroll z-40 content-start rounded-xl p-2.5 shadow-[var(--shadow-md)] lg:fixed lg:left-[calc(var(--admin-sidebar-width,76px)+2rem)] lg:top-44 lg:max-h-[calc(100vh-12rem)] lg:w-[216px] lg:overflow-y-auto lg:bg-card/95 lg:backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Trang</p>
            <button type="button" aria-label="Đóng" onClick={() => setShowStructure(false)} className="grid size-8 place-items-center rounded-full hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-2 grid gap-1">
            {(Object.keys(pageCopy) as SiteBuilderPageId[]).map((pageId) => (
              <button
                key={pageId}
                type="button"
                onClick={() => {
                  setActivePage(pageId);
                  setSelectedSectionId(config.pages[pageId].sections[0]?.id ?? "");
                }}
                className={cn("builder-tool-button rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-muted", activePage === pageId && "bg-secondary text-primary shadow-[var(--shadow-sm)]")}
              >
                {pageCopy[pageId]}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Khối</p>
            <select
              className="h-8 rounded-md border border-border bg-card px-2 text-xs"
              defaultValue=""
              onChange={(event) => {
                if (!event.target.value) return;
                addSection(event.target.value as SiteBuilderSectionType);
                event.target.value = "";
              }}
            >
              <option value="">Thêm</option>
              {selectableSectionTypes(activePage).map((definition) => (
                <option key={definition.type} value={definition.type}>{sectionCopy[definition.type]}</option>
              ))}
            </select>
          </div>
          <div className="mt-2 grid gap-1.5">
            {sections.map((section, index) => (
              <div key={section.id} className={cn("interactive-surface rounded-xl border border-border p-2", selectedSection?.id === section.id && "border-primary/50 bg-secondary")}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSectionId(section.id);
                    setShowInspector(true);
                  }}
                  className="block w-full truncate text-left text-sm font-semibold"
                >
                  {sectionCopy[section.type]}
                </button>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <button type="button" aria-label="Đưa lên" onClick={() => moveSection(index, -1)} disabled={index === 0} className="grid size-6 place-items-center rounded-full hover:bg-background disabled:opacity-25"><ArrowUp className="size-3.5" /></button>
                  <button type="button" aria-label="Đưa xuống" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="grid size-6 place-items-center rounded-full hover:bg-background disabled:opacity-25"><ArrowDown className="size-3.5" /></button>
                  <button
                    type="button"
                    onClick={() => updateSection(section.id, { enabled: !section.enabled })}
                    className={cn("relative ml-auto h-6 w-10 rounded-full transition", section.enabled ? "bg-primary" : "bg-muted")}
                    aria-label={`${section.enabled ? "Ẩn" : "Hiện"} khối`}
                  >
                    <span className={cn("absolute top-1 size-4 rounded-full bg-white transition", section.enabled ? "left-5" : "left-1")} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        ) : null}

        <PreviewDeviceFrame viewport={viewport} style={previewStyle}>
          <PreviewPage
            page={activePage}
            siteConfig={previewConfig}
            homestays={homestays}
            selectedSectionId={selectedSection?.id}
            onSelectSection={(sectionId) => {
              setSelectedSectionId(sectionId);
              setShowInspector(true);
            }}
            onTextChange={(sectionId, field, value, language) => {
              const section = sections.find((candidate) => candidate.id === sectionId);
              const current = section?.props[field];
              if (!current) return;
              updateSectionProps(sectionId, { [field]: { ...current, [language]: value } });
            }}
          />
        </PreviewDeviceFrame>

        {showInspector ? (
        <div className="builder-overlay-right builder-overlay-scroll z-40 mt-4 grid content-start gap-2 lg:fixed lg:right-8 lg:top-44 lg:mt-0 lg:max-h-[calc(100vh-12rem)] lg:w-[276px] lg:overflow-y-auto">
          {selectedSection ? (
            <SectionEditor
              section={selectedSection}
              homestays={homestays}
              images={images}
              onSectionChange={(changes) => updateSection(selectedSection.id, changes)}
              onPropsChange={(changes) => updateSectionProps(selectedSection.id, changes)}
              onStyleChange={(changes) => updateSectionStyle(selectedSection.id, changes)}
              onDuplicate={() => duplicateSection(selectedSection)}
              onDelete={() => deleteSection(selectedSection.id)}
              onClose={() => setShowInspector(false)}
            />
          ) : null}
          <SiteControls
            config={config}
            onHeaderChange={updateHeader}
            onFooterChange={updateFooter}
          />
          <ThemeControls theme={config.theme} onChange={updateTheme} />
        </div>
        ) : null}
      </div>
    </div>
  );
}

function PreviewDeviceFrame({
  viewport,
  style,
  children,
}: {
  viewport: keyof typeof previewViewports;
  style: CSSProperties;
  children: React.ReactNode;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const styleRef = useRef(style);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const frame = previewViewports[viewport];

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) return;

    setMountNode(null);
    doc.open();
    doc.write("<!doctype html><html><head><base target=\"_parent\" /></head><body><div id=\"preview-root\"></div></body></html>");
    doc.close();

    document.head.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
      doc.head.appendChild(node.cloneNode(true));
    });

    doc.body.style.margin = "0";
    doc.body.style.minHeight = "100%";
    applyPreviewStyle(doc.body, styleRef.current);
    setMountNode(doc.getElementById("preview-root"));
  }, [viewport]);

  useEffect(() => {
    styleRef.current = style;
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    applyPreviewStyle(doc.body, style);
  }, [style]);

  return (
    <div
      className={cn(
        "builder-preview-surface mx-auto overflow-hidden bg-background",
        viewport === "desktop" ? "w-full" : "rounded-lg shadow-[var(--shadow-md)]",
      )}
      style={{
        ...style,
        width: viewport === "desktop" ? "100%" : frame.width,
        maxWidth: "100%",
      }}
    >
      <iframe
        ref={iframeRef}
        title={`${frame.label} preview`}
        className="block w-full border-0 bg-background"
        style={{ height: viewport === "desktop" ? "calc(100vh - 9rem)" : frame.height, minHeight: 720 }}
      />
      {mountNode ? createPortal(children, mountNode) : null}
    </div>
  );
}

function applyPreviewStyle(element: HTMLElement, style: CSSProperties) {
  const inlineStyle = element.style as CSSStyleDeclaration & Record<string, string>;

  Object.entries(style).forEach(([key, value]) => {
    if (value == null) return;
    if (key.startsWith("--")) {
      element.style.setProperty(key, String(value));
      return;
    }
    inlineStyle[key] = String(value);
  });
}

function PreviewPage({
  page,
  siteConfig,
  homestays,
  selectedSectionId,
  onSelectSection,
  onTextChange,
}: {
  page: SiteBuilderPageId;
  siteConfig: SiteBuilderConfig;
  homestays: Homestay[];
  selectedSectionId?: string;
  onSelectSection: (sectionId: string) => void;
  onTextChange: (sectionId: string, field: "eyebrow" | "title" | "subtitle", value: string, language: "en" | "vi") => void;
}) {
  function previewElementFromEventTarget(target: EventTarget | null) {
    if (!target || typeof target !== "object") return null;
    const candidate = target as { ownerDocument?: Document };
    const view = candidate.ownerDocument?.defaultView;
    if (!view || !(target instanceof view.HTMLElement)) return null;
    return target as HTMLElement;
  }

  function shouldBlockPreviewInteraction(target: EventTarget | null) {
    const element = previewElementFromEventTarget(target);
    if (!element) return false;
    if (element.closest("[data-builder-editable='true']")) return false;
    return Boolean(element.closest("a, button, input, select, textarea, label, summary, [role='button']"));
  }

  function blockPreviewInteraction(event: React.SyntheticEvent) {
    if (!shouldBlockPreviewInteraction(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  const pageContent =
    page === "home"
      ? (
        <HomeClient
          homestays={homestays}
          siteConfig={siteConfig}
          builderEditing={{ selectedSectionId, onSelectSection, onTextChange }}
        />
      )
      : page === "homestays"
        ? <HomestaysClient results={homestays} siteConfig={siteConfig} />
        : <HomestayDetailClient homestay={homestays[0]} siteConfig={siteConfig} />;

  return (
    <div
      onClickCapture={blockPreviewInteraction}
      onPointerDownCapture={blockPreviewInteraction}
      onSubmitCapture={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyDownCapture={(event) => {
        if (!["Enter", " "].includes(event.key) || !shouldBlockPreviewInteraction(event.target)) return;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <PublicSiteShell siteConfig={siteConfig} showChat={false} stickyHeader={false}>
        {pageContent}
      </PublicSiteShell>
    </div>
  );
}

function SiteControls({
  config,
  onHeaderChange,
  onFooterChange,
}: {
  config: SiteBuilderConfig;
  onHeaderChange: (changes: Partial<SiteBuilderConfig["header"]>) => void;
  onFooterChange: (changes: Partial<SiteBuilderConfig["footer"]>) => void;
}) {
  return (
    <Card className="rounded-lg p-0">
      <details>
        <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Đầu trang / chân trang
        </summary>
        <div className="grid gap-3 border-t border-border p-4">
          <TextInput label="Tên website" value={config.header.siteName} onChange={(siteName) => onHeaderChange({ siteName })} />
          <LinkEditor label="Nút chính" link={config.header.primaryCta} onChange={(primaryCta) => onHeaderChange({ primaryCta })} />
          <div className="grid grid-cols-2 gap-2">
            <ToggleField label="Đổi ngôn ngữ" checked={config.header.showLanguageToggle} onChange={(showLanguageToggle) => onHeaderChange({ showLanguageToggle })} />
            <ToggleField label="Đổi theme" checked={config.header.showThemeToggle} onChange={(showThemeToggle) => onHeaderChange({ showThemeToggle })} />
          </div>
          <LinkListEditor label="Liên kết đầu trang" links={config.header.links} onChange={(links) => onHeaderChange({ links })} />
          <TextPairField label="Mô tả footer" value={config.footer.tagline} onChange={(tagline) => onFooterChange({ tagline })} />
          <TextInput label="Email chân trang" value={config.footer.contactEmail} onChange={(contactEmail) => onFooterChange({ contactEmail })} />
          <LinkListEditor label="Liên kết chân trang" links={config.footer.links} onChange={(links) => onFooterChange({ links })} />
        </div>
      </details>
    </Card>
  );
}

function ThemeControls({ theme, onChange }: { theme: StoredTheme; onChange: (changes: Partial<StoredTheme>) => void }) {
  return (
    <Card className="rounded-lg p-0">
      <details>
        <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Giao diện
        </summary>
        <div className="grid gap-4 border-t border-border p-4">
        <div>
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Palette className="size-4 text-primary" /> Bộ màu
          </span>
          <div className="grid grid-cols-2 gap-2">
            {themePresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onChange(preset)}
                className="rounded-[var(--radius-md)] border border-border bg-background p-3 text-left text-xs font-semibold shadow-[var(--shadow-sm)] transition hover:border-primary/40"
              >
                <span className="mb-2 flex gap-1">
                  <span className="size-5 rounded-full" style={{ background: preset.primary }} />
                  <span className="size-5 rounded-full" style={{ background: preset.accent }} />
                  <span className="size-5 rounded-full border border-border" style={{ background: preset.background }} />
                </span>
                {preset.name}
              </button>
            ))}
          </div>
        </div>
        {colorFields.map(([key, label]) => (
          <ColorField key={key} label={label} value={theme[key]} onChange={(value) => onChange({ [key]: value })} />
        ))}
        <SegmentedField label="Chế độ" value={theme.mode} options={modeCopy} icon={Sun} onChange={(mode) => onChange({ mode })} />
        <SegmentedField label="Font chữ" value={theme.font} options={fontCopy} icon={Type} onChange={(font) => onChange({ font })} />
        <SegmentedField label="Bo góc" value={theme.radius} options={radiusCopy} icon={LayoutGrid} onChange={(radius) => onChange({ radius })} />
        <SegmentedField label="Khoảng cách" value={theme.density} options={densityCopy} icon={LayoutGrid} onChange={(density) => onChange({ density })} />
        <SegmentedField label="Thẻ" value={theme.cardStyle} options={cardStyleCopy} icon={LayoutGrid} onChange={(cardStyle) => onChange({ cardStyle })} />
        </div>
      </details>
    </Card>
  );
}

function SectionEditor({
  section,
  homestays,
  images,
  onSectionChange,
  onPropsChange,
  onStyleChange,
  onDuplicate,
  onDelete,
  onClose,
}: {
  section: SiteSectionInstance;
  homestays: Homestay[];
  images: string[];
  onSectionChange: (changes: Partial<SiteSectionInstance>) => void;
  onPropsChange: (changes: SiteSectionInstance["props"]) => void;
  onStyleChange: (changes: SiteSectionInstance["style"]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const supportsText = ["hero", "featuredStays", "listingHeader", "detailHero", "detailAmenities", "detailRooms", "amenities", "faq"].includes(section.type);
  const supportsImage = ["hero", "detailHero"].includes(section.type);
  const supportsCta = ["hero", "featuredStays"].includes(section.type);
  const supportsSearch = ["search", "listingSearch"].includes(section.type);
  const editsTextInPreview = section.type === "hero";

  return (
    <Card className="rounded-xl bg-card/95 p-3 shadow-[var(--shadow-md)] backdrop-blur">
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", section.enabled ? "bg-primary" : "bg-muted-foreground/40")} />
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold">{sectionCopy[section.type]}</h3>
        <button type="button" aria-label="Đóng" onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 grid gap-2.5">
        <ToggleField label="Hiện" checked={section.enabled} onChange={(enabled) => onSectionChange({ enabled })} />

        {editsTextInPreview ? (
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            Bấm chữ trên preview để sửa.
          </div>
        ) : null}
        {supportsText && !editsTextInPreview && section.props.eyebrow ? <TextPairField label="Dòng nhỏ" value={section.props.eyebrow} onChange={(eyebrow) => onPropsChange({ eyebrow })} /> : null}
        {supportsText && !editsTextInPreview && section.props.title ? <TextPairField label="Tiêu đề" value={section.props.title} onChange={(title) => onPropsChange({ title })} /> : null}
        {supportsText && !editsTextInPreview && section.props.subtitle ? <TextPairField label="Mô tả" value={section.props.subtitle} onChange={(subtitle) => onPropsChange({ subtitle })} multiline /> : null}
        {supportsImage ? <ImagePicker label="Ảnh" value={section.props.image ?? ""} images={images} onChange={(image) => onPropsChange({ image })} /> : null}
        {supportsCta && section.props.primaryCta ? <LinkEditor label="Nút" link={section.props.primaryCta} onChange={(primaryCta) => onPropsChange({ primaryCta })} /> : null}
        {supportsSearch ? <TextInput label="Địa điểm" value={section.props.defaultLocation ?? ""} onChange={(defaultLocation) => onPropsChange({ defaultLocation })} /> : null}
        {section.type === "search" ? (
          <ChecklistField
            label="Kiểu đặt phòng"
            values={section.props.enabledStayTypes ?? []}
            options={[
              ["hourly", "Theo giờ"],
              ["daily", "Theo ngày"],
              ["overnight", "Qua đêm"],
            ]}
            onChange={(enabledStayTypes) => onPropsChange({ enabledStayTypes: enabledStayTypes as Array<"hourly" | "daily" | "overnight"> })}
          />
        ) : null}
        {section.type === "featuredStays" ? (
          <details className="rounded-lg border border-border p-2.5">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">Nguồn</summary>
            <div className="mt-2 grid gap-2">
            <SegmentedField label="Nguồn" value={section.props.source ?? "auto"} options={{ auto: "Tự động", manual: "Tự chọn" }} icon={LayoutGrid} onChange={(source) => onPropsChange({ source })} />
            <TextInput label="Số lượng" type="number" value={String(section.props.itemCount ?? 4)} onChange={(itemCount) => onPropsChange({ itemCount: Number(itemCount) || 1 })} />
            <ChecklistField
              label="Phòng tự chọn"
              values={section.props.homestayIds ?? []}
              options={homestays.map((homestay) => [homestay.id, homestay.name])}
              onChange={(homestayIds) => onPropsChange({ homestayIds })}
            />
            </div>
          </details>
        ) : null}
        {["trust", "amenities"].includes(section.type) ? (
          <details className="rounded-lg border border-border p-2.5">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">Danh sách</summary>
            <div className="mt-2">
              <ItemsEditor items={section.props.items ?? []} onChange={(items) => onPropsChange({ items })} />
            </div>
          </details>
        ) : null}
        {section.type === "gallery" ? (
          <details className="rounded-lg border border-border p-2.5">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">Thư viện</summary>
            <div className="mt-2">
              <ImageListEditor images={section.props.images ?? []} choices={images} onChange={(nextImages) => onPropsChange({ images: nextImages })} />
            </div>
          </details>
        ) : null}
        {section.type === "faq" ? (
          <details className="rounded-lg border border-border p-2.5">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">FAQ</summary>
            <div className="mt-2">
              <FaqEditor faqs={section.props.faqs ?? []} onChange={(faqs) => onPropsChange({ faqs })} />
            </div>
          </details>
        ) : null}

        {["hero", "detailHero", "featuredStays", "resultGrid", "detailRooms", "detailBooking"].includes(section.type) ? (
          <details className="rounded-lg border border-border p-2.5">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">Kiểu</summary>
            <div className="mt-2 grid gap-2">
              {["hero", "detailHero"].includes(section.type) ? (
                <SegmentedField label="Lớp phủ ảnh" value={section.style.overlay ?? "soft"} options={{ none: "Không", soft: "Nhẹ", strong: "Đậm" }} icon={ImageIcon} onChange={(overlay) => onStyleChange({ overlay })} />
              ) : null}
              {["featuredStays", "resultGrid", "detailRooms"].includes(section.type) ? (
                <SegmentedField label="Kiểu thẻ" value={section.style.cardStyle ?? "default"} options={{ default: "Mặc định", compact: "Gọn", editorial: "Ảnh lớn" }} icon={LayoutGrid} onChange={(cardStyle) => onStyleChange({ cardStyle })} />
              ) : null}
              {section.type === "detailBooking" ? (
                <SegmentedField label="Vị trí đặt phòng" value={section.style.bookingPlacement ?? "below"} options={{ below: "Dưới phòng", sticky: "Khung rộng" }} icon={LayoutGrid} onChange={(bookingPlacement) => onStyleChange({ bookingPlacement })} />
              ) : null}
            </div>
          </details>
        ) : null}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onDuplicate}><Copy className="size-4" /> Nhân</Button>
          <Button type="button" variant="outline" size="sm" onClick={onDelete}><Trash2 className="size-4" /> Xóa</Button>
        </div>
      </div>
    </Card>
  );
}

function TextInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="text-[11px] font-semibold text-muted-foreground">
      <span className="mb-1 block">{label}</span>
      <Input className="h-9" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextPairField({ label, value, onChange, multiline = false }: { label: string; value: BuilderText; onChange: (value: BuilderText) => void; multiline?: boolean }) {
  const Field = multiline ? "textarea" : "input";
  return (
    <div className="grid gap-1 text-[11px] font-semibold text-muted-foreground">
      <span>{label}</span>
      <div className="grid gap-1.5">
        <Field className="min-h-9 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground outline-none" value={value.vi} onChange={(event) => onChange({ ...value, vi: event.target.value })} placeholder="VI" />
        <Field className="min-h-9 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground outline-none" value={value.en} onChange={(event) => onChange({ ...value, en: event.target.value })} placeholder="EN" />
      </div>
    </div>
  );
}

function LinkEditor({ label, link, onChange }: { label: string; link: SiteBuilderLink; onChange: (link: SiteBuilderLink) => void }) {
  return (
    <details className="rounded-lg border border-border p-2.5">
      <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">{label}</summary>
      <div className="mt-2 grid gap-2">
      <TextPairField label="Chữ" value={link.label} onChange={(nextLabel) => onChange({ ...link, label: nextLabel })} />
      <TextInput label="Đường dẫn" value={link.href} onChange={(href) => onChange({ ...link, href })} />
      </div>
    </details>
  );
}

function LinkListEditor({ label, links, onChange }: { label: string; links: SiteBuilderLink[]; onChange: (links: SiteBuilderLink[]) => void }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      {links.map((link, index) => (
        <div key={`${link.href}-${index}`} className="grid gap-2 rounded-md border border-border p-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input value={link.label.vi} onChange={(event) => onChange(links.map((item, itemIndex) => itemIndex === index ? { ...item, label: { ...item.label, vi: event.target.value } } : item))} aria-label={`${label} ${index + 1} nhãn tiếng Việt`} />
            <Input value={link.label.en} onChange={(event) => onChange(links.map((item, itemIndex) => itemIndex === index ? { ...item, label: { ...item.label, en: event.target.value } } : item))} aria-label={`${label} ${index + 1} nhãn tiếng Anh`} />
          </div>
          <div className="flex gap-2">
            <Input className="min-w-0 flex-1" value={link.href} onChange={(event) => onChange(links.map((item, itemIndex) => itemIndex === index ? { ...item, href: event.target.value } : item))} aria-label={`${label} ${index + 1} đường dẫn`} />
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(links.filter((_, itemIndex) => itemIndex !== index))} aria-label="Xóa link">
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...links, { label: { en: "New link", vi: "Liên kết mới" }, href: "/" }])}>
        <Plus className="size-4" /> Thêm link
      </Button>
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex h-10 items-center justify-between rounded-lg border border-border px-3 text-left text-sm font-semibold">
      {label}
      <span className={cn("relative h-6 w-10 rounded-full transition", checked ? "bg-primary" : "bg-muted")}>
        <span className={cn("absolute top-1 size-4 rounded-full bg-white transition", checked ? "left-5" : "left-1")} />
      </span>
    </button>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-xs font-semibold text-muted-foreground">
      <span className="mb-1.5 block">{label}</span>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-11 rounded-md bg-card p-1 shadow-[var(--shadow-sm)] ring-1 ring-border" />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function SegmentedField<TValue extends string>({
  label,
  value,
  options,
  icon: Icon,
  onChange,
}: {
  label: string;
  value: TValue;
  options: Record<TValue, string>;
  icon: typeof LayoutGrid;
  onChange: (value: TValue) => void;
}) {
  return (
    <div>
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"><Icon className="size-3.5 text-primary" /> {label}</span>
      <div className="grid grid-cols-2 gap-1.5">
        {(Object.entries(options) as Array<[TValue, string]>).map(([optionValue, copy]) => (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={cn("rounded-lg border border-border bg-background px-2.5 py-2 text-left text-xs font-semibold shadow-[var(--shadow-sm)] transition hover:border-primary/40", value === optionValue && "border-primary/50 bg-secondary")}
          >
            {copy}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChecklistField({ label, values, options, onChange }: { label: string; values: string[]; options: string[][]; onChange: (values: string[]) => void }) {
  return (
    <div className="grid gap-1.5">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      {options.map(([value, labelText]) => (
        <label key={value} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold">
          <input
            type="checkbox"
            checked={values.includes(value)}
            onChange={(event) => onChange(event.target.checked ? [...values, value] : values.filter((item) => item !== value))}
          />
          {labelText}
        </label>
      ))}
    </div>
  );
}

function ImagePicker({ label, value, images, onChange }: { label: string; value: string; images: string[]; onChange: (value: string) => void }) {
  return (
    <label className="text-[11px] font-semibold text-muted-foreground">
      <span className="mb-1 block">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground">
        <option value="">Dùng ảnh mặc định</option>
        {images.map((image) => <option key={image} value={image}>{image}</option>)}
      </select>
    </label>
  );
}

function ImageListEditor({ images, choices, onChange }: { images: string[]; choices: string[]; onChange: (images: string[]) => void }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-muted-foreground">Ảnh thư viện</p>
      {images.map((image, index) => (
        <div key={`${image}-${index}`} className="flex gap-2">
          <select value={image} onChange={(event) => onChange(images.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-xs">
            {choices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
          </select>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="size-4" /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...images, choices[0] ?? ""])}>
        <Plus className="size-4" /> Thêm ảnh
      </Button>
    </div>
  );
}

function ItemsEditor({ items, onChange }: { items: BuilderItem[]; onChange: (items: BuilderItem[]) => void }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-muted-foreground">Danh sách</p>
      {items.map((item, index) => (
        <div key={item.id} className="grid gap-2 rounded-md border border-border p-2">
          <TextPairField label={`Item ${index + 1}`} value={item.title} onChange={(title) => onChange(items.map((candidate) => candidate.id === item.id ? { ...candidate, title } : candidate))} />
          {item.body ? <TextPairField label="Body" value={item.body} onChange={(body) => onChange(items.map((candidate) => candidate.id === item.id ? { ...candidate, body } : candidate))} multiline /> : null}
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((candidate) => candidate.id !== item.id))}><Trash2 className="size-4" /> Xóa</Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { id: `item-${Date.now()}`, icon: "sparkles", title: { en: "New item", vi: "Mục mới" }, body: { en: "", vi: "" } }])}>
        <Plus className="size-4" /> Thêm mục
      </Button>
    </div>
  );
}

function FaqEditor({ faqs, onChange }: { faqs: BuilderFaqItem[]; onChange: (faqs: BuilderFaqItem[]) => void }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-muted-foreground">Câu hỏi thường gặp</p>
      {faqs.map((faq, index) => (
        <div key={faq.id} className="grid gap-2 rounded-md border border-border p-2">
          <TextPairField label={`Câu hỏi ${index + 1}`} value={faq.question} onChange={(question) => onChange(faqs.map((candidate) => candidate.id === faq.id ? { ...candidate, question } : candidate))} />
          <TextPairField label="Trả lời" value={faq.answer} onChange={(answer) => onChange(faqs.map((candidate) => candidate.id === faq.id ? { ...candidate, answer } : candidate))} multiline />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(faqs.filter((candidate) => candidate.id !== faq.id))}><Trash2 className="size-4" /> Xóa</Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...faqs, { id: `faq-${Date.now()}`, question: { en: "New question", vi: "Câu hỏi mới" }, answer: { en: "New answer", vi: "Câu trả lời mới" } }])}>
        <Plus className="size-4" /> Thêm câu hỏi
      </Button>
    </div>
  );
}

function getPreviewStyle(theme: StoredTheme) {
  const radii = {
    sm: { sm: "0.375rem", md: "0.5rem", lg: "0.75rem" },
    md: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
    lg: { sm: "0.625rem", md: "1rem", lg: "1.5rem" },
  }[theme.radius];
  const fonts = {
    manrope: {
      body: '"Avenir Next", "Manrope", "Segoe UI", sans-serif',
      heading: 'Georgia, "Times New Roman", serif',
    },
    inter: {
      body: '"Inter", "Segoe UI", Arial, sans-serif',
      heading: '"Inter", "Segoe UI", Arial, sans-serif',
    },
    system: {
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  }[theme.font];
  const density = {
    compact: { section: "2rem", sectionSm: "1.5rem" },
    comfortable: { section: "3rem", sectionSm: "2rem" },
    spacious: { section: "4.5rem", sectionSm: "3rem" },
  }[theme.density];
  const shadows = {
    flat: { sm: "none", md: "none" },
    soft: { sm: "0 1px 2px rgb(24 32 51 / 0.04)", md: "0 10px 26px rgb(111 88 62 / 0.1)" },
    elevated: { sm: "0 2px 8px rgb(24 32 51 / 0.08)", md: "0 22px 48px rgb(111 88 62 / 0.18)" },
  }[theme.cardStyle];

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
    "--font-body": fonts.body,
    "--font-heading": fonts.heading,
    "--section-y": density.section,
    "--section-y-sm": density.sectionSm,
    "--shadow-sm": shadows.sm,
    "--shadow-md": shadows.md,
    backgroundColor: theme.mode === "dark" ? "#191c22" : theme.background,
    color: theme.mode === "dark" ? "#fff7ed" : theme.foreground,
    fontFamily: "var(--font-body)",
  } as CSSProperties;
}
