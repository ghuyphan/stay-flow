import { AdminOverviewClient } from "@/components/admin/admin-overview-client";
import { appRepository } from "@/server/repositories/app-repository";

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
    <AdminOverviewClient
      recentBookings={recentBookings}
      revenue={revenue}
      activeBookings={activeBookings}
      pendingTotal={pendingTotal}
    />
  );
}
