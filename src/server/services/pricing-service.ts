import { differenceInCalendarDays, differenceInMinutes } from "date-fns";
import type { OvernightOption, StayType } from "@/lib/types";

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
  if (nights < 1) throw new Error("Giờ trả phòng phải sau giờ nhận phòng.");

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
    currency: "VND",
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
  hourlyBlockHours,
  hourlyBlockPrice,
  hourlyExtraHourPrice,
  overnightOptions,
  selectedOvernightOptionId,
}: {
  stayType: StayType;
  hourlyRate?: number | null;
  overnightRate?: number | null;
  dailyRate: number;
  checkIn: Date;
  checkOut: Date;
  discount?: number;
  hourlyBlockHours?: number;
  hourlyBlockPrice?: number;
  hourlyExtraHourPrice?: number;
  overnightOptions?: OvernightOption[];
  selectedOvernightOptionId?: string;
}): PriceQuote {
  if (checkOut <= checkIn) throw new Error("Giờ trả phòng phải sau giờ nhận phòng.");

  const rawHours = differenceInMinutes(checkOut, checkIn) / 60;
  const durationHours = Math.max(1, Math.ceil(rawHours));
  const nights = Math.max(0, differenceInCalendarDays(checkOut, checkIn));

  let subtotal = 0;
  let durationLabel = "";
  let units = 1;

  if (stayType === "hourly") {
    if (
      hourlyBlockHours !== undefined &&
      hourlyBlockPrice !== undefined &&
      hourlyExtraHourPrice !== undefined
    ) {
      if (durationHours <= hourlyBlockHours) {
        subtotal = hourlyBlockPrice;
      } else {
        subtotal = hourlyBlockPrice + (durationHours - hourlyBlockHours) * hourlyExtraHourPrice;
      }
    } else {
      subtotal = (hourlyRate ?? 450000) * durationHours;
    }
    units = durationHours;
    durationLabel = `${durationHours} hour${durationHours === 1 ? "" : "s"}`;
  } else if (stayType === "overnight") {
    if (overnightOptions && overnightOptions.length > 0) {
      const option =
        overnightOptions.find((opt) => opt.id === selectedOvernightOptionId) ??
        overnightOptions[0];
      subtotal = option ? option.price : (overnightRate ?? 1225000);
      durationLabel = option ? `overnight (${option.checkInTime}-${option.checkOutTime})` : "overnight";
    } else {
      subtotal = overnightRate ?? 1225000;
      durationLabel = "overnight";
    }
    units = 1;
  } else {
    // daily
    units = Math.max(1, nights);
    subtotal = dailyRate * units;
    durationLabel = `${units} day${units === 1 ? "" : "s"}`;
  }

  const fees = Math.round(subtotal * 0.08);
  const taxes = Math.round(subtotal * 0.1);
  const total = Math.max(0, subtotal + fees + taxes - discount);

  return {
    nights: stayType === "daily" ? units : stayType === "overnight" ? 1 : 0,
    durationHours,
    stayType,
    durationLabel,
    subtotal,
    fees,
    taxes,
    discount,
    total,
    currency: "VND",
  };
}
