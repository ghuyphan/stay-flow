import { describe, expect, it } from "vitest";
import { calculatePrice, calculateStayPrice } from "./pricing-service";

describe("calculatePrice", () => {
  it("calculates nights and server fees", () => {
    expect(
      calculatePrice({
        nightlyRate: 100,
        checkIn: new Date("2026-08-01"),
        checkOut: new Date("2026-08-04"),
      }),
    ).toEqual({
      nights: 3,
      durationHours: 72,
      stayType: "daily",
      durationLabel: "3 nights",
      subtotal: 300,
      fees: 24,
      taxes: 30,
      discount: 0,
      total: 354,
      currency: "USD",
    });
  });

  it("calculates hourly stays", () => {
    expect(
      calculateStayPrice({
        stayType: "hourly",
        hourlyRate: 20,
        overnightRate: 60,
        dailyRate: 100,
        checkIn: new Date("2026-08-01T14:00:00"),
        checkOut: new Date("2026-08-01T18:00:00"),
      }),
    ).toMatchObject({
      stayType: "hourly",
      durationHours: 4,
      durationLabel: "4 hours",
      subtotal: 80,
      total: 94,
    });
  });

  it("calculates overnight stays as one package", () => {
    expect(
      calculateStayPrice({
        stayType: "overnight",
        hourlyRate: 20,
        overnightRate: 60,
        dailyRate: 100,
        checkIn: new Date("2026-08-01T21:00:00"),
        checkOut: new Date("2026-08-02T09:00:00"),
      }),
    ).toMatchObject({
      stayType: "overnight",
      durationHours: 12,
      durationLabel: "overnight",
      subtotal: 60,
      total: 71,
    });
  });
});
