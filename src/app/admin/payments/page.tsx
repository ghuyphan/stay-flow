import { PageHeader } from "@/components/layout/page-header";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Card } from "@/components/ui/card";
import { appRepository } from "@/server/repositories/app-repository";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const paymentStatusLabels: Record<string, string> = {
  paid: "Đã thanh toán",
  pending: "Đang xử lý",
  unpaid: "Chưa thanh toán",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export default async function PaymentsPage() {
  const bookings = await appRepository.listBookings();
  return (
    <div>
      <PageHeader title="Thanh toán" description={`${bookings.length} giao dịch`} />
      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between gap-3 bg-muted/35 p-4">
          <div>
            <h2 className="font-semibold">Giao dịch</h2>
            <p className="mt-1 text-sm text-muted-foreground">Trạng thái thanh toán đi theo cập nhật đơn đặt phòng và phản hồi từ cổng thanh toán.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/25 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Mã đơn</th><th className="px-4 py-3">Khách</th><th className="px-4 py-3">Số tiền</th><th className="px-4 py-3">Thanh toán</th><th className="px-4 py-3 text-right">Đặt phòng</th></tr></thead>
          <tbody className="[&_tr+tr]:shadow-[0_-1px_0_rgb(24_32_29_/_0.05)]">{bookings.map((booking) => <tr key={booking.bookingRef}><td className="px-4 py-3.5 font-mono text-xs">{booking.bookingRef}</td><td className="px-4 py-3.5">{booking.customerName}</td><td className="px-4 py-3.5 font-semibold">{formatCurrency(booking.total)}</td><td className="px-4 py-3.5">{paymentStatusLabels[booking.paymentStatus] ?? booking.paymentStatus}</td><td className="px-4 py-3.5 text-right"><BookingStatusBadge status={booking.status} /></td></tr>)}</tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
