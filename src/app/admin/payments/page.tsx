import { PageHeader } from "@/components/layout/page-header";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { appRepository } from "@/server/repositories/app-repository";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const bookings = await appRepository.listBookings();
  return (
    <div>
      <PageHeader title="Payments" description={`${bookings.length} transactions`} />
      <div className="mt-5 overflow-x-auto rounded-[var(--radius-lg)] bg-card shadow-[var(--shadow-sm)] ring-1 ring-black/[0.035]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/25 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Guest</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3 text-right">Booking</th></tr></thead>
          <tbody className="[&_tr+tr]:shadow-[0_-1px_0_rgb(24_32_29_/_0.05)]">{bookings.map((booking) => <tr key={booking.bookingRef}><td className="px-4 py-3.5 font-mono text-xs">{booking.bookingRef}</td><td className="px-4 py-3.5">{booking.customerName}</td><td className="px-4 py-3.5 font-semibold">{formatCurrency(booking.total)}</td><td className="px-4 py-3.5 capitalize">{booking.paymentStatus}</td><td className="px-4 py-3.5 text-right"><BookingStatusBadge status={booking.status} /></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
