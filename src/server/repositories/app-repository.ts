import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { layoutSectionDefinitions } from "@/lib/layout-sections";
import { homestays, recentBookings } from "@/lib/mock-data";
import type { BookingStatus, Homestay, Room, StayType } from "@/lib/types";

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
  mode: "light" | "dark" | "system";
};

export type StoredLayoutSection = {
  id: string;
  name: string;
  enabled: boolean;
};

type AppData = {
  homestays: Homestay[];
  bookings: StoredBooking[];
  theme: StoredTheme;
  layout: StoredLayoutSection[];
  knowledge: Array<{ id: string; title: string; content: string; enabled: boolean }>;
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
      currency: "USD",
      status: booking.status as BookingStatus,
      paymentStatus: booking.status === "pending_payment" ? "pending" : "paid",
      customerName: booking.guest,
      customerEmail: `${booking.guest.toLowerCase().replaceAll(" ", ".")}@example.com`,
      createdAt: new Date(Date.UTC(2026, 5, 12 + index)).toISOString(),
      updatedAt: new Date(Date.UTC(2026, 5, 12 + index)).toISOString(),
    };
  }),
  theme: { primary: "#1F6F5F", accent: "#D98D5F", mode: "light" },
  layout: [
    ...layoutSectionDefinitions.map((section) => ({
      id: section.id,
      name: section.name,
      enabled: section.defaultEnabled,
    })),
  ],
  knowledge: [
    {
      id: "arrival",
      title: "Arrival",
      content: "Check-in begins at 2 PM and check-out is by 11 AM.",
      enabled: true,
    },
    {
      id: "cancellation",
      title: "Cancellation",
      content: "Free cancellation is available until seven days before arrival.",
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
    knowledge: stored.knowledge ?? initialData.knowledge,
    layout: normalizeLayout(stored.layout ?? initialData.layout),
    theme: normalizeTheme(stored.theme ?? initialData.theme),
  };
  if (normalized.bookings.some((booking, index) => booking.accessToken !== stored.bookings?.[index]?.accessToken)) {
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
    rooms,
    priceFrom: Math.min(...rooms.map((room) => room.hourlyBlockPrice)),
  };
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
    mode: theme.mode === "system" ? "light" : theme.mode,
  };
}

function normalizeLayout(layout: StoredLayoutSection[]): StoredLayoutSection[] {
  const known: Map<string, (typeof layoutSectionDefinitions)[number]> = new Map(
    layoutSectionDefinitions.map((section) => [section.id, section]),
  );
  const seen = new Set<string>();
  const normalized = layout
    .flatMap((section) => {
      const definition = known.get(section.id);
      if (!definition || seen.has(section.id)) return [];
      seen.add(section.id);
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

  return normalized.length ? normalized : initialData.layout;
}

export const appRepository = {
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
      throw new Error("That URL slug is already in use.");
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
      amenities: ["Wi-Fi"],
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
      throw new Error("That URL slug is already in use.");
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
    return (await readData()).theme;
  },

  async saveTheme(theme: StoredTheme) {
    const data = await readData();
    data.theme = theme;
    await writeData(data);
    return theme;
  },

  async getLayout() {
    return (await readData()).layout;
  },

  async saveLayout(layout: StoredLayoutSection[]) {
    const data = await readData();
    data.layout = normalizeLayout(layout);
    await writeData(data);
    return data.layout;
  },

  async getKnowledge() {
    return (await readData()).knowledge.filter((item) => item.enabled);
  },
};
