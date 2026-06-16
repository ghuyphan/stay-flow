import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { appRepository } from "@/server/repositories/app-repository";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookingStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingRef: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const booking = await appRepository.getBooking((await params).bookingRef);
  if (!booking) notFound();
  const { token } = await searchParams;
  if (!token || token !== booking.accessToken) notFound();

  return (
    <Container className="max-w-3xl py-12 lg:py-20">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="size-8 text-success" />
        <div>
          <BookingStatusBadge status={booking.status} />
          <h1 className="mt-2 font-display text-4xl font-semibold">Your stay at {booking.homestayName}</h1>
        </div>
      </div>
      <div className="mt-10 grid gap-6 rounded-[var(--radius-lg)] bg-card p-6 shadow-[var(--shadow-sm)] sm:grid-cols-2">
        <div><p className="text-xs text-muted-foreground">Booking reference</p><p className="mt-1 font-semibold">{booking.bookingRef}</p></div>
        <div><p className="text-xs text-muted-foreground">Room</p><p className="mt-1 font-semibold">{booking.roomName}</p></div>
        <div><p className="text-xs text-muted-foreground">Time</p><p className="mt-1 font-semibold">{format(new Date(booking.checkIn), "MMM d, HH:mm")} – {format(new Date(booking.checkOut), "MMM d, HH:mm")}</p></div>
        <div><p className="text-xs text-muted-foreground">Stay type</p><p className="mt-1 font-semibold capitalize">{booking.stayType} · {booking.durationLabel}</p></div>
        <div><p className="text-xs text-muted-foreground">Total</p><p className="mt-1 font-semibold">{formatCurrency(booking.total)}</p></div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild><Link href="/homestays">Browse more stays</Link></Button>
        {!["cancelled", "checked_in", "checked_out", "refunded"].includes(booking.status) ? (
          <CancelBookingButton bookingRef={booking.bookingRef} accessToken={token} />
        ) : null}
      </div>
    </Container>
  );
}
