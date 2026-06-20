"use client";

import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoredBooking } from "@/server/repositories/app-repository";
import { formatCurrency } from "@/lib/utils";

const stayTypeLabels: Record<string, string> = {
  short: "Theo giờ",
  hourly: "Theo giờ",
  day: "Một ngày",
  daily: "Một ngày",
  overnight: "Qua đêm",
};

const bookingStatusLabels: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  confirmed: "Đã xác nhận",
  checked_in: "Đã nhận phòng",
  checked_out: "Đã trả phòng",
  cancelled: "Đã hủy",
};

function localizeDuration(label: string) {
  return label
    .replace(/\bhours\b/gi, "giờ")
    .replace(/\bhour\b/gi, "giờ")
    .replace(/\bdays\b/gi, "ngày")
    .replace(/\bday\b/gi, "ngày")
    .replace(/\bnights\b/gi, "đêm")
    .replace(/\bnight\b/gi, "đêm");
}

export function AdminBookingTable({ initialBookings }: { initialBookings: StoredBooking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [updating, setUpdating] = useState("");

  const filtered = useMemo(
    () =>
      bookings.filter((booking) => {
        const matchesQuery = `${booking.customerName} ${booking.bookingRef} ${booking.homestayName}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesQuery && (status === "all" || booking.status === status);
      }),
    [bookings, query, status],
  );

  async function update(reference: string, action: "confirm" | "check_in" | "check_out" | "cancel") {
    setUpdating(reference);
    const response = await fetch(`/api/bookings/${reference}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (response.ok) {
      const result = (await response.json()) as StoredBooking;
      setBookings((current) =>
        current.map((booking) => (booking.bookingRef === reference ? result : booking)),
      );
    }
    setUpdating("");
  }

  function exportCsv() {
    const rows = [
      ["Mã đơn", "Khách", "Cơ sở", "Phòng", "Kiểu lưu trú", "Thời lượng", "Tổng tiền", "Trạng thái"],
      ...filtered.map((booking) => [
        booking.bookingRef,
        booking.customerName,
        booking.homestayName,
        booking.roomName,
        stayTypeLabels[booking.stayType] ?? booking.stayType,
        localizeDuration(booking.durationLabel),
        String(booking.total),
        bookingStatusLabels[booking.status] ?? booking.status,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "stayflow-bookings.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="mt-5 overflow-hidden">
      <div className="flex flex-col gap-3 bg-muted/35 p-4 md:flex-row md:items-center">
        <label className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Tìm đơn đặt phòng" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-[var(--radius-md)] border bg-background px-3 text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending_payment">Chờ thanh toán</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="checked_in">Đã nhận phòng</option>
          <option value="checked_out">Đã trả phòng</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <Button variant="outline" onClick={exportCsv}><Download className="size-4" /> Xuất CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-muted/25 text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Mã đơn</th><th className="px-4 py-3">Lưu trú</th><th className="px-4 py-3">Tổng tiền</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
          </thead>
          <tbody className="[&_tr+tr]:shadow-[0_-1px_0_rgb(24_32_29_/_0.05)]">
            {filtered.map((booking) => (
              <tr key={booking.bookingRef}>
                <td className="px-4 py-3.5"><p className="font-semibold">{booking.customerName}</p><p className="text-xs text-muted-foreground">{booking.bookingRef}</p></td>
                <td className="px-4 py-3.5"><p>{booking.homestayName}</p><p className="text-xs text-muted-foreground">{booking.roomName} · {stayTypeLabels[booking.stayType] ?? booking.stayType} · {localizeDuration(booking.durationLabel)}</p></td>
                <td className="px-4 py-3.5 font-semibold">{formatCurrency(booking.total)}</td>
                <td className="px-4 py-3.5"><BookingStatusBadge status={booking.status} /></td>
                <td className="px-4 py-3.5 text-right">
                  {updating === booking.bookingRef ? <Skeleton className="ml-auto h-9 w-28" /> : (
                    <select
                      aria-label={`Cập nhật ${booking.bookingRef}`}
                      value=""
                      onChange={(event) => {
                        const action = event.target.value as "confirm" | "check_in" | "check_out" | "cancel";
                        if (action) void update(booking.bookingRef, action);
                      }}
                      className="min-h-9 rounded-lg border bg-background px-2 text-xs"
                    >
                      <option value="">Cập nhật...</option>
                      <option value="confirm">Xác nhận</option>
                      <option value="check_in">Nhận phòng</option>
                      <option value="check_out">Trả phòng</option>
                      <option value="cancel">Hủy</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">Không có đơn đặt phòng phù hợp.</p> : null}
      </div>
    </Card>
  );
}
