import { format } from "date-fns";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PaymentActions } from "@/components/booking/payment-actions";
import { Container } from "@/components/layout/container";
import { appRepository } from "@/server/repositories/app-repository";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaymentPage({
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
  if (booking.paymentStatus === "paid") redirect(`/booking/${booking.bookingRef}/status?token=${token}`);

  return (
    <Container className="max-w-5xl py-10 lg:py-16">
      <Link href={`/homestays`} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Back to stays
      </Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold text-primary">Booking {booking.bookingRef}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Review and pay</h1>
          <div className="mt-8 rounded-[var(--radius-lg)] bg-card p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-xl font-semibold">{booking.roomName}</h2>
            <p className="mt-1 text-muted-foreground">{booking.homestayName}</p>
            <dl className="mt-6 grid gap-5 sm:grid-cols-3">
              <div><dt className="text-xs text-muted-foreground">Check-in</dt><dd className="mt-1 font-semibold">{format(new Date(booking.checkIn), "MMM d, HH:mm")}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Check-out</dt><dd className="mt-1 font-semibold">{format(new Date(booking.checkOut), "MMM d, HH:mm")}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Guests</dt><dd className="mt-1 font-semibold">{booking.guestCount}</dd></div>
            </dl>
          </div>
          <div className="mt-7">
            <h2 className="font-semibold">Guest</h2>
            <p className="mt-2 text-sm text-muted-foreground">{booking.customerName} · {booking.customerEmail}</p>
          </div>
        </div>
        <aside className="h-fit rounded-[var(--radius-lg)] bg-card p-6 shadow-[var(--shadow-sm)]">
          <h2 className="font-semibold">Price</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{booking.stayType} · {booking.durationLabel}</span><span>{formatCurrency(booking.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatCurrency(booking.fees)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Taxes</span><span>{formatCurrency(booking.taxes)}</span></div>
            <div className="flex justify-between rounded-xl bg-muted/45 p-3 text-lg font-semibold"><span>Total</span><span>{formatCurrency(booking.total)}</span></div>
          </div>
          <div className="mt-6"><PaymentActions bookingRef={booking.bookingRef} accessToken={token} /></div>
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> Payment state is confirmed on the server</p>
        </aside>
      </div>
    </Container>
  );
}
