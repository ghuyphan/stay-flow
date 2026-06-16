import { describe, expect, it } from "vitest";
import { datesOverlap, hasBookingConflict } from "./availability-service";

describe("availability rules", () => {
  const existing = {
    roomId: "room-1",
    checkIn: new Date("2026-07-10"),
    checkOut: new Date("2026-07-13"),
    status: "confirmed",
  };

  it("detects a real overlap", () => {
    expect(
      datesOverlap(existing, {
        checkIn: new Date("2026-07-12"),
        checkOut: new Date("2026-07-15"),
      }),
    ).toBe(true);
  });

  it("allows adjacent stays", () => {
    expect(
      datesOverlap(existing, {
        checkIn: new Date("2026-07-13"),
        checkOut: new Date("2026-07-15"),
      }),
    ).toBe(false);
  });

  it("ignores cancelled bookings", () => {
    expect(
      hasBookingConflict(
        [{ ...existing, status: "cancelled" }],
        {
          roomId: "room-1",
          checkIn: new Date("2026-07-11"),
          checkOut: new Date("2026-07-12"),
        },
      ),
    ).toBe(false);
  });
});
