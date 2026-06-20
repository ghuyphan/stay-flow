import { z } from "zod";

export const homestayInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  location: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
  priceFrom: z.number().positive().max(100000000),
  image: z.string().url(),
});

export const overnightOptionSchema = z.object({
  id: z.string(),
  labelEn: z.string().trim().min(2),
  labelVi: z.string().trim().min(2),
  checkInTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
  checkOutTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
  price: z.number().positive(),
});

export const roomInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(1000),
  guests: z.number().int().min(1).max(20),
  beds: z.string().trim().min(2).max(100),
  size: z.string().trim().min(1).max(40),
  hourlyPrice: z.number().positive().max(100000000).optional(),
  overnightPrice: z.number().positive().max(100000000).optional(),
  dailyPrice: z.number().positive().max(100000000),
  hourlyBlockHours: z.number().int().min(1).max(24),
  hourlyBlockPrice: z.number().positive().max(100000000),
  hourlyExtraHourPrice: z.number().nonnegative().max(100000000),
  overnightOptions: z.array(overnightOptionSchema),
  minHours: z.number().int().min(1).max(24),
  maxHours: z.number().int().min(1).max(24),
  price: z.number().positive().max(100000000),
  image: z.string().url(),
  gallery: z.array(z.string().url()).min(1).max(12).optional(),
  remaining: z.number().int().min(0).max(100),
}).refine((room) => room.maxHours >= room.minHours, {
  message: "Số giờ tối đa phải lớn hơn hoặc bằng số giờ tối thiểu.",
  path: ["maxHours"],
});
