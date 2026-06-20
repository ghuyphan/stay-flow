import type { Homestay } from "@/lib/types";

const districtOneGallery = [
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=85",
];

const thaoDienGallery = [
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85",
];

export const homestays: Homestay[] = [
  {
    id: "hs_dalat",
    slug: "district-one-studio-saigon",
    name: "District One Studio",
    location: "District 1, Ho Chi Minh City",
    description:
      "Compact private studios for work breaks, late arrivals, and short city stays near Ben Thanh.",
    rating: 4.92,
    reviewCount: 128,
    priceFrom: 450000,
    image: districtOneGallery[0],
    gallery: districtOneGallery,
    tags: ["Hourly", "Overnight"],
    amenities: [
      "Self check-in",
      "Food delivery friendly",
      "Nintendo Switch",
      "PS5 optional",
      "Fast Wi-Fi",
      "Secure parking",
    ],
    rooms: [
      {
        id: "pine-suite",
        name: "City Nap Studio",
        description: "Quiet room with blackout curtains, shower, desk, and keyless entry.",
        guests: 2,
        beds: "1 queen bed",
        size: "42 m²",
        hourlyPrice: 550000,
        overnightPrice: 1450000,
        dailyPrice: 2800000,
        hourlyBlockHours: 3,
        hourlyBlockPrice: 1500000,
        hourlyExtraHourPrice: 450000,
        overnightOptions: [
          { id: "on-1", labelEn: "Late Overnight (22:30 - 08:00)", labelVi: "Qua đêm muộn (22:30 - 08:00)", checkInTime: "22:30", checkOutTime: "08:00", price: 2000000 },
          { id: "on-2", labelEn: "Standard Overnight (22:00 - 10:00)", labelVi: "Qua đêm thường (22:00 - 10:00)", checkInTime: "22:00", checkOutTime: "10:00", price: 2500000 }
        ],
        minHours: 2,
        maxHours: 12,
        price: 2800000,
        image: districtOneGallery[1],
        gallery: [districtOneGallery[1], districtOneGallery[2], districtOneGallery[3]],
        remaining: 2,
      },
      {
        id: "garden-studio",
        name: "Work Break Room",
        description: "Simple studio for calls, rest, or a same-day refresh between plans.",
        guests: 2,
        beds: "1 queen bed",
        size: "31 m²",
        hourlyPrice: 450000,
        overnightPrice: 1225000,
        dailyPrice: 1950000,
        hourlyBlockHours: 3,
        hourlyBlockPrice: 1250000,
        hourlyExtraHourPrice: 375000,
        overnightOptions: [
          { id: "on-1", labelEn: "Late Overnight (22:30 - 08:00)", labelVi: "Qua đêm muộn (22:30 - 08:00)", checkInTime: "22:30", checkOutTime: "08:00", price: 1750000 },
          { id: "on-2", labelEn: "Standard Overnight (22:00 - 10:00)", labelVi: "Qua đêm thường (22:00 - 10:00)", checkInTime: "22:00", checkOutTime: "10:00", price: 2125000 }
        ],
        minHours: 2,
        maxHours: 10,
        price: 1950000,
        image: districtOneGallery[2],
        gallery: [districtOneGallery[2], districtOneGallery[1], districtOneGallery[3]],
        remaining: 1,
      },
    ],
  },
  {
    id: "hs_hoian",
    slug: "thao-dien-loft-saigon",
    name: "Thao Dien Loft",
    location: "Thao Dien, Ho Chi Minh City",
    description:
      "Design-led loft rooms for couples, business travelers, and overnight resets in District 2.",
    rating: 4.88,
    reviewCount: 94,
    priceFrom: 1625000,
    image: thaoDienGallery[0],
    gallery: thaoDienGallery,
    tags: ["Short stay", "Self check-in"],
    amenities: [
      "Self check-in",
      "Food delivery friendly",
      "PS4 optional",
      "Smart TV",
      "Fast Wi-Fi",
    ],
    rooms: [
      {
        id: "river-balcony",
        name: "Loft Bath Room",
        description: "Private loft with soaking tub, soft lighting, and a small work corner.",
        guests: 2,
        beds: "1 king bed",
        size: "36 m²",
        hourlyPrice: 600000,
        overnightPrice: 1550000,
        dailyPrice: 2300000,
        hourlyBlockHours: 3,
        hourlyBlockPrice: 1625000,
        hourlyExtraHourPrice: 500000,
        overnightOptions: [
          { id: "on-1", labelEn: "Late Overnight (22:30 - 08:00)", labelVi: "Qua đêm muộn (22:30 - 08:00)", checkInTime: "22:30", checkOutTime: "08:00", price: 2125000 },
          { id: "on-2", labelEn: "Standard Overnight (22:00 - 10:00)", labelVi: "Qua đêm thường (22:00 - 10:00)", checkInTime: "22:00", checkOutTime: "10:00", price: 2625000 }
        ],
        minHours: 2,
        maxHours: 12,
        price: 2300000,
        image: thaoDienGallery[1],
        gallery: [thaoDienGallery[1], thaoDienGallery[2], thaoDienGallery[3]],
        remaining: 3,
      },
      {
        id: "courtyard-family",
        name: "Airport Buffer Suite",
        description: "Larger studio for luggage, shower, and overnight layovers before early flights.",
        guests: 4,
        beds: "1 king + 2 singles",
        size: "48 m²",
        hourlyPrice: 800000,
        overnightPrice: 1950000,
        dailyPrice: 2950000,
        hourlyBlockHours: 3,
        hourlyBlockPrice: 2125000,
        hourlyExtraHourPrice: 625000,
        overnightOptions: [
          { id: "on-1", labelEn: "Late Overnight (22:30 - 08:00)", labelVi: "Qua đêm muộn (22:30 - 08:00)", checkInTime: "22:30", checkOutTime: "08:00", price: 2750000 },
          { id: "on-2", labelEn: "Standard Overnight (22:00 - 10:00)", labelVi: "Qua đêm thường (22:00 - 10:00)", checkInTime: "22:00", checkOutTime: "10:00", price: 3250000 }
        ],
        minHours: 3,
        maxHours: 12,
        price: 2950000,
        image: thaoDienGallery[2],
        gallery: [thaoDienGallery[2], thaoDienGallery[1], thaoDienGallery[3]],
        remaining: 1,
      },
    ],
  },
];

export const recentBookings = [
  { ref: "SF-260615-A8K2", guest: "Mina Park", stay: "District One Studio", total: 1700000, status: "confirmed" },
  { ref: "SF-260614-P3L9", guest: "Daniel Ross", stay: "Thao Dien Loft", total: 2400000, status: "pending_payment" },
  { ref: "SF-260613-R7M4", guest: "Linh Nguyen", stay: "District One Studio", total: 1450000, status: "checked_in" },
  { ref: "SF-260612-C2Q1", guest: "Aisha Khan", stay: "Thao Dien Loft", total: 1950000, status: "paid" },
];
