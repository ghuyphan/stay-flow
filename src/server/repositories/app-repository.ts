import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  BookingStatus as PrismaBookingStatus,
  PaymentStatus as PrismaPaymentStatus,
  RoomStatus as PrismaRoomStatus,
  StayType as PrismaStayType,
} from "@prisma/client";
import { layoutPageDefinitions, layoutSectionDefinitions, type LayoutPageId } from "@/lib/layout-sections";
import { homestays, recentBookings } from "@/lib/mock-data";
import {
  configV2ToLegacyLayouts,
  defaultBuilderV2State,
  normalizeBuilderV2Config,
  normalizeBuilderV2State,
  applyLegacyLayoutsToBuilderV2,
  applyThemeToBuilderV2,
  validateBuilderV2ForPublish,
  type BuilderV2Config,
  type BuilderV2State,
} from "@/lib/site-builder-v2";
import type { BookingStatus, Homestay, Room, StayType } from "@/lib/types";
import { getPrismaClient } from "@/server/db/prisma";

export type StoredBooking = {
  id: string;
  bookingRef: string;
  accessToken: string;
  homestayId: string;
  homestayName: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  stayType: StayType;
  durationHours: number;
  durationLabel: string;
  guestCount: number;
  nights: number;
  subtotal: number;
  fees: number;
  taxes: number;
  discount: number;
  total: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequest?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredTheme = {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  muted: string;
  border: string;
  mode: "light" | "dark" | "system";
  radius: "sm" | "md" | "lg";
  font: "manrope" | "inter" | "system";
  density: "compact" | "comfortable" | "spacious";
  cardStyle: "flat" | "soft" | "elevated";
};

export type StoredLayoutSection = {
  id: string;
  name: string;
  enabled: boolean;
};

export type StoredLayoutSettings = Record<LayoutPageId, StoredLayoutSection[]>;

export type StoredKnowledgeItem = {
  id: string;
  titleEn: string;
  titleVi: string;
  contentEn: string;
  contentVi: string;
  enabled: boolean;
};

type AppData = {
  homestays: Homestay[];
  bookings: StoredBooking[];
  theme: StoredTheme;
  layout: StoredLayoutSection[];
  layouts: StoredLayoutSettings;
  siteBuilder: BuilderV2State;
  knowledge: StoredKnowledgeItem[];
};

const dataDirectory = path.join(process.cwd(), "data");
const dataPath = path.join(dataDirectory, "app-data.json");
const tempPath = path.join(dataDirectory, "app-data.tmp.json");

const initialData: AppData = {
  homestays,
  bookings: recentBookings.map((booking, index) => {
    const homestay = homestays.find((item) => item.name === booking.stay) ?? homestays[0];
    const room = homestay.rooms[index % homestay.rooms.length];
    const checkIn = new Date(Date.UTC(2026, 5, 18 + index));
    const checkOut = new Date(Date.UTC(2026, 5, 21 + index));
    return {
      id: `demo-${index + 1}`,
      bookingRef: booking.ref,
      accessToken: `demo-access-${index + 1}`,
      homestayId: homestay.id,
      homestayName: homestay.name,
      roomId: room.id,
      roomName: room.name,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      stayType: index % 2 ? "hourly" : "overnight",
      durationHours: index % 2 ? 4 : 12,
      durationLabel: index % 2 ? "4 hours" : "overnight",
      guestCount: 2,
      nights: index % 2 ? 0 : 1,
      subtotal: booking.total,
      fees: 0,
      taxes: 0,
      discount: 0,
      total: booking.total,
      currency: "VND",
      status: booking.status as BookingStatus,
      paymentStatus: booking.status === "pending_payment" ? "pending" : "paid",
      customerName: booking.guest,
      customerEmail: `${booking.guest.toLowerCase().replaceAll(" ", ".")}@example.com`,
      createdAt: new Date(Date.UTC(2026, 5, 12 + index)).toISOString(),
      updatedAt: new Date(Date.UTC(2026, 5, 12 + index)).toISOString(),
    };
  }),
  theme: {
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
  },
  layout: [
    ...layoutSectionDefinitions.map((section) => ({
      id: section.id,
      name: section.name,
      enabled: section.defaultEnabled,
    })),
  ],
  layouts: createDefaultLayouts(),
  siteBuilder: defaultBuilderV2State({
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
  }),
  knowledge: [
    {
      id: "arrival",
      titleEn: "Arrival",
      titleVi: "Nhận phòng",
      contentEn: "Check-in begins at 2 PM and check-out is by 11 AM.",
      contentVi: "Khách có thể nhận phòng từ 14:00 và trả phòng trước 11:00.",
      enabled: true,
    },
    {
      id: "cancellation",
      titleEn: "Cancellation",
      titleVi: "Hủy đặt phòng",
      contentEn: "Free cancellation is available until seven days before arrival.",
      contentVi: "Khách có thể hủy miễn phí trước ngày đến 7 ngày.",
      enabled: true,
    },
  ],
};

let writeQueue = Promise.resolve();

async function ensureStore() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(dataPath, "utf8");
  } catch {
    await writeFile(dataPath, JSON.stringify(initialData, null, 2), "utf8");
  }
}

