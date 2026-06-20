import type { StoredLayoutSection, StoredLayoutSettings, StoredTheme } from "@/server/repositories/app-repository";
import type { Homestay } from "@/lib/types";

export type SiteBuilderPageId = "home" | "homestays" | "detail";
export type SiteBuilderSectionType =
  | "hero"
  | "search"
  | "featuredStays"
  | "trust"
  | "gallery"
  | "amenities"
  | "faq"
  | "listingHeader"
  | "listingSearch"
  | "resultCount"
  | "resultGrid"
  | "detailHero"
  | "detailAmenities"
  | "detailRooms"
  | "detailBooking";

export type BuilderText = {
  en: string;
  vi: string;
};

export type SiteBuilderLink = {
  label: BuilderText;
  href: string;
};

export type BuilderIconName = "sparkles" | "key" | "utensils" | "gamepad" | "wifi" | "map" | "star";

export type BuilderItem = {
  id: string;
  icon?: BuilderIconName;
  title: BuilderText;
  body?: BuilderText;
};

export type BuilderFaqItem = {
  id: string;
  question: BuilderText;
  answer: BuilderText;
};

export type SiteSectionProps = {
  title?: BuilderText;
  eyebrow?: BuilderText;
  subtitle?: BuilderText;
  body?: BuilderText;
  image?: string;
  primaryCta?: SiteBuilderLink;
  secondaryCta?: SiteBuilderLink;
  defaultLocation?: string;
  enabledStayTypes?: Array<"hourly" | "overnight" | "daily">;
  source?: "auto" | "manual";
  homestayIds?: string[];
  itemCount?: number;
  items?: BuilderItem[];
  images?: string[];
  faqs?: BuilderFaqItem[];
  emptyText?: BuilderText;
};

export type SiteSectionStyle = {
  variant?: string;
  overlay?: "none" | "soft" | "strong";
  cardStyle?: "default" | "compact" | "editorial";
  grid?: "mosaic" | "cards" | "strip";
  bookingPlacement?: "below" | "sticky";
};

export type SiteSectionInstance = {
  id: string;
  type: SiteBuilderSectionType;
  name: string;
  enabled: boolean;
  props: SiteSectionProps;
  style: SiteSectionStyle;
};

export type SitePageConfig = {
  id: SiteBuilderPageId;
  name: string;
  sections: SiteSectionInstance[];
};

export type SiteHeaderConfig = {
  siteName: string;
  logoText: string;
  links: SiteBuilderLink[];
  primaryCta: SiteBuilderLink;
  showLanguageToggle: boolean;
  showThemeToggle: boolean;
};

export type SiteFooterConfig = {
  tagline: BuilderText;
  links: SiteBuilderLink[];
  contactEmail: string;
};

export type SiteBuilderConfig = {
  version: 1;
  theme: StoredTheme;
  header: SiteHeaderConfig;
  footer: SiteFooterConfig;
  pages: Record<SiteBuilderPageId, SitePageConfig>;
  updatedAt: string;
};

export type SiteBuilderState = {
  draft: SiteBuilderConfig;
  live: SiteBuilderConfig;
};

export type SectionDefinition = {
  type: SiteBuilderSectionType;
  name: string;
  description: string;
  pageIds: SiteBuilderPageId[];
  defaultProps: SiteSectionProps;
  defaultStyle: SiteSectionStyle;
};

export const DEFAULT_SITE_THEME: StoredTheme = {
  primary: "#F49A6C",
  accent: "#89906E",
  background: "#F8F8F4",
  foreground: "#182033",
  card: "#FFFFFF",
  muted: "#EFF0EA",
  border: "#E1E2DA",
  mode: "light",
  radius: "lg",
  font: "manrope",
  density: "comfortable",
  cardStyle: "soft",
};

export const sitePageLabels: Record<SiteBuilderPageId, { name: string; description: string }> = {
  home: {
    name: "Home",
    description: "Landing page, search, featured stays, trust, gallery, FAQ.",
  },
  homestays: {
    name: "Stays Listing",
    description: "Browse/search page with result count and card grid.",
  },
  detail: {
    name: "Stay Detail",
    description: "Homestay hero, amenities, rooms, and booking panel.",
  },
};

