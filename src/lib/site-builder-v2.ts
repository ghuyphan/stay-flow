import { z } from "zod";
import type { StoredLayoutSettings, StoredTheme } from "../server/repositories/app-repository";
import {
  DEFAULT_SITE_THEME,
  configToLegacyLayouts,
  defaultSiteBuilderConfig,
  normalizeSiteBuilderConfig,
  textForLanguage,
  type BuilderFaqItem,
  type BuilderItem,
  type BuilderText,
  type SiteBuilderConfig,
  type SiteBuilderLink,
  type SiteBuilderPageId,
  type SiteBuilderState,
} from "./site-builder";

export type BuilderV2RouteId =
  | "home"
  | "homestays"
  | "detail"
  | "room"
  | "booking"
  | "bookingPayment"
  | "bookingStatus"
  | "support";

export type BuilderV2BlockType =
  | "Section"
  | "Container"
  | "Grid"
  | "Columns"
  | "Stack"
  | "Hero"
  | "Text"
  | "Button"
  | "Image"
  | "Gallery"
  | "FeatureList"
  | "FAQ"
  | "Divider"
  | "Spacer"
  | "CustomLinkList"
  | "SearchWidget"
  | "HomestayGrid"
  | "HomestayCardList"
  | "RoomList"
  | "BookingPanel"
  | "PaymentPanel"
  | "BookingStatus"
  | "AIChatEntry";

export type ResponsiveValue<T> = {
  base?: T;
  tablet?: T;
  desktop?: T;
};

export type BuilderV2Style = {
  layout?: "default" | "centered" | "split" | "fullBleed" | "card" | "compact";
  align?: "left" | "center" | "right";
  columns?: ResponsiveValue<number>;
  gap?: ResponsiveValue<"none" | "sm" | "md" | "lg" | "xl">;
  paddingY?: ResponsiveValue<"none" | "sm" | "md" | "lg" | "xl">;
  paddingX?: ResponsiveValue<"none" | "sm" | "md" | "lg">;
  width?: "container" | "narrow" | "wide" | "full";
  background?: "transparent" | "background" | "card" | "muted" | "primary" | "secondary";
  textTone?: "default" | "muted" | "primary" | "accent" | "inverse";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  border?: boolean;
  shadow?: "none" | "sm" | "md";
  minHeight?: ResponsiveValue<"none" | "sm" | "md" | "lg" | "screen">;
};

export type BuilderV2Binding = {
  source:
    | "static"
    | "homestays"
    | "featuredHomestays"
    | "currentHomestay"
    | "currentRoom"
    | "currentBooking"
    | "search";
  limit?: number;
  ids?: string[];
};

export type BuilderV2Block = {
  id: string;
  type: BuilderV2BlockType;
  name?: string;
  enabled: boolean;
  locked?: boolean;
  props: {
    text?: BuilderText;
    eyebrow?: BuilderText;
    title?: BuilderText;
    subtitle?: BuilderText;
    body?: BuilderText;
    image?: string;
    images?: string[];
    alt?: BuilderText;
    href?: string;
    label?: BuilderText;
    links?: SiteBuilderLink[];
    items?: BuilderItem[];
    faqs?: BuilderFaqItem[];
    defaultLocation?: string;
    enabledStayTypes?: Array<"hourly" | "overnight" | "daily">;
    emptyText?: BuilderText;
    source?: "auto" | "manual";
    showFilters?: boolean;
    showPriceSummary?: boolean;
    height?: "sm" | "md" | "lg";
  };
  style: BuilderV2Style;
  dataBinding?: BuilderV2Binding;
  children?: BuilderV2Block[];
};

export type BuilderV2Page = {
  id: BuilderV2RouteId;
  name: string;
  path: string;
  kind: "core" | "transaction" | "custom";
  blocks: BuilderV2Block[];
  seo?: {
    title?: BuilderText;
    description?: BuilderText;
  };
};

export type BuilderV2Config = {
  version: 2;
  site: {
    theme: StoredTheme;
    header: SiteBuilderConfig["header"];
    footer: SiteBuilderConfig["footer"];
    seo: {
      title: BuilderText;
      description: BuilderText;
    };
  };
  pages: Record<BuilderV2RouteId, BuilderV2Page>;
  customPages: BuilderV2Page[];
  updatedAt: string;
};

export type BuilderV2State = {
  draft: BuilderV2Config;
  live: BuilderV2Config;
};

