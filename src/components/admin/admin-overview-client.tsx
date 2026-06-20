"use client";

import { ArrowRight, CalendarCheck, CircleDollarSign, Clock3, Hotel, MoreHorizontal, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AdminStatsCard } from "@/components/admin/admin-stats-card";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { useLanguage } from "@/components/language-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { StoredBooking } from "@/server/repositories/app-repository";

type AdminOverviewClientProps = {
  recentBookings: StoredBooking[];
  revenue: number;
  activeBookings: number;
  pendingTotal: number;
};

export function AdminOverviewClient({
  recentBookings,
  revenue,
  activeBookings,
  pendingTotal,
}: AdminOverviewClientProps) {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader
        title={t("admin.overview.title")}
        description={t("admin.overview.description")}
        action={
          <Button asChild>
            <Link href="/admin/homestays">{t("admin.overview.manage_properties")}</Link>
          </Button>
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard label={t("admin.stats.revenue_month")} value={formatCurrency(revenue)} change="12.4%" trend="up" icon={CircleDollarSign} />
        <AdminStatsCard label={t("admin.stats.occupancy_rate")} value="78.6%" change="5.2%" trend="up" icon={Hotel} />
        <AdminStatsCard label={t("admin.stats.active_bookings")} value={String(activeBookings)} change={t("admin.stats.live")} trend="up" icon={CalendarCheck} />
        <AdminStatsCard label={t("admin.stats.pending_payments")} value={formatCurrency(pendingTotal)} change={t("admin.stats.needs_review")} trend="down" icon={Clock3} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between bg-muted/35 p-4">
            <div>
              <h2 className="font-semibold">{t("admin.recent_bookings.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("admin.recent_bookings.description")}</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/bookings">
                {t("admin.view_all")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t("admin.table.guest")}</th>
                  <th className="px-5 py-3 font-semibold">{t("admin.table.property")}</th>
                  <th className="px-5 py-3 font-semibold">{t("admin.table.total")}</th>
                  <th className="px-5 py-3 font-semibold">{t("admin.table.status")}</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">{t("admin.table.actions")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr+tr]:shadow-[0_-1px_0_rgb(24_32_29_/_0.05)]">
                {recentBookings.map((booking) => (
                  <tr key={booking.bookingRef} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold">{booking.customerName}</p>
                      <p className="text-xs text-muted-foreground">{booking.bookingRef}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t(booking.homestayName)}</td>
                    <td className="px-5 py-3.5 font-medium">{formatCurrency(booking.total)}</td>
                    <td className="px-5 py-3.5"><BookingStatusBadge status={booking.status} /></td>
                    <td className="px-5 py-3.5">
                      <Link href="/admin/bookings" aria-label={t("admin.table.actions_for", { ref: booking.bookingRef })}>
                        <MoreHorizontal className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="grid gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{t("admin.revenue_pulse.title")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("admin.revenue_pulse.description")}</p>
              </div>
              <TrendingUp className="size-5 text-primary" />
            </div>
            <div className="mt-8 flex h-40 items-end gap-3" aria-label={t("admin.revenue_pulse.chart")}>
              {[42, 58, 48, 72, 65, 88, 76].map((height, index) => (
                <div key={index} className="flex-1 rounded-t-md bg-primary/15 hover:bg-primary" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{t("admin.revenue_pulse.start")}</span>
              <span>{t("admin.revenue_pulse.end")}</span>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">{t("admin.today_glance.title")}</h2>
            <div className="mt-5 grid gap-4">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t("admin.today_glance.arrivals")}</span><span className="font-semibold">6</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t("admin.today_glance.departures")}</span><span className="font-semibold">4</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t("admin.today_glance.rooms_occupied")}</span><span className="font-semibold">17 / 22</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
