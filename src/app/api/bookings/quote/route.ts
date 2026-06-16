import { NextResponse } from "next/server";
import { z } from "zod";
import { appRepository } from "@/server/repositories/app-repository";
import { calculateStayPrice } from "@/server/services/pricing-service";

const quoteSchema = z
  .object({
    roomId: z.string(),
    stayType: z.enum(["hourly", "overnight", "daily"]).default("daily"),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  })
  .refine((value) => value.checkOut > value.checkIn, { path: ["checkOut"] });

export async function POST(request: Request) {
  const parsed = quoteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking dates." }, { status: 400 });
  }

  const room = (await appRepository.listHomestays())
    .flatMap((homestay) => homestay.rooms)
    .find(({ id }) => id === parsed.data.roomId);
  if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });

  return NextResponse.json(
    calculateStayPrice({
      stayType: parsed.data.stayType,
      hourlyRate: room.hourlyPrice,
      overnightRate: room.overnightPrice,
      dailyRate: room.dailyPrice,
      checkIn: parsed.data.checkIn,
      checkOut: parsed.data.checkOut,
    }),
  );
}