const textSchema = z.object({ en: z.string().default(""), vi: z.string().default("") });
const linkSchema = z.object({ label: textSchema, href: z.string().default("/") });
const styleSchema = z.object({
  layout: z.enum(["default", "centered", "split", "fullBleed", "card", "compact"]).optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  columns: z.object({ base: z.number().optional(), tablet: z.number().optional(), desktop: z.number().optional() }).optional(),
  gap: z.object({ base: z.enum(["none", "sm", "md", "lg", "xl"]).optional(), tablet: z.enum(["none", "sm", "md", "lg", "xl"]).optional(), desktop: z.enum(["none", "sm", "md", "lg", "xl"]).optional() }).optional(),
  paddingY: z.object({ base: z.enum(["none", "sm", "md", "lg", "xl"]).optional(), tablet: z.enum(["none", "sm", "md", "lg", "xl"]).optional(), desktop: z.enum(["none", "sm", "md", "lg", "xl"]).optional() }).optional(),
  paddingX: z.object({ base: z.enum(["none", "sm", "md", "lg"]).optional(), tablet: z.enum(["none", "sm", "md", "lg"]).optional(), desktop: z.enum(["none", "sm", "md", "lg"]).optional() }).optional(),
  width: z.enum(["container", "narrow", "wide", "full"]).optional(),
  background: z.enum(["transparent", "background", "card", "muted", "primary", "secondary"]).optional(),
  textTone: z.enum(["default", "muted", "primary", "accent", "inverse"]).optional(),
  radius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
  border: z.boolean().optional(),
  shadow: z.enum(["none", "sm", "md"]).optional(),
  minHeight: z.object({ base: z.enum(["none", "sm", "md", "lg", "screen"]).optional(), tablet: z.enum(["none", "sm", "md", "lg", "screen"]).optional(), desktop: z.enum(["none", "sm", "md", "lg", "screen"]).optional() }).optional(),
});

const blockSchema: z.ZodType<BuilderV2Block> = z.lazy(() => z.object({
  id: z.string(),
  type: z.enum([
    "Section",
    "Container",
    "Grid",
    "Columns",
    "Stack",
    "Hero",
    "Text",
    "Button",
    "Image",
    "Gallery",
    "FeatureList",
    "FAQ",
    "Divider",
    "Spacer",
    "CustomLinkList",
    "SearchWidget",
    "HomestayGrid",
    "HomestayCardList",
    "RoomList",
    "BookingPanel",
    "PaymentPanel",
    "BookingStatus",
    "AIChatEntry",
  ]),
  name: z.string().optional(),
  enabled: z.boolean().default(true),
  locked: z.boolean().optional(),
  props: z.object({
    text: textSchema.optional(),
    eyebrow: textSchema.optional(),
    title: textSchema.optional(),
    subtitle: textSchema.optional(),
    body: textSchema.optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    alt: textSchema.optional(),
    href: z.string().optional(),
    label: textSchema.optional(),
    links: z.array(linkSchema).optional(),
    items: z.array(z.any()).optional(),
    faqs: z.array(z.any()).optional(),
    defaultLocation: z.string().optional(),
    enabledStayTypes: z.array(z.enum(["hourly", "overnight", "daily"])).optional(),
    emptyText: textSchema.optional(),
    source: z.enum(["auto", "manual"]).optional(),
    showFilters: z.boolean().optional(),
    showPriceSummary: z.boolean().optional(),
    height: z.enum(["sm", "md", "lg"]).optional(),
  }).passthrough().default({}),
  style: styleSchema.default({}),
  dataBinding: z.object({
    source: z.enum(["static", "homestays", "featuredHomestays", "currentHomestay", "currentRoom", "currentBooking", "search"]),
    limit: z.number().optional(),
    ids: z.array(z.string()).optional(),
  }).optional(),
  children: z.array(blockSchema).optional(),
}));

const pageSchema = z.object({
  id: z.enum(["home", "homestays", "detail", "room", "booking", "bookingPayment", "bookingStatus", "support"]),
  name: z.string(),
  path: z.string(),
  kind: z.enum(["core", "transaction", "custom"]),
  blocks: z.array(blockSchema),
  seo: z.object({ title: textSchema.optional(), description: textSchema.optional() }).optional(),
});

const configSchema = z.object({
  version: z.literal(2),
  site: z.object({
    theme: z.any(),
    header: z.any(),
    footer: z.any(),
    seo: z.object({ title: textSchema, description: textSchema }),
  }),
  pages: z.record(z.enum(["home", "homestays", "detail", "room", "booking", "bookingPayment", "bookingStatus", "support"]), pageSchema),
  customPages: z.array(pageSchema).default([]),
  updatedAt: z.string(),
});

