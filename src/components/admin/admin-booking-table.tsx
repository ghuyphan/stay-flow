"use client";

import { Download, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { StoredBooking } from "@/server/repositories/app-repository";
import { formatCurrency } from "@/lib/utils";

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
      ["Reference", "Guest", "Property", "Room", "Stay type", "Duration", "Total", "Status"],
      ...filtered.map((booking) => [
        booking.bookingRef,
        booking.customerName,
        booking.homestayName,
        booking.roomName,
        booking.stayType,
        booking.durationLabel,
        String(booking.total),
        booking.status,
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
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search bookings" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-[var(--radius-md)] border bg-background px-3 text-sm">
          <option value="all">All statuses</option>
          <option value="pending_payment">Pending payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked in</option>
          <option value="checked_out">Checked out</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button variant="outline" onClick={exportCsv}><Download className="size-4" /> Export</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-muted/25 text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Stay</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
          </thead>
          <tbody className="[&_tr+tr]:shadow-[0_-1px_0_rgb(24_32_29_/_0.05)]">
            {filtered.map((booking) => (
              <tr key={booking.bookingRef}>
                <td className="px-4 py-3.5"><p className="font-semibold">{booking.customerName}</p><p className="text-xs text-muted-foreground">{booking.bookingRef}</p></td>
                <td className="px-4 py-3.5"><p>{booking.homestayName}</p><p className="text-xs text-muted-foreground">{booking.roomName} · {booking.stayType} · {booking.durationLabel}</p></td>
                <td className="px-4 py-3.5 font-semibold">{formatCurrency(booking.total)}</td>
                <td className="px-4 py-3.5"><BookingStatusBadge status={booking.status} /></td>
                <td className="px-4 py-3.5 text-right">
                  {updating === booking.bookingRef ? <Loader2 className="ml-auto size-4 animate-spin" /> : (
                    <select
                      aria-label={`Update ${booking.bookingRef}`}
                      value=""
                      onChange={(event) => {
                        const action = event.target.value as "confirm" | "check_in" | "check_out" | "cancel";
                        if (action) void update(booking.bookingRef, action);
                      }}
                      className="min-h-9 rounded-lg border bg-background px-2 text-xs"
                    >
                      <option value="">Update...</option>
                      <option value="confirm">Confirm</option>
                      <option value="check_in">Check in</option>
                      <option value="check_out">Check out</option>
                      <option value="cancel">Cancel</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No bookings match.</p> : null}
      </div>
    </Card>
  );
}
