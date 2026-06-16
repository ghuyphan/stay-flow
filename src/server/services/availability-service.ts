export const blockingBookingStatuses = [
  "pending_payment",
  "paid",
  "confirmed",
  "checked_in",
] as const;

type BookingWindow = {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
};

export function datesOverlap(
  existing: Pick<BookingWindow, "checkIn" | "checkOut">,
  requested: Pick<BookingWindow, "checkIn" | "checkOut">,
) {
  return existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn;
}

export function hasBookingConflict(
  bookings: BookingWindow[],
  request: Pick<BookingWindow, "roomId" | "checkIn" | "checkOut">,
) {
  return bookings.some(
    (booking) =>
      booking.roomId === request.roomId &&
      blockingBookingStatuses.includes(
        booking.status as (typeof blockingBookingStatuses)[number],
      ) &&
      datesOverlap(booking, request),
  );
}
