"use client";

import { addDays, addHours, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StayType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const startTimes = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
const overnightTimes = ["20:00", "21:00", "22:00", "23:00"];

type Props = {
  homestayId: string;
  roomId: string;
  hourlyPrice: number;
  overnightPrice: number;
  dailyPrice: number;
  minHours: number;
  maxHours: number;
  maxGuests: number;
};

export function BookingPanel({
  homestayId,
  roomId,
  hourlyPrice,
  overnightPrice,
  dailyPrice,
  minHours,
  maxHours,
  maxGuests,
}: Props) {
  const router = useRouter();
  const tomorrow = useMemo(() => addDays(new Date(), 1), []);
  const [stayType, setStayType] = useState<StayType>("hourly");
  const [date, setDate] = useState(format(tomorrow, "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("14:00");
  const [durationHours, setDurationHours] = useState(Math.max(2, minHours));
  const [dailyCheckOut, setDailyCheckOut] = useState(format(addDays(tomorrow, 1), "yyyy-MM-dd"));
  const [guestCount, setGuestCount] = useState(Math.min(2, maxGuests));
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hourOptions = useMemo(() => {
    const lower = Math.max(1, minHours);
    const upper = Math.max(lower, maxHours);
    return Array.from({ length: upper - lower + 1 }, (_, index) => lower + index);
  }, [maxHours, minHours]);

  const computed = useMemo(() => {
    if (stayType === "daily") {
      const checkIn = new Date(`${date}T14:00:00`);
      const checkOut = new Date(`${dailyCheckOut}T11:00:00`);
      const days = Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
      return {
        checkIn,
        checkOut,
        units: days,
        unitLabel: `day${days === 1 ? "" : "s"}`,
        lineLabel: `${formatCurrency(dailyPrice)} × ${days} day${days === 1 ? "" : "s"}`,
        subtotal: dailyPrice * days,
      };
    }
    const checkIn = new Date(`${date}T${startTime}:00`);
    const hours = stayType === "overnight" ? 12 : durationHours;
    const checkOut = addHours(checkIn, hours);
    const subtotal = stayType === "overnight" ? overnightPrice : hourlyPrice * hours;
    return {
      checkIn,
      checkOut,
      units: stayType === "overnight" ? 1 : hours,
      unitLabel: stayType === "overnight" ? "overnight" : `hour${hours === 1 ? "" : "s"}`,
      lineLabel:
        stayType === "overnight"
          ? `${formatCurrency(overnightPrice)} overnight`
          : `${formatCurrency(hourlyPrice)} × ${hours} hours`,
      subtotal,
    };
  }, [dailyCheckOut, dailyPrice, date, durationHours, hourlyPrice, overnightPrice, startTime, stayType]);

  const estimatedTotal = Math.round(computed.subtotal * 1.18);
  const validWindow = computed.checkOut > computed.checkIn && computed.units > 0;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        homestayId,
        roomId,
        stayType,
        checkIn: computed.checkIn.toISOString(),
        checkOut: computed.checkOut.toISOString(),
        guestCount,
        customerName: form.get("name"),
        customerEmail: form.get("email"),
        customerPhone: form.get("phone") || undefined,
        specialRequest: form.get("request") || undefined,
      }),
    });
    const result = (await response.json()) as { bookingRef?: string; accessToken?: string; error?: string };
    setLoading(false);
    if (!response.ok || !result.bookingRef || !result.accessToken) {
      setError(result.error ?? "Unable to create booking.");
      return;
    }
    router.push(`/booking/${result.bookingRef}/payment?token=${result.accessToken}`);
  }

  return (
    <aside className="rounded-[var(--radius-lg)] bg-card p-5 shadow-[var(--shadow-sm)] lg:sticky lg:top-24">
      <div className="flex items-baseline justify-between">
        <p>
          <span className="text-2xl font-semibold">{formatCurrency(hourlyPrice)}</span>
          <span className="text-sm text-muted-foreground"> / hour</span>
        </p>
        <span className="text-sm text-muted-foreground">{maxGuests} guests max</span>
      </div>

      <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-full bg-muted p-1 text-sm font-semibold">
        {(["hourly", "overnight", "daily"] as StayType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setStayType(type);
              setDetailsOpen(false);
              if (type === "overnight") setStartTime("21:00");
            }}
            className={`rounded-full px-3 py-2 capitalize ${stayType === type ? "bg-primary text-white" : "text-muted-foreground"}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-[var(--radius-md)] bg-muted/50 p-2">
        <label className="rounded-xl bg-card px-3 py-3">
          <span className="block text-xs font-semibold">Date</span>
          <Input
            type="date"
            value={date}
            min={format(tomorrow, "yyyy-MM-dd")}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 min-h-8 border-0 bg-transparent p-0 shadow-none ring-0"
          />
        </label>
        {stayType === "daily" ? (
          <label className="rounded-xl bg-card px-3 py-3">
            <span className="block text-xs font-semibold">Check-out</span>
            <Input
              type="date"
              value={dailyCheckOut}
              min={date}
              onChange={(event) => setDailyCheckOut(event.target.value)}
              className="mt-1 min-h-8 border-0 bg-transparent p-0 shadow-none ring-0"
            />
          </label>
        ) : (
          <label className="rounded-xl bg-card px-3 py-3">
            <span className="block text-xs font-semibold">Start time</span>
            <select
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="mt-2 w-full bg-transparent text-sm outline-none"
            >
              {(stayType === "overnight" ? overnightTimes : startTimes).map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </label>
        )}
        {stayType === "hourly" ? (
          <label className="rounded-xl bg-card px-3 py-3">
            <span className="block text-xs font-semibold">Duration</span>
            <select
              value={durationHours}
              onChange={(event) => setDurationHours(Number(event.target.value))}
              className="mt-2 w-full bg-transparent text-sm outline-none"
            >
              {hourOptions.map((hours) => (
                <option key={hours} value={hours}>{hours} hours</option>
              ))}
            </select>
          </label>
        ) : null}
        <label className={`${stayType === "hourly" ? "" : "col-span-2"} rounded-xl bg-card px-3 py-3`}>
          <span className="block text-xs font-semibold">Guests</span>
          <select
            value={guestCount}
            onChange={(event) => setGuestCount(Number(event.target.value))}
            className="mt-2 w-full bg-transparent text-sm outline-none"
          >
            {Array.from({ length: maxGuests }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1} guest{index ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!detailsOpen ? (
        <Button className="mt-4 w-full" size="lg" disabled={!validWindow} onClick={() => setDetailsOpen(true)}>
          Continue · {formatCurrency(estimatedTotal)}
        </Button>
      ) : (
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="text-xs font-semibold">
              Name
              <Input name="name" required minLength={2} className="mt-1" autoComplete="name" />
            </label>
            <label className="text-xs font-semibold">
              Email
              <Input name="email" type="email" required className="mt-1" autoComplete="email" />
            </label>
          </div>
          <label className="text-xs font-semibold">
            Phone <span className="font-normal text-muted-foreground">(optional)</span>
            <Input name="phone" type="tel" className="mt-1" autoComplete="tel" />
          </label>
          <label className="text-xs font-semibold">
            Note <span className="font-normal text-muted-foreground">(optional)</span>
            <Input name="request" className="mt-1" placeholder="Arrival time, plate number..." />
          </label>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" disabled={loading || !validWindow}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Reserve
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setDetailsOpen(false)}
          >
            Back
          </button>
        </form>
      )}

      {validWindow ? (
        <div className="mt-5 grid gap-2 rounded-[var(--radius-md)] bg-muted/40 p-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{computed.lineLabel}</span>
            <span>{formatCurrency(computed.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{format(computed.checkIn, "MMM d, HH:mm")} → {format(computed.checkOut, "MMM d, HH:mm")}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Estimated total</span>
            <span>{formatCurrency(estimatedTotal)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-destructive">Choose a valid time window.</p>
      )}
    </aside>
  );
}