export const sectionDefinitions: Record<SiteBuilderSectionType, SectionDefinition> = {
  hero: {
    type: "hero",
    name: "Hero",
    description: "Top image, headline, supporting copy, and call to action.",
    pageIds: ["home"],
    defaultProps: {
      eyebrow: { en: "District 1, Ho Chi Minh City", vi: "Quận 1, TP. Hồ Chí Minh" },
      title: { en: "Stay for a few hours or the night", vi: "Trốn vài tiếng hay ngủ qua đêm" },
      subtitle: { en: "Private rooms. Few hours or overnight.", vi: "Phòng riêng tư, đặt theo giờ hoặc qua đêm." },
      primaryCta: { label: { en: "Find stays", vi: "Tìm phòng" }, href: "/homestays" },
    },
    defaultStyle: { variant: "image-overlay", overlay: "soft" },
  },
  search: {
    type: "search",
    name: "Search",
    description: "Booking-led search module with default location and stay types.",
    pageIds: ["home"],
    defaultProps: {
      defaultLocation: "District 1",
      enabledStayTypes: ["hourly", "daily", "overnight"],
    },
    defaultStyle: { variant: "full" },
  },
  featuredStays: {
    type: "featuredStays",
    name: "Featured stays",
    description: "Automatic or manually selected public stay cards.",
    pageIds: ["home"],
    defaultProps: {
      eyebrow: { en: "Ho Chi Minh City", vi: "Sài Gòn" },
      title: { en: "Featured stays", vi: "Phòng nổi bật" },
      primaryCta: { label: { en: "View all", vi: "Xem tất cả" }, href: "/homestays" },
      source: "auto",
      itemCount: 4,
      homestayIds: [],
    },
    defaultStyle: { cardStyle: "default" },
  },
  trust: {
    type: "trust",
    name: "Trust points",
    description: "Small benefit cards for guest confidence.",
    pageIds: ["home"],
    defaultProps: {
      items: [
        {
          id: "self-check-in",
          icon: "key",
          title: { en: "Self check-in", vi: "Tự check-in" },
          body: { en: "Arrive and walk in.", vi: "Đến là vào phòng." },
        },
        {
          id: "food-friendly",
          icon: "utensils",
          title: { en: "Food-friendly", vi: "Thoải mái gọi món" },
          body: { en: "Order to the room.", vi: "Giao đồ ăn tận phòng." },
        },
        {
          id: "game-ready",
          icon: "gamepad",
          title: { en: "Game-ready", vi: "Có máy game" },
          body: { en: "Switch, PS4, or PS5.", vi: "Switch, PS4 hoặc PS5." },
        },
      ],
    },
    defaultStyle: { variant: "cards" },
  },
  gallery: {
    type: "gallery",
    name: "Gallery",
    description: "Editable image strip or mosaic.",
    pageIds: ["home"],
    defaultProps: { images: [] },
    defaultStyle: { grid: "mosaic" },
  },
  amenities: {
    type: "amenities",
    name: "Amenities",
    description: "Editable list of amenities or perks.",
    pageIds: ["home"],
    defaultProps: {
      title: { en: "Perks", vi: "Tiện ích" },
      items: [
        { id: "wifi", icon: "wifi", title: { en: "Fast Wi-Fi", vi: "Wi-Fi nhanh" } },
        { id: "delivery", icon: "utensils", title: { en: "Food delivery", vi: "Giao đồ ăn" } },
        { id: "private", icon: "sparkles", title: { en: "Private stay", vi: "Riêng tư" } },
      ],
    },
    defaultStyle: { variant: "pills" },
  },
  faq: {
    type: "faq",
    name: "FAQ",
    description: "Questions and answers shown on the homepage.",
    pageIds: ["home"],
    defaultProps: {
      title: { en: "Before guests arrive", vi: "Trước khi khách đến" },
      faqs: [
        {
          id: "hourly",
          question: { en: "Can guests book only a few hours?", vi: "Có thể đặt vài tiếng không?" },
          answer: {
            en: "Yes. Hourly windows are priced separately from overnight and daily stays.",
            vi: "Có. Khung giờ ngắn được tính riêng với qua đêm và nguyên ngày.",
          },
        },
        {
          id: "availability",
          question: { en: "When is availability checked?", vi: "Khi nào kiểm tra phòng trống?" },
          answer: {
            en: "The server checks exact check-in and check-out times before creating a booking.",
            vi: "Hệ thống kiểm tra giờ nhận và trả phòng trước khi tạo booking.",
          },
        },
      ],
    },
    defaultStyle: { variant: "two-column" },
  },
  listingHeader: {
    type: "listingHeader",
    name: "Listing header",
    description: "Title and filter action for the listing page.",
    pageIds: ["homestays"],
    defaultProps: {
      eyebrow: { en: "Explore", vi: "Lướt xem" },
      title: { en: "Find your kind of stay", vi: "Kiếm chỗ staycation hợp gu" },
    },
    defaultStyle: { variant: "simple" },
  },
  listingSearch: {
    type: "listingSearch",
    name: "Listing search",
    description: "Compact search bar on the listing page.",
    pageIds: ["homestays"],
    defaultProps: { defaultLocation: "District 1" },
    defaultStyle: { variant: "compact" },
  },
  resultCount: {
    type: "resultCount",
    name: "Result count",
    description: "Count of filtered stays.",
    pageIds: ["homestays"],
    defaultProps: { body: { en: "stays", vi: "homestay xịn xò" } },
    defaultStyle: {},
  },
  resultGrid: {
    type: "resultGrid",
    name: "Result grid",
    description: "Grid of stay cards.",
    pageIds: ["homestays"],
    defaultProps: {
      emptyText: { en: "No stays match those filters.", vi: "Không có phòng phù hợp bộ lọc." },
    },
    defaultStyle: { cardStyle: "default" },
  },
  detailHero: {
    type: "detailHero",
    name: "Detail hero",
    description: "Large stay image and key details.",
    pageIds: ["detail"],
    defaultProps: {},
    defaultStyle: { variant: "image-overlay", overlay: "soft" },
  },
  detailAmenities: {
    type: "detailAmenities",
    name: "Detail amenities",
    description: "Amenities shown under the detail hero.",
    pageIds: ["detail"],
    defaultProps: {
      title: { en: "What this place offers", vi: "Tiện ích nổi bật" },
    },
    defaultStyle: { variant: "inline" },
  },
  detailRooms: {
    type: "detailRooms",
    name: "Detail rooms",
    description: "Available room cards for a homestay.",
    pageIds: ["detail"],
    defaultProps: {
      title: { en: "Rooms available for your stay", vi: "Mấy phòng còn trống nè" },
    },
    defaultStyle: { cardStyle: "default" },
  },
  detailBooking: {
    type: "detailBooking",
    name: "Booking panel",
    description: "Date, time, guest, and reservation panel.",
    pageIds: ["detail"],
    defaultProps: {},
    defaultStyle: { bookingPlacement: "below" },
  },
};

