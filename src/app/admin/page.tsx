import { ArrowRight, CalendarCheck, CircleDollarSign, Clock3, Hotel, MoreHorizontal, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AdminStatsCard } from "@/components/admin/admin-stats-card";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appRepository } from "@/server/repositories/app-repository";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const recentBookings = (await appRepository.listBookings()).slice(0, 4);
  const revenue = recentBookings
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce((total, booking) => total + booking.total, 0);
  const activeBookings = recentBookings.filter((booking) =>
    ["pending_payment", "paid", "confirmed", "checked_in"].includes(booking.status),
  ).length;
  const pendingTotal = recentBookings
    .filter((booking) => booking.paymentStatus === "pending")
    .reduce((total, booking) => total + booking.total, 0);
  return (
    <div>
      <PageHeader
        title="Overview"
        description="Today across your stays"
        action={<Button asChild><Link href="/admin/homestays">Manage properties</Link></Button>}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard label="Revenue this month" value={formatCurrency(revenue)} change="12.4%" trend="up" icon={CircleDollarSign} />
        <AdminStatsCard label="Occupancy rate" value="78.6%" change="5.2%" trend="up" icon={Hotel} />
        <AdminStatsCard label="Active bookings" value={String(activeBookings)} change="Live" trend="up" icon={CalendarCheck} />
        <AdminStatsCard label="Pending payments" value={formatCurrency(pendingTotal)} change="Needs review" trend="down" icon={Clock3} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between bg-muted/35 p-4">
            <div><h2 className="font-semibold">Recent bookings</h2><p className="mt-1 text-sm text-muted-foreground">Latest activity across all properties</p></div>
            <Button asChild variant="ghost" size="sm"><Link href="/admin/bookings">View all <ArrowRight className="size-4" /></Link></Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-5 py-3 font-semibold">Guest</th><th className="px-5 py-3 font-semibold">Property</th><th className="px-5 py-3 font-semibold">Total</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3"><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody className="[&_tr+tr]:shadow-[0_-1px_0_rgb(24_32_29_/_0.05)]">
                {recentBookings.map((booking) => (
                  <tr key={booking.bookingRef} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5"><p className="font-semibold">{booking.customerName}</p><p className="text-xs text-muted-foreground">{booking.bookingRef}</p></td>
                    <td className="px-5 py-3.5 text-muted-foreground">{booking.homestayName}</td>
                    <td className="px-5 py-3.5 font-medium">{formatCurrency(booking.total)}</td>
                    <td className="px-5 py-3.5"><BookingStatusBadge status={booking.status} /></td>
                    <td className="px-5 py-3.5"><Link href="/admin/bookings" aria-label={`Actions for ${booking.bookingRef}`}><MoreHorizontal className="size-4" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="grid gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between"><div><h2 className="font-semibold">Revenue pulse</h2><p className="mt-1 text-sm text-muted-foreground">Last 7 days</p></div><TrendingUp className="size-5 text-primary" /></div>
            <div className="mt-8 flex h-40 items-end gap-3" aria-label="Revenue bar chart">
              {[42, 58, 48, 72, 65, 88, 76].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-primary/15 hover:bg-primary" style={{ height: `${height}%` }} />)}
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Jun 9</span><span>Jun 15</span></div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">Today at a glance</h2>
            <div className="mt-5 grid gap-4">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Arrivals</span><span className="font-semibold">6</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Departures</span><span className="font-semibold">4</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Rooms occupied</span><span className="font-semibold">17 / 22</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