async function readData(): Promise<AppData> {
  await ensureStore();
  const stored = JSON.parse(await readFile(dataPath, "utf8")) as Partial<AppData>;
  const normalized: AppData = {
    ...initialData,
    ...stored,
    homestays: (stored.homestays ?? initialData.homestays).map(migrateDemoHomestay).map(normalizeHomestay),
    bookings: (stored.bookings ?? initialData.bookings).map(normalizeBooking),
    knowledge: normalizeKnowledge(stored.knowledge ?? initialData.knowledge),
    layout: normalizeLayout("home", stored.layout ?? initialData.layout),
    layouts: normalizeLayouts(stored.layouts, stored.layout),
    theme: normalizeTheme(stored.theme ?? initialData.theme),
    siteBuilder: normalizeBuilderV2State(
      stored.siteBuilder,
      normalizeTheme(stored.theme ?? initialData.theme),
    ),
  };
  normalized.theme = normalized.siteBuilder.live.site.theme;
  normalized.layouts = configV2ToLegacyLayouts(normalized.siteBuilder.live);
  normalized.layout = normalized.layouts.home;
  if (
    normalized.bookings.some((booking, index) => booking.accessToken !== stored.bookings?.[index]?.accessToken) ||
    JSON.stringify(normalized.homestays) !== JSON.stringify(stored.homestays ?? initialData.homestays) ||
    JSON.stringify(normalized.knowledge) !== JSON.stringify(stored.knowledge ?? initialData.knowledge) ||
    JSON.stringify(normalized.siteBuilder) !== JSON.stringify(stored.siteBuilder ?? initialData.siteBuilder)
  ) {
    await writeData(normalized);
  }
  return normalized;
}

async function writeData(data: AppData) {
  writeQueue = writeQueue.then(async () => {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
    await rename(tempPath, dataPath);
  });
  await writeQueue;
}