const defaultPageSections: Record<SiteBuilderPageId, SiteBuilderSectionType[]> = {
  home: ["hero", "search", "featuredStays", "trust", "gallery", "amenities", "faq"],
  homestays: ["listingHeader", "listingSearch", "resultCount", "resultGrid"],
  detail: ["detailHero", "detailAmenities", "detailRooms", "detailBooking"],
};

const legacySectionMap: Record<string, SiteBuilderSectionType> = {
  hero: "hero",
  search: "search",
  rooms: "featuredStays",
  trust: "trust",
  gallery: "gallery",
  amenities: "amenities",
  faq: "faq",
  listingHeader: "listingHeader",
  listingSearch: "listingSearch",
  resultCount: "resultCount",
  resultGrid: "resultGrid",
  detailHero: "detailHero",
  detailAmenities: "detailAmenities",
  detailRooms: "detailRooms",
  detailBooking: "detailBooking",
};

export function textForLanguage(text: BuilderText | undefined, language: "en" | "vi") {
  if (!text) return "";
  return language === "vi" ? text.vi || text.en : text.en || text.vi;
}

export function createSectionInstance(type: SiteBuilderSectionType, id = `${type}-${Math.random().toString(36).slice(2, 9)}`): SiteSectionInstance {
  const definition = sectionDefinitions[type];
  return {
    id,
    type,
    name: definition.name,
    enabled: true,
    props: structuredClone(definition.defaultProps),
    style: structuredClone(definition.defaultStyle),
  };
}

