import { differenceInCalendarDays, differenceInMinutes } from "date-fns";
import type { StayType } from "@/lib/types";

export type PriceQuote = {
  nights: number;
  durationHours: number;
  stayType: StayType;
  durationLabel: string;
  subtotal: number;
  fees: number;
  taxes: number;
  discount: number;
  total: number;
  currency: string;
};

export function calculatePrice({
  nightlyRate,
  checkIn,
  checkOut,
  discount = 0,
}: {
  nightlyRate: number;
  checkIn: Date;
  checkOut: Date;
  discount?: number;
}): PriceQuote {
  const nights = differenceInCalendarDays(checkOut, checkIn);
  if (nights < 1) throw new Error("Check-out must be after check-in.");

  const subtotal = nightlyRate * nights;
  const fees = Math.round(subtotal * 0.08);
  const taxes = Math.round(subtotal * 0.1);
  const total = Math.max(0, subtotal + fees + taxes - discount);

  return {
    nights,
    durationHours: nights * 24,
    stayType: "daily",
    durationLabel: `${nights} night${nights === 1 ? "" : "s"}`,
    subtotal,
    fees,
    taxes,
    discount,
    total,
    currency: "USD",
  };
}

export function calculateStayPrice({
  stayType,
  hourlyRate,
  overnightRate,
  dailyRate,
  checkIn,
  checkOut,
  discount = 0,
}: {
  stayType: StayType;
  hourlyRate: number;
  overnightRate: number;
  dailyRate: number;
  checkIn: Date;
  checkOut: Date;
  discount?: number;
}): PriceQuote {
  if (checkOut <= checkIn) throw new Error("Check-out must be after check-in.");

  const rawHours = differenceInMinutes(checkOut, checkIn) / 60;
  const durationHours = Math.max(1, Math.ceil(rawHours));
  const nights = Math.max(0, differenceInCalendarDays(checkOut, checkIn));
  const units =
    stayType === "hourly"
      ? durationHours
      : stayType === "overnight"
        ? 1
        : Math.max(1, nights);
  const unitRate =
    stayType === "hourly"
      ? hourlyRate
      : stayType === "overnight"
        ? overnightRate
        : dailyRate;

  const subtotal = unitRate * units;
  const fees = Math.round(subtotal * 0.08);
  const taxes = Math.round(subtotal * 0.1);
  const total = Math.max(0, subtotal + fees + taxes - discount);
  const durationLabel =
    stayType === "hourly"
      ? `${durationHours} hour${durationHours === 1 ? "" : "s"}`
      : stayType === "overnight"
        ? "overnight"
        : `${units} day${units === 1 ? "" : "s"}`;

  return { nights: units, durationHours, stayType, durationLabel, subtotal, fees, taxes, discount, total, currency: "USD" };
}
