import { NextResponse } from "next/server";
import { appRepository } from "@/server/repositories/app-repository";
import { z } from "zod";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ bookingRef: string }> },
) {
  const reference = (await params).bookingRef;
  const parsed = z.object({ accessToken: z.string().min(20) }).safeParse(await _request.json());
  const existing = await appRepository.getBooking(reference);
  if (!parsed.success || !existing || parsed.data.accessToken !== existing.accessToken) {
    return NextResponse.json({ error: "Booking verification failed." }, { status: 403 });
  }
  const booking = await appRepository.updateBooking(reference, {
    status: "confirmed",
    paymentStatus: "paid",
  });
  return booking
    ? NextResponse.json(booking)
    : NextResponse.json({ error: "Booking not found." }, { status: 404 });
}
