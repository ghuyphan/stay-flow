import { z } from "zod";

export const homestayInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  location: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
  priceFrom: z.number().positive().max(100000),
  image: z.string().url(),
});

export const roomInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(1000),
  guests: z.number().int().min(1).max(20),
  beds: z.string().trim().min(2).max(100),
  size: z.string().trim().min(1).max(40),
  hourlyPrice: z.number().positive().max(100000),
  overnightPrice: z.number().positive().max(100000),
  dailyPrice: z.number().positive().max(100000),
  minHours: z.number().int().min(1).max(24),
  maxHours: z.number().int().min(1).max(24),
  price: z.number().positive().max(100000),
  image: z.string().url(),
  remaining: z.number().int().min(0).max(100),
}).refine((room) => room.maxHours >= room.minHours, {
  message: "Max hours must be greater than or equal to min hours.",
  path: ["maxHours"],
});
