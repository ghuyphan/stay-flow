import { z } from "zod";

export const createBookingSchema = z
  .object({
    homestayId: z.string().min(1),
    roomId: z.string().min(1),
    stayType: z.enum(["hourly", "overnight", "daily"]).default("daily"),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guestCount: z.number().int().positive().max(20),
    customerName: z.string().trim().min(2).max(100),
    customerEmail: z.string().email(),
    customerPhone: z.string().trim().max(30).optional(),
    specialRequest: z.string().trim().max(1000).optional(),
    selectedOvernightOptionId: z.string().optional(),
  })
  .refine((value) => value.checkOut > value.checkIn, {
    message: "Giờ trả phòng phải sau giờ nhận phòng.",
    path: ["checkOut"],
  });
