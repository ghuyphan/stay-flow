import { appRepository } from "@/server/repositories/app-repository";
import { hasBookingConflict } from "@/server/services/availability-service";
import { calculateStayPrice } from "@/server/services/pricing-service";
import { createBookingSchema } from "@/server/validation/booking";

export async function createBooking(input: unknown) {
  const parsed = createBookingSchema.parse(input);
  const homestay = await appRepository.getHomestay(parsed.homestayId);
  const room = homestay?.rooms.find((item) => item.id === parsed.roomId);
  if (!homestay || !room) throw new Error("Room not found.");
  if (parsed.guestCount > room.guests) throw new Error(`This room allows up to ${room.guests} guests.`);

  const existingBookings = await appRepository.listBookings();
  const conflict = hasBookingConflict(
    existingBookings.map((booking) => ({
      roomId: booking.roomId,
      checkIn: new Date(booking.checkIn),
      checkOut: new Date(booking.checkOut),
      status: booking.status,
    })),
    { roomId: room.id, checkIn: parsed.checkIn, checkOut: parsed.checkOut },
  );
  if (conflict) throw new Error("This room is no longer available for that time.");

  const quote = calculateStayPrice({
    stayType: parsed.stayType,
    hourlyRate: room.hourlyPrice,
    overnightRate: room.overnightPrice,
    dailyRate: room.dailyPrice,
    checkIn: parsed.checkIn,
    checkOut: parsed.checkOut,
  });

  return appRepository.createBooking({
    homestayId: homestay.id,
    homestayName: homestay.name,
    roomId: room.id,
    roomName: room.name,
    checkIn: parsed.checkIn.toISOString(),
    checkOut: parsed.checkOut.toISOString(),
    guestCount: parsed.guestCount,
    ...quote,
    status: "pending_payment",
    paymentStatus: "pending",
    customerName: parsed.customerName,
    customerEmail: parsed.customerEmail,
    customerPhone: parsed.customerPhone,
    specialRequest: parsed.specialRequest,
  });
}