export function defaultSiteBuilderConfig(theme: StoredTheme = DEFAULT_SITE_THEME): SiteBuilderConfig {
  const now = new Date().toISOString();
  return {
    version: 1,
    theme: normalizeSiteTheme(theme),
    header: {
      siteName: "StayFlow",
      logoText: "SF",
      links: [
        { label: { en: "Stays", vi: "Phòng" }, href: "/homestays" },
        { label: { en: "For hosts", vi: "Chủ nhà" }, href: "/admin" },
      ],
      primaryCta: { label: { en: "Book now", vi: "Đặt phòng" }, href: "/homestays" },
      showLanguageToggle: true,
      showThemeToggle: true,
    },
    footer: {
      tagline: { en: "Private short stays in the city.", vi: "Không gian riêng tư giữa thành phố." },
      links: [
        { label: { en: "Stays", vi: "Phòng" }, href: "/homestays" },
        { label: { en: "Support", vi: "Hỗ trợ" }, href: "/support" },
        { label: { en: "Admin", vi: "Quản trị" }, href: "/admin" },
      ],
      contactEmail: "hello@stayflow.local",
    },
    pages: {
      home: createDefaultPage("home"),
      homestays: createDefaultPage("homestays"),
      detail: createDefaultPage("detail"),
    },
    updatedAt: now,
  };
}

export function defaultSiteBuilderState(theme: StoredTheme = DEFAULT_SITE_THEME): SiteBuilderState {
  const live = defaultSiteBuilderConfig(theme);
  return {
    draft: structuredClone(live),
    live,
  };
}

export function createDefaultPage(pageId: SiteBuilderPageId): SitePageConfig {
  return {
    id: pageId,
    name: sitePageLabels[pageId].name,
    sections: defaultPageSections[pageId].map((type) => createSectionInstance(type, `${pageId}-${type}`)),
  };
}

export function normalizeSiteBuilderState(
  input: Partial<SiteBuilderState> | undefined,
  fallbackTheme: StoredTheme,
  legacyLayouts?: Partial<StoredLayoutSettings>,
): SiteBuilderState {
  const fallback = defaultSiteBuilderState(fallbackTheme);
  const live = normalizeSiteBuilderConfig(input?.live, fallback.live, legacyLayouts);
  const draft = normalizeSiteBuilderConfig(input?.draft, live, legacyLayouts);
  return { draft, live };
}

export function normalizeSiteBuilderConfig(
  input: Partial<SiteBuilderConfig> | undefined,
  fallback = defaultSiteBuilderConfig(),
  legacyLayouts?: Partial<StoredLayoutSettings>,
): SiteBuilderConfig {
  const pages = {
    home: normalizePageConfig("home", input?.pages?.home, fallback.pages.home, legacyLayouts?.home),
    homestays: normalizePageConfig("homestays", input?.pages?.homestays, fallback.pages.homestays, legacyLayouts?.homestays),
    detail: normalizePageConfig("detail", input?.pages?.detail, fallback.pages.detail, legacyLayouts?.detail),
  };

  return {
    version: 1,
    theme: normalizeSiteTheme(input?.theme ?? fallback.theme),
    header: normalizeHeader(input?.header, fallback.header),
    footer: normalizeFooter(input?.footer, fallback.footer),
    pages,
    updatedAt: input?.updatedAt ?? fallback.updatedAt ?? new Date().toISOString(),
  };
}

export function configToLegacyLayouts(config: SiteBuilderConfig): StoredLayoutSettings {
  return {
    home: config.pages.home.sections.map((section) => ({
      id: section.type === "featuredStays" ? "rooms" : section.type,
      name: section.name,
      enabled: section.enabled,
    })),
    homestays: config.pages.homestays.sections.map(toLegacySection),
    detail: config.pages.detail.sections.map(toLegacySection),
  };
}

export function applyThemeToSiteBuilder(state: SiteBuilderState, theme: StoredTheme): SiteBuilderState {
  const normalizedTheme = normalizeSiteTheme(theme);
  return {
    draft: { ...state.draft, theme: normalizedTheme, updatedAt: new Date().toISOString() },
    live: { ...state.live, theme: normalizedTheme, updatedAt: new Date().toISOString() },
  };
}