const requiredRouteBlocks: Partial<Record<BuilderV2RouteId, BuilderV2BlockType[]>> = {
  home: ["SearchWidget"],
  homestays: ["HomestayGrid"],
  detail: ["RoomList", "BookingPanel"],
  room: ["BookingPanel"],
  bookingPayment: ["PaymentPanel"],
  bookingStatus: ["BookingStatus"],
};

export function isBuilderV2Config(value: unknown): value is BuilderV2Config {
  return Boolean(value && typeof value === "object" && (value as { version?: unknown }).version === 2);
}

export function textV2(text: BuilderText | undefined, language: "en" | "vi") {
  return textForLanguage(text, language);
}

export function createBuilderBlock(type: BuilderV2BlockType, overrides: Partial<BuilderV2Block> = {}): BuilderV2Block {
  return {
    id: overrides.id ?? `${type}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    name: overrides.name ?? blockLabel(type),
    enabled: overrides.enabled ?? true,
    locked: overrides.locked,
    props: overrides.props ?? {},
    style: overrides.style ?? {},
    dataBinding: overrides.dataBinding,
    children: overrides.children,
  };
}

export function defaultBuilderV2Config(theme: StoredTheme = DEFAULT_SITE_THEME): BuilderV2Config {
  return migrateV1ToV2(defaultSiteBuilderConfig(theme));
}

export function defaultBuilderV2State(theme: StoredTheme = DEFAULT_SITE_THEME): BuilderV2State {
  const live = defaultBuilderV2Config(theme);
  return { live, draft: structuredClone(live) };
}

export function normalizeBuilderV2Config(input: unknown, fallback = defaultBuilderV2Config()): BuilderV2Config {
  const migrated = isProbablyV1Config(input) ? migrateV1ToV2(normalizeSiteBuilderConfig(input as Partial<SiteBuilderConfig>)) : input;
  const parsed = configSchema.safeParse(migrated);
  const base = parsed.success ? parsed.data as BuilderV2Config : fallback;
  const normalized: BuilderV2Config = {
    ...base,
    site: {
      ...fallback.site,
      ...base.site,
      theme: normalizeThemeV2(base.site.theme ?? fallback.site.theme),
      header: normalizeSiteBuilderConfig({ header: base.site.header } as Partial<SiteBuilderConfig>, v2ToV1ShellFallback(fallback)).header,
      footer: normalizeSiteBuilderConfig({ footer: base.site.footer } as Partial<SiteBuilderConfig>, v2ToV1ShellFallback(fallback)).footer,
    },
    pages: normalizePages(base.pages, fallback.pages),
    customPages: Array.isArray(base.customPages) ? base.customPages.map((page) => normalizePage(page, page)).filter(Boolean) as BuilderV2Page[] : [],
    updatedAt: base.updatedAt || new Date().toISOString(),
  };
  return normalized;
}

export function normalizeBuilderV2State(input: unknown, fallbackTheme: StoredTheme = DEFAULT_SITE_THEME): BuilderV2State {
  if (isProbablyV1State(input)) {
    const state = input as Partial<SiteBuilderState>;
    const live = normalizeBuilderV2Config(state.live, defaultBuilderV2Config(fallbackTheme));
    return { live, draft: normalizeBuilderV2Config(state.draft, live) };
  }
  const fallback = defaultBuilderV2State(fallbackTheme);
  const source = input && typeof input === "object" ? input as Partial<BuilderV2State> : {};
  const live = normalizeBuilderV2Config(source.live, fallback.live);
  const draft = normalizeBuilderV2Config(source.draft, live);
  return { live, draft };
}

export function validateBuilderV2ForPublish(config: BuilderV2Config) {
  const issues: string[] = [];
  (Object.entries(requiredRouteBlocks) as Array<[BuilderV2RouteId, BuilderV2BlockType[]]>).forEach(([pageId, types]) => {
    const page = config.pages[pageId];
    types.forEach((type) => {
      if (!page || !pageHasBlock(page, type)) issues.push(`${page?.name ?? pageId} needs a ${blockLabel(type)} block.`);
    });
  });
  return issues;
}

export function configV2ToLegacyLayouts(config: BuilderV2Config): StoredLayoutSettings {
  const fallback = defaultSiteBuilderConfig(config.site.theme);
  return configToLegacyLayouts({
    ...fallback,
    theme: config.site.theme,
    header: config.site.header,
    footer: config.site.footer,
  });
}

export function applyThemeToBuilderV2(state: BuilderV2State, theme: StoredTheme): BuilderV2State {
  const normalizedTheme = normalizeThemeV2(theme);
  return {
    live: { ...state.live, site: { ...state.live.site, theme: normalizedTheme }, updatedAt: new Date().toISOString() },
    draft: { ...state.draft, site: { ...state.draft.site, theme: normalizedTheme }, updatedAt: new Date().toISOString() },
  };
}

export function applyLegacyLayoutsToBuilderV2(state: BuilderV2State, _layouts: StoredLayoutSettings): BuilderV2State {
  void _layouts;
  return state;
}

export function migrateV1ToV2(config: SiteBuilderConfig): BuilderV2Config {
  const now = config.updatedAt || new Date().toISOString();
  return {
    version: 2,
    site: {
      theme: config.theme,
      header: config.header,
      footer: config.footer,
      seo: {
        title: { en: config.header.siteName, vi: config.header.siteName },
        description: config.footer.tagline,
      },
    },
    pages: {
      home: page("home", "Home", "/", "core", config.pages.home.sections.flatMap((section) => section.enabled ? [v1SectionToBlock(section)] : [])),
      homestays: page("homestays", "Stays Listing", "/homestays", "core", config.pages.homestays.sections.flatMap((section) => section.enabled ? [v1SectionToBlock(section)] : [])),
      detail: page("detail", "Stay Detail", "/homestays/[slug]", "core", config.pages.detail.sections.flatMap((section) => section.enabled ? [v1SectionToBlock(section)] : [])),
      room: page("room", "Room Detail", "/homestays/[slug]/rooms/[roomId]", "core", [
        createBuilderBlock("Hero", { props: { title: { en: "Room details", vi: "Chi tiết phòng" } }, dataBinding: { source: "currentRoom" } }),
        createBuilderBlock("BookingPanel", { locked: true, dataBinding: { source: "currentHomestay" } }),
      ]),
      booking: page("booking", "Booking Redirect", "/booking/[bookingRef]", "transaction", [
        createBuilderBlock("Text", { props: { title: { en: "Opening booking", vi: "Đang mở đặt phòng" } }, style: { width: "narrow", paddingY: { base: "lg" } } }),
      ]),
      bookingPayment: page("bookingPayment", "Payment", "/booking/[bookingRef]/payment", "transaction", [
        createBuilderBlock("PaymentPanel", { locked: true, dataBinding: { source: "currentBooking" } }),
      ]),
      bookingStatus: page("bookingStatus", "Booking Status", "/booking/[bookingRef]/status", "transaction", [
        createBuilderBlock("BookingStatus", { locked: true, dataBinding: { source: "currentBooking" } }),
      ]),
      support: page("support", "Support", "/support", "core", [
        createBuilderBlock("Hero", {
          props: {
            eyebrow: { en: "Support", vi: "Hỗ trợ" },
            title: { en: "Need help with a stay?", vi: "Cần hỗ trợ đặt phòng?" },
            subtitle: { en: "Message us and we will help confirm the right room.", vi: "Nhắn tụi mình để chọn đúng phòng phù hợp." },
          },
          style: { layout: "centered", width: "narrow", paddingY: { base: "xl" } },
        }),
        createBuilderBlock("CustomLinkList", { props: { links: config.footer.links } }),
      ]),
    },
    customPages: [],
    updatedAt: now,
  };
}

function v1SectionToBlock(section: SiteBuilderConfig["pages"][SiteBuilderPageId]["sections"][number]): BuilderV2Block {
  switch (section.type) {
    case "hero":
    case "detailHero":
    case "listingHeader":
      return createBuilderBlock("Hero", {
        id: section.id,
        props: section.props,
        style: { layout: section.style.variant === "simple" ? "compact" : "split", paddingY: { base: "lg" }, width: "container" },
        dataBinding: section.type === "detailHero" ? { source: "currentHomestay" } : undefined,
      });
    case "search":
    case "listingSearch":
      return createBuilderBlock("SearchWidget", { id: section.id, props: section.props, locked: true, style: { paddingY: { base: "sm" }, width: "container" } });
    case "featuredStays":
      return createBuilderBlock("HomestayCardList", { id: section.id, props: section.props, dataBinding: { source: "featuredHomestays", limit: section.props.itemCount ?? 4, ids: section.props.homestayIds } });
    case "resultGrid":
      return createBuilderBlock("HomestayGrid", { id: section.id, props: section.props, locked: true, dataBinding: { source: "homestays" } });
    case "detailRooms":
      return createBuilderBlock("RoomList", { id: section.id, props: section.props, locked: true, dataBinding: { source: "currentHomestay" } });
    case "detailBooking":
      return createBuilderBlock("BookingPanel", { id: section.id, props: section.props, locked: true, dataBinding: { source: "currentHomestay" } });
    case "trust":
    case "amenities":
    case "detailAmenities":
      return createBuilderBlock("FeatureList", { id: section.id, props: section.props, dataBinding: section.type === "detailAmenities" ? { source: "currentHomestay" } : undefined });
    case "gallery":
      return createBuilderBlock("Gallery", { id: section.id, props: section.props, dataBinding: { source: "currentHomestay" } });
    case "faq":
      return createBuilderBlock("FAQ", { id: section.id, props: section.props });
    case "resultCount":
      return createBuilderBlock("Text", { id: section.id, props: { body: section.props.body }, dataBinding: { source: "homestays" } });
    default:
      return createBuilderBlock("Section", { id: section.id, props: section.props });
  }
}

function page(id: BuilderV2RouteId, name: string, path: string, kind: BuilderV2Page["kind"], blocks: BuilderV2Block[]): BuilderV2Page {
  return ensureRequiredBlocks({ id, name, path, kind, blocks, seo: { title: { en: name, vi: name } } });
}

function normalizePages(input: Record<BuilderV2RouteId, BuilderV2Page>, fallback: Record<BuilderV2RouteId, BuilderV2Page>) {
  return (Object.keys(fallback) as BuilderV2RouteId[]).reduce((pages, pageId) => {
    pages[pageId] = normalizePage(input?.[pageId], fallback[pageId]) ?? fallback[pageId];
    return pages;
  }, {} as Record<BuilderV2RouteId, BuilderV2Page>);
}

function normalizePage(input: BuilderV2Page | undefined, fallback: BuilderV2Page): BuilderV2Page | undefined {
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return ensureRequiredBlocks(fallback);
  return ensureRequiredBlocks({
    ...fallback,
    ...parsed.data,
    blocks: parsed.data.blocks.map(normalizeBlock),
  });
}

function normalizeBlock(block: BuilderV2Block): BuilderV2Block {
  return {
    ...block,
    enabled: block.enabled ?? true,
    props: block.props ?? {},
    style: block.style ?? {},
    children: block.children?.map(normalizeBlock),
  };
}

function ensureRequiredBlocks(pageConfig: BuilderV2Page): BuilderV2Page {
  const blocks = [...pageConfig.blocks];
  requiredRouteBlocks[pageConfig.id]?.forEach((type) => {
    if (!blocks.some((block) => blockContainsType(block, type))) {
      blocks.push(createBuilderBlock(type, { locked: true, dataBinding: { source: routeBindingSource(type) } }));
    }
  });
  return { ...pageConfig, blocks };
}

function pageHasBlock(pageConfig: BuilderV2Page, type: BuilderV2BlockType) {
  return pageConfig.blocks.some((block) => blockContainsType(block, type));
}

function blockContainsType(block: BuilderV2Block, type: BuilderV2BlockType): boolean {
  return block.enabled !== false && (block.type === type || Boolean(block.children?.some((child) => blockContainsType(child, type))));
}

function routeBindingSource(type: BuilderV2BlockType): BuilderV2Binding["source"] {
  if (type === "HomestayGrid") return "homestays";
  if (type === "PaymentPanel" || type === "BookingStatus") return "currentBooking";
  if (type === "RoomList" || type === "BookingPanel") return "currentHomestay";
  return "static";
}

function isProbablyV1Config(input: unknown) {
  return Boolean(input && typeof input === "object" && (input as { version?: unknown }).version === 1);
}

function isProbablyV1State(input: unknown) {
  if (!input || typeof input !== "object") return false;
  const state = input as { live?: unknown; draft?: unknown };
  return isProbablyV1Config(state.live) || isProbablyV1Config(state.draft);
}

function v2ToV1ShellFallback(config: BuilderV2Config): SiteBuilderConfig {
  return {
    ...defaultSiteBuilderConfig(config.site.theme),
    theme: config.site.theme,
    header: config.site.header,
    footer: config.site.footer,
  };
}

function normalizeThemeV2(theme: Partial<StoredTheme>): StoredTheme {
  return {
    ...DEFAULT_SITE_THEME,
    ...theme,
    mode: theme.mode ?? DEFAULT_SITE_THEME.mode,
    radius: theme.radius ?? DEFAULT_SITE_THEME.radius,
    font: theme.font ?? DEFAULT_SITE_THEME.font,
    density: theme.density ?? DEFAULT_SITE_THEME.density,
    cardStyle: theme.cardStyle ?? DEFAULT_SITE_THEME.cardStyle,
  };
}

function blockLabel(type: BuilderV2BlockType) {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}
