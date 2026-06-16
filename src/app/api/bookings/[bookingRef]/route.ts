import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/session";
import { appRepository } from "@/server/repositories/app-repository";

const updateSchema = z.object({
  action: z.enum(["cancel", "confirm", "check_in", "check_out", "refund"]),
  accessToken: z.string().optional(),
});

const actionChanges = {
  cancel: { status: "cancelled", paymentStatus: "refunded" },
  confirm: { status: "confirmed" },
  check_in: { status: "checked_in" },
  check_out: { status: "checked_out" },
  refund: { status: "refunded", paymentStatus: "refunded" },
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingRef: string }> },
) {
  const booking = await appRepository.getBooking((await params).bookingRef);
  return booking
    ? NextResponse.json(booking)
    : NextResponse.json({ error: "Booking not found." }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingRef: string }> },
) {
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking action." }, { status: 400 });
  }
  const reference = (await params).bookingRef;
  const existing = await appRepository.getBooking(reference);
  if (!existing) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  const admin = await verifyAdminSession(
    (await cookies()).get("stayflow_admin")?.value,
    process.env.SESSION_SECRET ?? "stayflow-local-session",
  );
  const guestCancellation =
    parsed.data.action === "cancel" && parsed.data.accessToken === existing.accessToken;
  if (!admin && !guestCancellation) {
    return NextResponse.json({ error: "Booking verification failed." }, { status: 403 });
  }
  const booking = await appRepository.updateBooking(
    reference,
    actionChanges[parsed.data.action],
  );
  return booking
    ? NextResponse.json(booking)
    : NextResponse.json({ error: "Booking not found." }, { status: 404 });
}