export function applyLegacyLayoutsToSiteBuilder(state: SiteBuilderState, layouts: StoredLayoutSettings): SiteBuilderState {
  const live = normalizeSiteBuilderConfig({ ...state.live, pages: legacyLayoutsToPages(layouts, state.live) }, state.live);
  const draft = normalizeSiteBuilderConfig({ ...state.draft, pages: legacyLayoutsToPages(layouts, state.draft) }, live);
  return {
    draft: { ...draft, updatedAt: new Date().toISOString() },
    live: { ...live, updatedAt: new Date().toISOString() },
  };
}

export function selectableSectionTypes(pageId: SiteBuilderPageId) {
  return Object.values(sectionDefinitions).filter((section) => section.pageIds.includes(pageId));
}

export function getBuilderImages(homestays: Homestay[]) {
  return Array.from(
    new Set(
      homestays.flatMap((homestay) => [
        homestay.image,
        ...homestay.gallery,
        ...homestay.rooms.flatMap((room) => [room.image, ...(room.gallery ?? [])]),
      ]),
    ),
  ).filter(Boolean);
}

function normalizePageConfig(
  pageId: SiteBuilderPageId,
  input: Partial<SitePageConfig> | undefined,
  fallback: SitePageConfig,
  legacyLayout?: StoredLayoutSection[],
): SitePageConfig {
  const sourceSections = input?.sections?.length
    ? input.sections
    : legacyLayout?.length
      ? legacyLayout.flatMap((section) => legacySectionToInstance(pageId, section))
      : fallback.sections;
  const allowed = new Set(selectableSectionTypes(pageId).map((definition) => definition.type));
  const seen = new Set<string>();
  const sections = sourceSections.flatMap((section) => {
    if (!allowed.has(section.type) || seen.has(section.id)) return [];
    seen.add(section.id);
    return [normalizeSection(section)];
  });
  for (const type of defaultPageSections[pageId]) {
    if (!sections.some((section) => section.type === type)) {
      sections.push(createSectionInstance(type, `${pageId}-${type}`));
    }
  }
  return {
    id: pageId,
    name: input?.name || fallback.name || sitePageLabels[pageId].name,
    sections,
  };
}

function normalizeSection(section: Partial<SiteSectionInstance> & { type: SiteBuilderSectionType }): SiteSectionInstance {
  const definition = sectionDefinitions[section.type];
  return {
    id: section.id || `${section.type}-${Math.random().toString(36).slice(2, 9)}`,
    type: section.type,
    name: section.name || definition.name,
    enabled: section.enabled ?? true,
    props: normalizeSectionProps(definition.defaultProps, section.props),
    style: {
      ...structuredClone(definition.defaultStyle),
      ...(section.style ?? {}),
    },
  };
}

function normalizeSectionProps(defaultProps: SiteSectionProps, props: SiteSectionProps | undefined): SiteSectionProps {
  if (props !== undefined && (!props || typeof props !== "object" || Array.isArray(props))) {
    throw new Error("Invalid section props");
  }
  const input = props ?? {};
  const merged: SiteSectionProps = { ...structuredClone(defaultProps), ...input };
  return {
    ...merged,
    title: merged.title ? normalizeText(merged.title, defaultProps.title ?? { en: "", vi: "" }) : undefined,
    eyebrow: merged.eyebrow ? normalizeText(merged.eyebrow, defaultProps.eyebrow ?? { en: "", vi: "" }) : undefined,
    subtitle: merged.subtitle ? normalizeText(merged.subtitle, defaultProps.subtitle ?? { en: "", vi: "" }) : undefined,
    body: merged.body ? normalizeText(merged.body, defaultProps.body ?? { en: "", vi: "" }) : undefined,
    primaryCta: merged.primaryCta ? normalizeLink(merged.primaryCta, defaultProps.primaryCta) : undefined,
    secondaryCta: merged.secondaryCta ? normalizeLink(merged.secondaryCta, defaultProps.secondaryCta) : undefined,
    enabledStayTypes: Array.isArray(merged.enabledStayTypes) ? merged.enabledStayTypes.filter((item) => item === "hourly" || item === "overnight" || item === "daily") : defaultProps.enabledStayTypes,
    homestayIds: Array.isArray(merged.homestayIds) ? merged.homestayIds.filter((item) => typeof item === "string") : defaultProps.homestayIds,
    itemCount: typeof merged.itemCount === "number" && Number.isFinite(merged.itemCount) ? Math.max(1, Math.min(12, Math.round(merged.itemCount))) : defaultProps.itemCount,
    items: Array.isArray(merged.items) ? merged.items.flatMap(normalizeBuilderItem) : defaultProps.items,
    images: Array.isArray(merged.images) ? merged.images.filter((item) => typeof item === "string") : defaultProps.images,
    faqs: Array.isArray(merged.faqs) ? merged.faqs.flatMap(normalizeFaqItem) : defaultProps.faqs,
  };
}

