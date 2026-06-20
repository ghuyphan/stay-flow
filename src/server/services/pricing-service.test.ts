import { describe, expect, it } from "vitest";
import { calculatePrice, calculateStayPrice } from "./pricing-service";

describe("calculatePrice", () => {
  it("calculates nights and server fees", () => {
    expect(
      calculatePrice({
        nightlyRate: 2500000,
        checkIn: new Date("2026-08-01"),
        checkOut: new Date("2026-08-04"),
      }),
    ).toEqual({
      nights: 3,
      durationHours: 72,
      stayType: "daily",
      durationLabel: "3 nights",
      subtotal: 7500000,
      fees: 600000,
      taxes: 750000,
      discount: 0,
      total: 8850000,
      currency: "VND",
    });
  });

  it("calculates hourly stays", () => {
    expect(
      calculateStayPrice({
        stayType: "hourly",
        hourlyRate: 500000,
        overnightRate: 1500000,
        dailyRate: 2500000,
        checkIn: new Date("2026-08-01T14:00:00"),
        checkOut: new Date("2026-08-01T18:00:00"),
      }),
    ).toMatchObject({
      stayType: "hourly",
      durationHours: 4,
      durationLabel: "4 hours",
      subtotal: 2000000,
      total: 2360000,
    });
  });

  it("calculates overnight stays as one package", () => {
    expect(
      calculateStayPrice({
        stayType: "overnight",
        hourlyRate: 500000,
        overnightRate: 1500000,
        dailyRate: 2500000,
        checkIn: new Date("2026-08-01T21:00:00"),
        checkOut: new Date("2026-08-02T09:00:00"),
      }),
    ).toMatchObject({
      stayType: "overnight",
      durationHours: 12,
      durationLabel: "overnight",
      subtotal: 1500000,
      total: 1770000,
    });
  });
});