function createBookingReference() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `SF-${date}-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

function normalizeRoom(room: Room): Room {
  const dailyPrice = room.dailyPrice ?? room.price;
  const legacyHourly = room.hourlyPrice ?? Math.max(1, Math.round(dailyPrice * 0.28));
  const legacyOvernight = room.overnightPrice ?? Math.max(1, Math.round(dailyPrice * 0.68));

  const hourlyBlockHours = room.hourlyBlockHours ?? 3;
  const hourlyBlockPrice = room.hourlyBlockPrice ?? (legacyHourly * 3);
  const hourlyExtraHourPrice = room.hourlyExtraHourPrice ?? legacyHourly;

  const overnightOptions = room.overnightOptions?.length
    ? room.overnightOptions
    : [
        {
          id: "on-1",
          labelEn: "Late Overnight (22:30 - 08:00)",
          labelVi: "Qua đêm muộn (22:30 - 08:00)",
          checkInTime: "22:30",
          checkOutTime: "08:00",
          price: legacyOvernight,
        },
        {
          id: "on-2",
          labelEn: "Standard Overnight (22:00 - 10:00)",
          labelVi: "Qua đêm thường (22:00 - 10:00)",
          checkInTime: "22:00",
          checkOutTime: "10:00",
          price: Math.round(legacyOvernight * 1.25),
        },
      ];

  return {
    ...room,
    dailyPrice,
    price: room.price ?? dailyPrice,
    hourlyPrice: legacyHourly,
    overnightPrice: legacyOvernight,
    hourlyBlockHours,
    hourlyBlockPrice,
    hourlyExtraHourPrice,
    overnightOptions,
    minHours: room.minHours ?? 2,
    maxHours: room.maxHours ?? 12,
  };
}

function normalizeHomestay(homestay: Homestay): Homestay {
  const rooms = homestay.rooms.map(normalizeRoom);
  return {
    ...homestay,
    amenities: normalizeAmenities(homestay.amenities),
    rooms,
    priceFrom: Math.min(...rooms.map((room) => room.hourlyBlockPrice)),
  };
}

function normalizeAmenities(amenities: string[]): string[] {
  return amenities.filter((amenity, index) => {
    if (amenity === "No staff check-in") return false;
    return amenities.indexOf(amenity) === index;
  });
}

function migrateDemoHomestay(homestay: Homestay): Homestay {
  if (homestay.id === "hs_dalat" && homestay.name === "Pine House") return initialData.homestays[0];
  if (homestay.id === "hs_hoian" && homestay.name === "River & Lantern") return initialData.homestays[1];
  return homestay;
}

function normalizeBooking(booking: StoredBooking): StoredBooking {
  const homestayName =
    booking.homestayName === "Pine House"
      ? "District One Studio"
      : booking.homestayName === "River & Lantern"
        ? "Thao Dien Loft"
        : booking.homestayName;
  const roomName =
    booking.roomName === "Pine View Suite"
      ? "City Nap Studio"
      : booking.roomName === "Garden Studio"
        ? "Work Break Room"
        : booking.roomName === "River Balcony Room"
          ? "Loft Bath Room"
          : booking.roomName === "Courtyard Family Room"
            ? "Airport Buffer Suite"
            : booking.roomName;
  const stayType = booking.stayType ?? "daily";
  const durationHours = booking.durationHours ?? (booking.nights ? booking.nights * 24 : 24);
  const durationLabel =
    booking.durationLabel?.includes("night") && stayType === "daily"
      ? `${booking.nights ?? 1} day${booking.nights === 1 ? "" : "s"}`
      : booking.durationLabel ?? `${booking.nights ?? 1} day${booking.nights === 1 ? "" : "s"}`;

  return {
    ...booking,
    homestayName,
    roomName,
    stayType,
    durationHours,
    durationLabel,
    accessToken: booking.accessToken ?? randomUUID().replaceAll("-", ""),
  };
}

function normalizeTheme(theme: StoredTheme): StoredTheme {
  return {
    ...theme,
    mode: theme.mode ?? "light",
    primary: theme.primary ?? initialData.theme.primary,
    accent: theme.accent ?? initialData.theme.accent,
    background: theme.background ?? initialData.theme.background,
    foreground: theme.foreground ?? initialData.theme.foreground,
    card: theme.card ?? initialData.theme.card,
    muted: theme.muted ?? initialData.theme.muted,
    border: theme.border ?? initialData.theme.border,
    radius: theme.radius ?? "lg",
    font: theme.font ?? "manrope",
    density: theme.density ?? "comfortable",
    cardStyle: theme.cardStyle ?? "soft",
  };
}

function createDefaultLayouts(): StoredLayoutSettings {
  return {
    home: createDefaultLayout("home"),
    homestays: createDefaultLayout("homestays"),
    detail: createDefaultLayout("detail"),
  };
}

function createDefaultLayout(page: LayoutPageId): StoredLayoutSection[] {
  return layoutPageDefinitions[page].sections.map((section) => ({
    id: section.id,
    name: section.name,
    enabled: section.defaultEnabled,
  }));
}

function normalizeLayout(page: LayoutPageId, layout: StoredLayoutSection[]): StoredLayoutSection[] {
  const pageDefinitions = layoutPageDefinitions[page].sections;
  const known: Map<string, (typeof pageDefinitions)[number]> = new Map(
    pageDefinitions.map((section) => [section.id, section]),
  );
  const seen = new Set<string>();
  const normalized = layout
    .flatMap((section) => {
      const definition = known.get(section.id);
      if (!definition || seen.has(section.id)) return [];
      seen.add(section.id);
      return [{ id: definition.id, name: definition.name, enabled: section.enabled }];
    });

  for (const definition of pageDefinitions) {
    if (!seen.has(definition.id)) {
      normalized.push({
        id: definition.id,
        name: definition.name,
        enabled: definition.defaultEnabled,
      });
    }
  }

  return normalized.length ? normalized : createDefaultLayout(page);
}

function normalizeLayouts(layouts?: Partial<StoredLayoutSettings>, legacyHomeLayout?: StoredLayoutSection[]): StoredLayoutSettings {
  return {
    home: normalizeLayout("home", layouts?.home ?? legacyHomeLayout ?? initialData.layout),
    homestays: normalizeLayout("homestays", layouts?.homestays ?? createDefaultLayout("homestays")),
    detail: normalizeLayout("detail", layouts?.detail ?? createDefaultLayout("detail")),
  };
}

function normalizeKnowledge(knowledge: Array<Partial<StoredKnowledgeItem> & { title?: string; content?: string }>): StoredKnowledgeItem[] {
  const normalized = knowledge.flatMap((item) => {
    const defaultItem = initialData.knowledge.find((candidate) => candidate.id === item.id);
    const titleEn = item.titleEn ?? item.title;
    const contentEn = item.contentEn ?? item.content;
    if (!titleEn || !contentEn) return [];
    const titleVi = item.titleVi ?? defaultItem?.titleVi ?? titleEn;
    const contentVi = item.contentVi ?? defaultItem?.contentVi ?? contentEn;
    return [{
      id: item.id ?? randomUUID(),
      titleEn,
      titleVi: defaultItem && titleVi === titleEn ? defaultItem.titleVi : titleVi,
      contentEn,
      contentVi: defaultItem && contentVi === contentEn ? defaultItem.contentVi : contentVi,
      enabled: item.enabled ?? true,
    }];
  });

  return normalized.length ? normalized : initialData.knowledge;
}

const localAppRepository = {
  async listHomestays() {
    return (await readData()).homestays;
  },

  async getHomestayBySlug(slug: string) {
    return (await readData()).homestays.find((homestay) => homestay.slug === slug);
  },

  async getHomestay(id: string) {
    return (await readData()).homestays.find((homestay) => homestay.id === id);
  },

  async createHomestay(
    input: Pick<Homestay, "name" | "slug" | "location" | "description" | "priceFrom" | "image">,
  ) {
    const data = await readData();
    if (data.homestays.some((homestay) => homestay.slug === input.slug)) {
      throw new Error("Đường dẫn URL này đã được dùng.");
    }
    const legacyHourly = Math.max(1, Math.round(input.priceFrom * 0.28));
    const legacyOvernight = Math.max(1, Math.round(input.priceFrom * 0.68));

    const created: Homestay = {
      ...input,
      id: `hs_${randomUUID().slice(0, 8)}`,
      rating: 0,
      reviewCount: 0,
      gallery: [input.image],
      tags: ["New"],
      amenities: ["Self check-in", "Food delivery friendly", "Nintendo Switch", "Fast Wi-Fi"],
      rooms: [
        {
          id: `room_${randomUUID().slice(0, 8)}`,
          name: "Standard Room",
          description: "A comfortable room ready to customize.",
          guests: 2,
          beds: "1 queen bed",
          size: "30 m²",
          price: input.priceFrom,
          hourlyPrice: legacyHourly,
          overnightPrice: legacyOvernight,
          dailyPrice: input.priceFrom,
          hourlyBlockHours: 3,
          hourlyBlockPrice: legacyHourly * 3,
          hourlyExtraHourPrice: legacyHourly,
          overnightOptions: [
            {
              id: "on-1",
              labelEn: "Late Overnight (22:30 - 08:00)",
              labelVi: "Qua đêm muộn (22:30 - 08:00)",
              checkInTime: "22:30",
              checkOutTime: "08:00",
              price: legacyOvernight,
            },
            {
              id: "on-2",
              labelEn: "Standard Overnight (22:00 - 10:00)",
              labelVi: "Qua đêm thường (22:00 - 10:00)",
              checkInTime: "22:00",
              checkOutTime: "10:00",
              price: Math.round(legacyOvernight * 1.25),
            }
          ],
          minHours: 2,
          maxHours: 12,
          image: input.image,
          gallery: [input.image],
          remaining: 1,
        },
      ],
    };
    data.homestays.push(created);
    await writeData(data);
    return created;
  },

  async updateHomestay(
    id: string,
    input: Partial<Pick<Homestay, "name" | "slug" | "location" | "description" | "priceFrom" | "image">>,
  ) {
    const data = await readData();
    const index = data.homestays.findIndex((homestay) => homestay.id === id);
    if (index < 0) return undefined;
    if (
      input.slug &&
      data.homestays.some((homestay) => homestay.slug === input.slug && homestay.id !== id)
    ) {
      throw new Error("Đường dẫn URL này đã được dùng.");
    }
    data.homestays[index] = {
      ...data.homestays[index],
      ...input,
      gallery: input.image
        ? [input.image, ...data.homestays[index].gallery.filter((image) => image !== input.image)]
        : data.homestays[index].gallery,
    };
    await writeData(data);
    return data.homestays[index];
  },

  async createRoom(
    homestayId: string,
    input: Omit<Room, "id">,
  ) {
    const data = await readData();
    const homestay = data.homestays.find((item) => item.id === homestayId);
    if (!homestay) return undefined;
    const room: Room = { ...input, id: `room_${randomUUID().slice(0, 8)}` };
    homestay.rooms.push(room);
    homestay.priceFrom = Math.min(...homestay.rooms.map((item) => item.hourlyBlockPrice));
    await writeData(data);
    return room;
  },

  async updateRoom(homestayId: string, roomId: string, input: Partial<Omit<Room, "id">>) {
    const data = await readData();
    const homestay = data.homestays.find((item) => item.id === homestayId);
    const index = homestay?.rooms.findIndex((room) => room.id === roomId) ?? -1;
    if (!homestay || index < 0) return undefined;
    homestay.rooms[index] = { ...homestay.rooms[index], ...input, id: roomId };
    homestay.priceFrom = Math.min(...homestay.rooms.map((item) => item.hourlyBlockPrice));
    await writeData(data);
    return homestay.rooms[index];
  },

  async deleteRoom(homestayId: string, roomId: string) {
    const data = await readData();
    const homestay = data.homestays.find((item) => item.id === homestayId);
    if (!homestay || homestay.rooms.length <= 1) return false;
    const nextRooms = homestay.rooms.filter((room) => room.id !== roomId);
    if (nextRooms.length === homestay.rooms.length) return false;
    homestay.rooms = nextRooms;
    homestay.priceFrom = Math.min(...nextRooms.map((item) => item.hourlyBlockPrice));
    await writeData(data);
    return true;
  },

  async listBookings() {
    return (await readData()).bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getBooking(reference: string) {
    return (await readData()).bookings.find(
      (booking) => booking.bookingRef.toLowerCase() === reference.toLowerCase(),
    );
  },

  async createBooking(
    booking: Omit<
      StoredBooking,
      "id" | "bookingRef" | "accessToken" | "createdAt" | "updatedAt"
    >,
  ) {
    const data = await readData();
    const now = new Date().toISOString();
    const created: StoredBooking = {
      ...booking,
      id: randomUUID(),
      bookingRef: createBookingReference(),
      accessToken: randomUUID().replaceAll("-", ""),
      createdAt: now,
      updatedAt: now,
    };
    data.bookings.unshift(created);
    await writeData(data);
    return created;
  },

  async updateBooking(reference: string, changes: Partial<StoredBooking>) {
    const data = await readData();
    const index = data.bookings.findIndex(
      (booking) => booking.bookingRef.toLowerCase() === reference.toLowerCase(),
    );
    if (index < 0) return undefined;
    data.bookings[index] = {
      ...data.bookings[index],
      ...changes,
      id: data.bookings[index].id,
      bookingRef: data.bookings[index].bookingRef,
      updatedAt: new Date().toISOString(),
    };
    await writeData(data);
    return data.bookings[index];
  },

  async getTheme() {
    return (await readData()).siteBuilder.live.site.theme;
  },

  async saveTheme(theme: StoredTheme) {
    const data = await readData();
    data.siteBuilder = applyThemeToBuilderV2(data.siteBuilder, normalizeTheme(theme));
    data.theme = data.siteBuilder.live.site.theme;
    await writeData(data);
    return data.theme;
  },

  async getLayout() {
    return configV2ToLegacyLayouts((await readData()).siteBuilder.live).home;
  },

  async saveLayout(layout: StoredLayoutSection[]) {
    const data = await readData();
    data.layouts.home = normalizeLayout("home", layout);
    data.layout = data.layouts.home;
    data.siteBuilder = applyLegacyLayoutsToBuilderV2(data.siteBuilder, data.layouts);
    await writeData(data);
    return data.layouts.home;
  },

  async getLayouts() {
    return configV2ToLegacyLayouts((await readData()).siteBuilder.live);
  },

  async saveLayouts(layouts: StoredLayoutSettings) {
    const data = await readData();
    data.layouts = normalizeLayouts(layouts, data.layout);
    data.layout = data.layouts.home;
    data.siteBuilder = applyLegacyLayoutsToBuilderV2(data.siteBuilder, data.layouts);
    await writeData(data);
    return data.layouts;
  },

  async getSiteBuilder() {
    return (await readData()).siteBuilder;
  },

  async getLiveSiteBuilder() {
    return (await readData()).siteBuilder.live;
  },

  async saveSiteBuilderDraft(config: BuilderV2Config) {
    const data = await readData();
    data.siteBuilder.draft = normalizeBuilderV2Config(
      { ...config, updatedAt: new Date().toISOString() },
      data.siteBuilder.live,
    );
    await writeData(data);
    return data.siteBuilder.draft;
  },

  async publishSiteBuilderDraft() {
    const data = await readData();
    const live = normalizeBuilderV2Config(
      { ...data.siteBuilder.draft, updatedAt: new Date().toISOString() },
      data.siteBuilder.live,
    );
    const issues = validateBuilderV2ForPublish(live);
    if (issues.length) throw new Error(`Invalid builder draft: ${issues.join(" ")}`);
    data.siteBuilder.live = live;
    data.siteBuilder.draft = data.siteBuilder.live;
    data.theme = data.siteBuilder.live.site.theme;
    data.layouts = configV2ToLegacyLayouts(data.siteBuilder.live);
    data.layout = data.layouts.home;
    await writeData(data);
    return data.siteBuilder;
  },

  async listKnowledge() {
    return (await readData()).knowledge;
  },

  async getKnowledge(language: "en" | "vi" = "en") {
    return (await readData()).knowledge
      .filter((item) => item.enabled)
      .map((item) => ({
        id: item.id,
        title: language === "vi" ? item.titleVi : item.titleEn,
        content: language === "vi" ? item.contentVi : item.contentEn,
      }));
  },

  async saveKnowledge(knowledge: StoredKnowledgeItem[]) {
    const data = await readData();
    data.knowledge = normalizeKnowledge(knowledge);
    await writeData(data);
    return data.knowledge;
  },
};

type PrismaRecord = Record<string, unknown>;

function asRecord(value: unknown): PrismaRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as PrismaRecord : {};
}

function asRecords(value: unknown): PrismaRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asDate(value: unknown) {
  return value instanceof Date ? value : new Date(asString(value));
}

function decimalToNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return fallback;
}

function jsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function appBookingStatus(status: string): BookingStatus {
  return status.toLowerCase() as BookingStatus;
}

function dbBookingStatus(status: BookingStatus): PrismaBookingStatus {
  return status.toUpperCase() as PrismaBookingStatus;
}

function dbStayType(stayType: StayType): PrismaStayType {
  return stayType.toUpperCase() as PrismaStayType;
}

function appStayType(stayType: string): StayType {
  return stayType.toLowerCase() as StayType;
}

function appPaymentStatus(status?: string) {
  return (status?.toLowerCase() ?? "unpaid") as StoredBooking["paymentStatus"];
}

function dbPaymentStatus(status: StoredBooking["paymentStatus"]): PrismaPaymentStatus {
  return status.toUpperCase() as PrismaPaymentStatus;
}

function fallbackOvernightOptions(price: number): Room["overnightOptions"] {
  return [
    {
      id: "on-1",
      labelEn: "Late Overnight (22:30 - 08:00)",
      labelVi: "Qua đêm muộn (22:30 - 08:00)",
      checkInTime: "22:30",
      checkOutTime: "08:00",
      price,
    },
    {
      id: "on-2",
      labelEn: "Standard Overnight (22:00 - 10:00)",
      labelVi: "Qua đêm thường (22:00 - 10:00)",
      checkInTime: "22:00",
      checkOutTime: "10:00",
      price: Math.round(price * 1.25),
    },
  ];
}

function mapPrismaRoom(room: PrismaRecord, fallbackImage = ""): Room {
  const roomType = asRecord(room.roomType);
  const dailyPrice = decimalToNumber(room.dailyPrice, decimalToNumber(room.basePrice));
  const hourlyBlockHours = Number(room.hourlyBlockHours ?? room.minHours ?? 3);
  const hourlyPrice = decimalToNumber(room.hourlyPrice, Math.max(1, Math.round(dailyPrice * 0.28)));
  const overnightPrice = decimalToNumber(room.overnightPrice, Math.max(1, Math.round(dailyPrice * 0.68)));
  const gallery = jsonArray<string>(room.gallery).filter(Boolean);
  const image = asString(room.image, gallery[0] ?? fallbackImage);
  return {
    id: asString(room.id),
    name: asString(room.name),
    description: asString(room.description),
    guests: Number(room.maxGuests ?? room.guests ?? 2),
    beds: asString(room.beds, asString(roomType.name, "1 queen bed")),
    size: asString(room.size, "30 m²"),
    hourlyPrice,
    overnightPrice,
    dailyPrice,
    hourlyBlockHours,
    hourlyBlockPrice: decimalToNumber(room.hourlyBlockPrice, hourlyPrice * hourlyBlockHours),
    hourlyExtraHourPrice: decimalToNumber(room.hourlyExtraHourPrice, hourlyPrice),
    overnightOptions: jsonArray<Room["overnightOptions"][number]>(room.overnightOptions).length
      ? jsonArray<Room["overnightOptions"][number]>(room.overnightOptions)
      : fallbackOvernightOptions(overnightPrice),
    minHours: Number(room.minHours ?? 2),
    maxHours: Number(room.maxHours ?? 12),
    price: dailyPrice,
    image,
    gallery: gallery.length ? gallery : [image].filter(Boolean),
    remaining: Number(room.remaining ?? 1),
  };
}

function mapPrismaHomestay(homestay: PrismaRecord): Homestay {
  const images = asRecords(homestay.images);
  const cover = images.find((image) => image.isCover) ?? images[0];
  const image = asString(cover?.url, "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=85");
  const rooms = asRecords(homestay.rooms).map((room) => mapPrismaRoom(room, image));
  const amenities = asRecords(homestay.amenities)
    .map((item) => asString(asRecord(item.amenity).name))
    .filter(Boolean);
  const ratings = asRecords(homestay.reviews);
  const rating = ratings.length
    ? ratings.reduce((total, review) => total + Number(review.rating ?? 0), 0) / ratings.length
    : 0;
  return normalizeHomestay({
    id: asString(homestay.id),
    slug: asString(homestay.slug),
    name: asString(homestay.name),
    location: asString(homestay.address, asString(homestay.city)),
    description: asString(homestay.description),
    rating: Number(rating.toFixed(1)),
    reviewCount: ratings.length,
    priceFrom: rooms.length ? Math.min(...rooms.map((room: Room) => room.hourlyBlockPrice)) : 0,
    image,
    gallery: images.map((item) => asString(item.url)).filter(Boolean),
    tags: homestay.status === "PUBLISHED" ? ["Published"] : ["Draft"],
    amenities: amenities.length ? amenities : ["Self check-in", "Food delivery friendly", "Fast Wi-Fi"],
    rooms,
  });
}

function homestayInclude() {
  return {
    amenities: { include: { amenity: true } },
    images: { orderBy: [{ isCover: "desc" as const }, { sortOrder: "asc" as const }] },
    reviews: true,
    rooms: {
      where: { status: { not: "INACTIVE" as PrismaRoomStatus } },
      include: { roomType: true },
      orderBy: { createdAt: "asc" as const },
    },
  };
}

function siteBuilderStateFromJson(value: unknown) {
  const state = asRecord(value);
  return state.live && state.draft ? state as Partial<BuilderV2State> : undefined;
}

async function getOwner() {
  const prisma = getPrismaClient();
  const email = process.env.ADMIN_EMAIL ?? "owner@stayflow.local";
  return prisma.user.upsert({
    where: { email },
    update: { role: "OWNER" },
    create: { email, name: "StayFlow Owner", role: "OWNER" },
  });
}

async function getRoomType(name = "Standard") {
  const prisma = getPrismaClient();
  return (await prisma.roomType.findFirst({ where: { name } }))
    ?? prisma.roomType.create({ data: { name, description: `${name} room` } });
}

async function getConfigHomestay() {
  const prisma = getPrismaClient();
  const existing = await prisma.homestay.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  const owner = await getOwner();
  return prisma.homestay.create({
    data: {
      ownerId: owner.id,
      name: "StayFlow",
      slug: "stayflow",
      description: "Default StayFlow configuration record.",
      address: "Ho Chi Minh City",
      city: "Ho Chi Minh City",
      country: "Vietnam",
      status: "DRAFT",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      houseRules: "No smoking. Quiet hours begin at 22:00.",
      cancellationPolicy: "Free cancellation until seven days before arrival.",
    },
  });
}

function mapPrismaBooking(booking: PrismaRecord): StoredBooking {
  const homestay = asRecord(booking.homestay);
  const room = asRecord(booking.room);
  const payment = asRecord(booking.payment);
  return {
    id: asString(booking.id),
    bookingRef: asString(booking.bookingRef),
    accessToken: asString(booking.accessToken),
    homestayId: asString(booking.homestayId),
    homestayName: asString(homestay.name),
    roomId: asString(booking.roomId),
    roomName: asString(room.name),
    checkIn: asDate(booking.checkIn).toISOString(),
    checkOut: asDate(booking.checkOut).toISOString(),
    stayType: appStayType(asString(booking.stayType)),
    durationHours: Number(booking.durationHours ?? 0),
    durationLabel: asString(booking.durationLabel),
    guestCount: Number(booking.guestCount),
    nights: Number(booking.nights),
    subtotal: decimalToNumber(booking.subtotal),
    fees: decimalToNumber(booking.fees),
    taxes: decimalToNumber(booking.taxes),
    discount: decimalToNumber(booking.discount),
    total: decimalToNumber(booking.total),
    currency: asString(booking.currency),
    status: appBookingStatus(asString(booking.status)),
    paymentStatus: appPaymentStatus(asString(payment.status) || undefined),
    customerName: asString(booking.customerName),
    customerEmail: asString(booking.customerEmail),
    customerPhone: asString(booking.customerPhone) || undefined,
    specialRequest: asString(booking.specialRequest) || undefined,
    createdAt: asDate(booking.createdAt).toISOString(),
    updatedAt: asDate(booking.updatedAt).toISOString(),
  };
}

function bookingInclude() {
  return { homestay: true, room: true, payment: true };
}

const prismaAppRepository: typeof localAppRepository = {
  async listHomestays() {
    const prisma = getPrismaClient();
    const rows = await prisma.homestay.findMany({ include: homestayInclude(), orderBy: { createdAt: "asc" } });
    return rows.map(mapPrismaHomestay);
  },

  async getHomestayBySlug(slug: string) {
    const prisma = getPrismaClient();
    const row = await prisma.homestay.findUnique({ where: { slug }, include: homestayInclude() });
    return row ? mapPrismaHomestay(row) : undefined;
  },

  async getHomestay(id: string) {
    const prisma = getPrismaClient();
    const row = await prisma.homestay.findUnique({ where: { id }, include: homestayInclude() });
    return row ? mapPrismaHomestay(row) : undefined;
  },

  async createHomestay(input) {
    const prisma = getPrismaClient();
    if (await prisma.homestay.findUnique({ where: { slug: input.slug } })) {
      throw new Error("Đường dẫn URL này đã được dùng.");
    }
    const owner = await getOwner();
    const roomType = await getRoomType("Standard");
    const legacyHourly = Math.max(1, Math.round(input.priceFrom * 0.28));
    const legacyOvernight = Math.max(1, Math.round(input.priceFrom * 0.68));
    const row = await prisma.homestay.create({
      data: {
        ownerId: owner.id,
        name: input.name,
        slug: input.slug,
        description: input.description,
        address: input.location,
        city: input.location,
        country: "Vietnam",
        status: "PUBLISHED",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        houseRules: "No smoking. Quiet hours begin at 22:00.",
        cancellationPolicy: "Free cancellation until seven days before arrival.",
        images: { create: [{ url: input.image, alt: input.name, isCover: true }] },
        rooms: {
          create: [{
            roomTypeId: roomType.id,
            name: "Standard Room",
            description: "A comfortable room ready to customize.",
            maxGuests: 2,
            beds: "1 queen bed",
            size: "30 m²",
            basePrice: input.priceFrom,
            hourlyPrice: legacyHourly,
            overnightPrice: legacyOvernight,
            dailyPrice: input.priceFrom,
            hourlyBlockHours: 3,
            hourlyBlockPrice: legacyHourly * 3,
            hourlyExtraHourPrice: legacyHourly,
            overnightOptions: fallbackOvernightOptions(legacyOvernight),
            image: input.image,
            gallery: [input.image],
            remaining: 1,
            minHours: 2,
            maxHours: 12,
          }],
        },
      },
      include: homestayInclude(),
    });
    return mapPrismaHomestay(row);
  },

  async updateHomestay(id, input) {
    const prisma = getPrismaClient();
    const existing = await prisma.homestay.findUnique({ where: { id } });
    if (!existing) return undefined;
    if (input.slug && await prisma.homestay.findFirst({ where: { slug: input.slug, id: { not: id } } })) {
      throw new Error("Đường dẫn URL này đã được dùng.");
    }
    await prisma.$transaction(async (tx) => {
      await tx.homestay.update({
        where: { id },
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          address: input.location,
          city: input.location,
        },
      });
      if (input.image) {
        await tx.homestayImage.deleteMany({ where: { homestayId: id, isCover: true } });
        await tx.homestayImage.create({ data: { homestayId: id, url: input.image, alt: input.name ?? existing.name, isCover: true } });
      }
    });
    return this.getHomestay(id);
  },

  async createRoom(homestayId, input) {
    const prisma = getPrismaClient();
    if (!await prisma.homestay.findUnique({ where: { id: homestayId } })) return undefined;
    const roomType = await getRoomType(input.beds);
    const row = await prisma.room.create({
      data: {
        homestayId,
        roomTypeId: roomType.id,
        name: input.name,
        description: input.description,
        maxGuests: input.guests,
        beds: input.beds,
        size: input.size,
        basePrice: input.price,
        hourlyPrice: input.hourlyPrice,
        overnightPrice: input.overnightPrice,
        dailyPrice: input.dailyPrice,
        hourlyBlockHours: input.hourlyBlockHours,
        hourlyBlockPrice: input.hourlyBlockPrice,
        hourlyExtraHourPrice: input.hourlyExtraHourPrice,
        overnightOptions: input.overnightOptions,
        minHours: input.minHours,
        maxHours: input.maxHours,
        image: input.image,
        gallery: input.gallery ?? [input.image],
        remaining: input.remaining,
      },
      include: { roomType: true },
    });
    return mapPrismaRoom(row, input.image);
  },

  async updateRoom(homestayId, roomId, input) {
    const prisma = getPrismaClient();
    const existing = await prisma.room.findFirst({ where: { id: roomId, homestayId } });
    if (!existing) return undefined;
    const row = await prisma.room.update({
      where: { id: roomId },
      data: {
        name: input.name,
        description: input.description,
        maxGuests: input.guests,
        beds: input.beds,
        size: input.size,
        basePrice: input.price,
        hourlyPrice: input.hourlyPrice,
        overnightPrice: input.overnightPrice,
        dailyPrice: input.dailyPrice,
        hourlyBlockHours: input.hourlyBlockHours,
        hourlyBlockPrice: input.hourlyBlockPrice,
        hourlyExtraHourPrice: input.hourlyExtraHourPrice,
        overnightOptions: input.overnightOptions,
        minHours: input.minHours,
        maxHours: input.maxHours,
        image: input.image,
        gallery: input.gallery,
        remaining: input.remaining,
      },
      include: { roomType: true },
    });
    return mapPrismaRoom(row, input.image);
  },

  async deleteRoom(homestayId, roomId) {
    const prisma = getPrismaClient();
    const roomCount = await prisma.room.count({ where: { homestayId, status: { not: "INACTIVE" } } });
    if (roomCount <= 1) return false;
    const { count } = await prisma.room.deleteMany({ where: { id: roomId, homestayId } });
    return count > 0;
  },

  async listBookings() {
    const prisma = getPrismaClient();
    const rows = await prisma.booking.findMany({ include: bookingInclude(), orderBy: { createdAt: "desc" } });
    return rows.map(mapPrismaBooking);
  },

  async getBooking(reference) {
    const prisma = getPrismaClient();
    const row = await prisma.booking.findFirst({
      where: { bookingRef: { equals: reference, mode: "insensitive" } },
      include: bookingInclude(),
    });
    return row ? mapPrismaBooking(row) : undefined;
  },

  async createBooking(booking) {
    const prisma = getPrismaClient();
    const now = new Date();
    const row = await prisma.booking.create({
      data: {
        bookingRef: createBookingReference(),
        accessToken: randomUUID().replaceAll("-", ""),
        homestayId: booking.homestayId,
        roomId: booking.roomId,
        checkIn: new Date(booking.checkIn),
        checkOut: new Date(booking.checkOut),
        stayType: dbStayType(booking.stayType),
        durationHours: booking.durationHours,
        durationLabel: booking.durationLabel,
        guestCount: booking.guestCount,
        nights: booking.nights,
        subtotal: booking.subtotal,
        fees: booking.fees,
        taxes: booking.taxes,
        discount: booking.discount,
        total: booking.total,
        currency: booking.currency,
        status: dbBookingStatus(booking.status),
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        specialRequest: booking.specialRequest,
        createdAt: now,
        updatedAt: now,
        payment: {
          create: {
            provider: "manual",
            amount: booking.total,
            currency: booking.currency,
            status: dbPaymentStatus(booking.paymentStatus),
          },
        },
      },
      include: bookingInclude(),
    });
    return mapPrismaBooking(row);
  },

  async updateBooking(reference, changes) {
    const prisma = getPrismaClient();
    const existing = await prisma.booking.findFirst({ where: { bookingRef: { equals: reference, mode: "insensitive" } } });
    if (!existing) return undefined;
    const row = await prisma.booking.update({
      where: { id: existing.id },
      data: {
        status: changes.status ? dbBookingStatus(changes.status) : undefined,
        customerName: changes.customerName,
        customerEmail: changes.customerEmail,
        customerPhone: changes.customerPhone,
        specialRequest: changes.specialRequest,
        payment: changes.paymentStatus
          ? { upsert: {
              create: {
                provider: "manual",
                amount: changes.total ?? existing.total,
                currency: changes.currency ?? existing.currency,
                status: dbPaymentStatus(changes.paymentStatus),
              },
              update: { status: dbPaymentStatus(changes.paymentStatus) },
            } }
          : undefined,
      },
      include: bookingInclude(),
    });
    return mapPrismaBooking(row);
  },

  async getTheme() {
    const state = await this.getLiveSiteBuilder();
    return state.site.theme;
  },

  async saveTheme(theme) {
    const current = await this.getSiteBuilder();
    const next = applyThemeToBuilderV2(current, normalizeTheme(theme));
    await this.saveSiteBuilderDraft(next.draft);
    await this.publishSiteBuilderDraft();
    return next.live.site.theme;
  },

  async getLayout() {
    return configV2ToLegacyLayouts(await this.getLiveSiteBuilder()).home;
  },

  async saveLayout(layout) {
    const layouts = await this.getLayouts();
    layouts.home = normalizeLayout("home", layout);
    await this.saveLayouts(layouts);
    return layouts.home;
  },

  async getLayouts() {
    return configV2ToLegacyLayouts(await this.getLiveSiteBuilder());
  },

  async saveLayouts(layouts) {
    const state = await this.getSiteBuilder();
    const next = applyLegacyLayoutsToBuilderV2(state, normalizeLayouts(layouts));
    await this.saveSiteBuilderDraft(next.draft);
    await this.publishSiteBuilderDraft();
    return configV2ToLegacyLayouts(next.live);
  },

  async getSiteBuilder() {
    const prisma = getPrismaClient();
    const row = await prisma.layoutConfig.findFirst({ where: { page: "site-builder" }, orderBy: { updatedAt: "desc" } });
    const state = siteBuilderStateFromJson(row?.config);
    if (state?.live && state?.draft) {
      return normalizeBuilderV2State(state, normalizeTheme(state.live.site?.theme ?? initialData.theme));
    }
    return defaultBuilderV2State(initialData.theme);
  },

  async getLiveSiteBuilder() {
    return (await this.getSiteBuilder()).live;
  },

  async saveSiteBuilderDraft(config) {
    const prisma = getPrismaClient();
    const homestay = await getConfigHomestay();
    const current = await this.getSiteBuilder();
    const state = {
      live: current.live,
      draft: normalizeBuilderV2Config({ ...config, updatedAt: new Date().toISOString() }, current.live),
    };
    await prisma.layoutConfig.upsert({
      where: { homestayId_page: { homestayId: homestay.id, page: "site-builder" } },
      update: { config: state },
      create: { homestayId: homestay.id, page: "site-builder", config: state },
    });
    return state.draft;
  },

  async publishSiteBuilderDraft() {
    const prisma = getPrismaClient();
    const homestay = await getConfigHomestay();
    const current = await this.getSiteBuilder();
    const live = normalizeBuilderV2Config({ ...current.draft, updatedAt: new Date().toISOString() }, current.live);
    const issues = validateBuilderV2ForPublish(live);
    if (issues.length) throw new Error(`Invalid builder draft: ${issues.join(" ")}`);
    const state = { live, draft: live };
    await prisma.layoutConfig.upsert({
      where: { homestayId_page: { homestayId: homestay.id, page: "site-builder" } },
      update: { config: state, publishedAt: new Date() },
      create: { homestayId: homestay.id, page: "site-builder", config: state, publishedAt: new Date() },
    });
    await prisma.themeConfig.upsert({
      where: { homestayId: homestay.id },
      update: { config: live.site.theme },
      create: { homestayId: homestay.id, config: live.site.theme },
    });
    return state;
  },

  async listKnowledge() {
    const prisma = getPrismaClient();
    const rows = await prisma.aIKnowledgeBaseItem.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((item) => ({
      id: item.id,
      titleEn: item.titleEn,
      titleVi: item.titleVi,
      contentEn: item.contentEn,
      contentVi: item.contentVi,
      enabled: item.enabled,
    }));
  },

  async getKnowledge(language = "en") {
    return (await this.listKnowledge())
      .filter((item) => item.enabled)
      .map((item) => ({
        id: item.id,
        title: language === "vi" ? item.titleVi : item.titleEn,
        content: language === "vi" ? item.contentVi : item.contentEn,
      }));
  },

  async saveKnowledge(knowledge) {
    const prisma = getPrismaClient();
    const normalized = normalizeKnowledge(knowledge);
    await prisma.$transaction(async (tx) => {
      await tx.aIKnowledgeBaseItem.deleteMany({});
      if (normalized.length) {
        await tx.aIKnowledgeBaseItem.createMany({
          data: normalized.map((item) => ({
            id: item.id.startsWith("draft-") ? undefined : item.id,
            titleEn: item.titleEn,
            titleVi: item.titleVi,
            contentEn: item.contentEn,
            contentVi: item.contentVi,
            enabled: item.enabled,
            category: "support",
          })),
        });
      }
    });
    return this.listKnowledge();
  },
};

export const appRepository =
  process.env.DATA_ADAPTER === "prisma" ? prismaAppRepository : localAppRepository;