function normalizeBuilderItem(item: BuilderItem) {
  if (!item || typeof item !== "object" || !item.title) return [];
  return [{
    id: typeof item.id === "string" ? item.id : `item-${Math.random().toString(36).slice(2, 9)}`,
    icon: item.icon,
    title: normalizeText(item.title, { en: "Item", vi: "Mục" }),
    body: item.body ? normalizeText(item.body, { en: "", vi: "" }) : undefined,
  }];
}

function normalizeFaqItem(item: BuilderFaqItem) {
  if (!item || typeof item !== "object" || !item.question || !item.answer) return [];
  return [{
    id: typeof item.id === "string" ? item.id : `faq-${Math.random().toString(36).slice(2, 9)}`,
    question: normalizeText(item.question, { en: "Question", vi: "Câu hỏi" }),
    answer: normalizeText(item.answer, { en: "Answer", vi: "Câu trả lời" }),
  }];
}

function legacySectionToInstance(pageId: SiteBuilderPageId, section: StoredLayoutSection) {
  const type = legacySectionMap[section.id];
  if (!type || !sectionDefinitions[type].pageIds.includes(pageId)) return [];
  return [{ ...createSectionInstance(type, `${pageId}-${type}`), enabled: section.enabled }];
}

function legacyLayoutsToPages(layouts: StoredLayoutSettings, fallback: SiteBuilderConfig) {
  return {
    home: normalizePageConfig("home", undefined, fallback.pages.home, layouts.home),
    homestays: normalizePageConfig("homestays", undefined, fallback.pages.homestays, layouts.homestays),
    detail: normalizePageConfig("detail", undefined, fallback.pages.detail, layouts.detail),
  };
}

function toLegacySection(section: SiteSectionInstance): StoredLayoutSection {
  return {
    id: section.type,
    name: section.name,
    enabled: section.enabled,
  };
}

function normalizeHeader(input: Partial<SiteHeaderConfig> | undefined, fallback: SiteHeaderConfig): SiteHeaderConfig {
  return {
    siteName: input?.siteName || fallback.siteName || "StayFlow",
    logoText: input?.logoText || fallback.logoText || "SF",
    links: normalizeLinks(input?.links, fallback.links),
    primaryCta: normalizeLink(input?.primaryCta, fallback.primaryCta),
    showLanguageToggle: input?.showLanguageToggle ?? fallback.showLanguageToggle ?? true,
    showThemeToggle: input?.showThemeToggle ?? fallback.showThemeToggle ?? true,
  };
}

function normalizeFooter(input: Partial<SiteFooterConfig> | undefined, fallback: SiteFooterConfig): SiteFooterConfig {
  return {
    tagline: normalizeText(input?.tagline, fallback.tagline),
    links: normalizeLinks(input?.links, fallback.links),
    contactEmail: input?.contactEmail || fallback.contactEmail || "",
  };
}

function normalizeLinks(input: SiteBuilderLink[] | undefined, fallback: SiteBuilderLink[]) {
  const links = (input?.length ? input : fallback).flatMap((link) => {
    const normalized = normalizeLink(link);
    return normalized.href ? [normalized] : [];
  });
  return links.length ? links : fallback;
}

function normalizeLink(input: Partial<SiteBuilderLink> | undefined, fallback?: SiteBuilderLink): SiteBuilderLink {
  return {
    label: normalizeText(input?.label, fallback?.label ?? { en: "Link", vi: "Liên kết" }),
    href: input?.href || fallback?.href || "/",
  };
}

function normalizeText(input: Partial<BuilderText> | undefined, fallback: BuilderText): BuilderText {
  return {
    en: input?.en || fallback.en || "",
    vi: input?.vi || fallback.vi || input?.en || fallback.en || "",
  };
}

function normalizeSiteTheme(theme: Partial<StoredTheme>): StoredTheme {
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
