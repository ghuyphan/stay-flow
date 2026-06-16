import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { appRepository } from "@/server/repositories/app-repository";
import { createBooking } from "@/server/services/booking-service";

export async function GET() {
  return NextResponse.json(await appRepository.listBookings());
}

export async function POST(request: Request) {
  try {
    const booking = await createBooking(await request.json());
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues[0]?.message ?? "Invalid booking details."
        : error instanceof Error
          ? error.message
          : "Unable to create booking.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
