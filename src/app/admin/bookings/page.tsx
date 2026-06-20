import { AdminBookingTable } from "@/components/admin/admin-booking-table";
import { PageHeader } from "@/components/layout/page-header";
import { appRepository } from "@/server/repositories/app-repository";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await appRepository.listBookings();
  return (
    <div>
      <PageHeader title="Đặt phòng" description={`${bookings.length} đơn đặt phòng`} />
      <AdminBookingTable initialBookings={bookings} />
    </div>
  );
}
