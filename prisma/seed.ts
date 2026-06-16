import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/stayflow";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "owner@stayflow.local" },
    update: {},
    create: {
      name: "Demo Owner",
      email: "owner@stayflow.local",
      role: "OWNER",
    },
  });

  await prisma.user.upsert({
    where: { email: "guest@stayflow.local" },
    update: {},
    create: {
      name: "Demo Guest",
      email: "guest@stayflow.local",
      role: "GUEST",
    },
  });

  const roomTypes = await Promise.all(
    [
      ["Suite", "A spacious premium room with a private sitting area."],
      ["Studio", "A self-contained room designed for one or two guests."],
      ["Family", "Flexible sleeping space for families and small groups."],
      ["Balcony", "A bright room with private outdoor space."],
    ].map(([name, description]) =>
      prisma.roomType.create({ data: { name, description } }),
    ),
  );

  const properties = [
    {
      name: "District One Studio",
      slug: "district-one-studio-saigon",
      city: "Ho Chi Minh City",
      address: "12 Le Lai, District 1",
      description:
        "Compact private studios for hourly, overnight, and daily stays near Ben Thanh.",
      cover:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
    },
    {
      name: "Thao Dien Loft",
      slug: "thao-dien-loft-saigon",
      city: "Ho Chi Minh City",
      address: "8 Xuan Thuy, Thao Dien",
      description:
        "Design-led loft rooms for overnight resets and short city stays in District 2.",
      cover:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=85",
    },
  ];

  for (const [propertyIndex, property] of properties.entries()) {
    const homestay = await prisma.homestay.upsert({
      where: { slug: property.slug },
      update: {},
      create: {
        ownerId: owner.id,
        name: property.name,
        slug: property.slug,
        description: property.description,
        address: property.address,
        city: property.city,
        country: "Vietnam",
        status: "PUBLISHED",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        houseRules: "No smoking. Quiet hours begin at 22:00.",
        cancellationPolicy: "Free cancellation until seven days before arrival.",
        images: {
          create: [{ url: property.cover, alt: property.name, isCover: true }],
        },
        themeConfig: {
          create: {
            config: {
              mode: "system",
              primary: "#1F6F5F",
              accent: "#D98D5F",
              radius: "lg",
              font: "manrope",
            },
          },
        },
        layoutConfigs: {
          create: {
            page: "home",
            config: {
              sections: [
                { id: "hero-1", type: "hero", enabled: true, order: 1 },
                { id: "rooms-1", type: "room-list", enabled: true, order: 2 },
              ],
            },
          },
        },
      },
    });

    const existingRooms = await prisma.room.count({ where: { homestayId: homestay.id } });
    if (existingRooms === 0) {
      await Promise.all(
        Array.from({ length: 4 }, (_, roomIndex) =>
          prisma.room.create({
            data: {
              homestayId: homestay.id,
              roomTypeId: roomTypes[(propertyIndex * 2 + roomIndex) % roomTypes.length].id,
              name: `${property.name} Room ${roomIndex + 1}`,
              description: "A comfortable room with thoughtful local details.",
              maxGuests: roomIndex % 2 === 0 ? 2 : 4,
              basePrice: 68 + roomIndex * 18 + propertyIndex * 10,
              hourlyPrice: 16 + roomIndex * 4 + propertyIndex * 2,
              overnightPrice: 48 + roomIndex * 10 + propertyIndex * 6,
              dailyPrice: 68 + roomIndex * 18 + propertyIndex * 10,
              minHours: roomIndex % 2 === 0 ? 2 : 3,
              maxHours: 12,
              status: "ACTIVE",
            },
          }),
        ),
      );
    }
  }

  await prisma.dashboardLayoutConfig.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      config: {
        widgets: ["revenue", "occupancy", "recent-bookings", "upcoming-check-ins"],
      },
    },
  });

  await prisma.aIKnowledgeBaseItem.createMany({
    data: [
      {
        title: "Check-in and check-out",
        category: "arrival",
        content: "Check-in begins at 2 PM and check-out is by 11 AM.",
      },
      {
        title: "Availability policy",
        category: "booking",
        content: "Availability must always be verified by the booking service.",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
