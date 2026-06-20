"use client";

import { addDays, addHours, format } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonSkeleton } from "@/components/ui/skeleton";
import type { StayType, Room } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

type Props = {
  homestayId: string;
  rooms: Room[];
  selectedRoomId: string;
  onRoomChange: (roomId: string) => void;
};

export function BookingPanel({
  homestayId,
  rooms,
  selectedRoomId,
  onRoomChange,
}: Props) {
  const router = useRouter();
  const { language, t } = useLanguage();

  const activeRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  }, [rooms, selectedRoomId]);

  const tomorrow = useMemo(() => addDays(new Date(), 1), []);
  const [stayType, setStayType] = useState<StayType>("hourly");
  const [date, setDate] = useState(format(tomorrow, "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("14:00");
  const [durationHours, setDurationHours] = useState(3);
  const [dailyCheckOut, setDailyCheckOut] = useState(format(addDays(tomorrow, 1), "yyyy-MM-dd"));
  const [guestCount, setGuestCount] = useState(2);
  const [selectedOvernightId, setSelectedOvernightId] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeRoom?.overnightOptions?.length > 0) {
        setSelectedOvernightId(activeRoom.overnightOptions[0].id);
      } else {
        setSelectedOvernightId("");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeRoom]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeRoom) {
        setDurationHours(Math.max(activeRoom.minHours, Math.min(activeRoom.maxHours, 3)));
        setGuestCount(Math.min(2, activeRoom.guests));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeRoom]);

  const hourOptions = useMemo(() => {
    if (!activeRoom) return [2, 3, 4];
    const lower = Math.max(1, activeRoom.minHours);
    const upper = Math.max(lower, activeRoom.maxHours);
    return Array.from({ length: upper - lower + 1 }, (_, index) => lower + index);
  }, [activeRoom]);

  const computed = useMemo(() => {
    if (!activeRoom) {
      return {
        checkIn: new Date(),
        checkOut: new Date(),
        units: 0,
        unitLabel: "",
        lineLabel: "",
        subtotal: 0,
      };
    }

    if (stayType === "daily") {
      const checkIn = new Date(`${date}T14:00:00`);
      const checkOut = new Date(`${dailyCheckOut}T12:00:00`);
      const days = Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
      return {
        checkIn,
        checkOut,
        units: days,
        unitLabel: days === 1 ? t("booking.days_singular") : t("booking.days_plural"),
        lineLabel: t("booking.rate_daily", { price: formatCurrency(activeRoom.dailyPrice), days }),
        subtotal: activeRoom.dailyPrice * days,
      };
    }

    if (stayType === "overnight") {
      const option =
        activeRoom.overnightOptions.find((opt) => opt.id === selectedOvernightId) ||
        activeRoom.overnightOptions[0];

      if (option) {
        const checkIn = new Date(`${date}T${option.checkInTime}:00`);
        const checkOutDateStr =
          option.checkOutTime < option.checkInTime
            ? format(addDays(new Date(`${date}T00:00:00`), 1), "yyyy-MM-dd")
            : date;
        const checkOut = new Date(`${checkOutDateStr}T${option.checkOutTime}:00`);
        const subtotal = option.price;
        const label = language === "en" ? option.labelEn : option.labelVi;
        return {
          checkIn,
          checkOut,
          units: 1,
          unitLabel: t("booking.overnight"),
          lineLabel: t("booking.rate_overnight", { price: formatCurrency(subtotal), time: label }),
          subtotal,
        };
      }
    }

    // hourly
    const checkIn = new Date(`${date}T${startTime}:00`);
    const checkOut = addHours(checkIn, durationHours);
    let subtotal = activeRoom.hourlyBlockPrice;
    if (durationHours > activeRoom.hourlyBlockHours) {
      subtotal += (durationHours - activeRoom.hourlyBlockHours) * activeRoom.hourlyExtraHourPrice;
    }

    const label = t("booking.rate_hourly_block", {
      price: formatCurrency(activeRoom.hourlyBlockPrice),
      hours: activeRoom.hourlyBlockHours,
      extra: formatCurrency(activeRoom.hourlyExtraHourPrice),
    });

    return {
      checkIn,
      checkOut,
      units: durationHours,
      unitLabel: durationHours === 1 ? t("booking.hours_singular") : t("booking.hours_plural"),
      lineLabel: label,
      subtotal,
    };
  }, [
    activeRoom,
    stayType,
    date,
    startTime,
    durationHours,
    dailyCheckOut,
    selectedOvernightId,
    language,
    t,
  ]);

  const estimatedTotal = Math.round(computed.subtotal * 1.18);
  const validWindow = activeRoom && computed.checkOut > computed.checkIn && computed.units > 0;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeRoom) return;
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        homestayId,
        roomId: activeRoom.id,
        stayType,
        checkIn: computed.checkIn.toISOString(),
        checkOut: computed.checkOut.toISOString(),
        guestCount,
        customerName: form.get("name"),
        customerEmail: form.get("email"),
        customerPhone: form.get("phone") || undefined,
        specialRequest: form.get("request") || undefined,
        selectedOvernightOptionId: stayType === "overnight" ? selectedOvernightId : undefined,
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

  if (!activeRoom) return null;

  return (
    <aside className="rounded-[calc(var(--radius-lg)+0.5rem)] border border-border bg-card p-5 shadow-[var(--shadow-sm)] lg:sticky lg:top-24">
      {/* Pricing Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-semibold">
            {formatCurrency(activeRoom.hourlyBlockPrice)}
          </span>
          <span className="text-sm text-muted-foreground">
            {" "}
            / {activeRoom.hourlyBlockHours}h
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {t("booking.max_guests", { count: activeRoom.guests })}
        </span>
      </div>

      {/* Stay Type Tabs */}
      <div className="mt-5 grid grid-cols-3 gap-1 rounded-[var(--radius-md)] bg-muted p-1 text-sm font-semibold">
        {(["hourly", "overnight", "daily"] as StayType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setStayType(type);
              setDetailsOpen(false);
            }}
            className={`rounded-[calc(var(--radius-md)-0.25rem)] px-2 py-2 transition-all active:scale-95 ${
              stayType === type ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(`booking.${type}`)}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-[var(--radius-lg)] bg-muted/55 p-2">
        {/* Room Selector dropdown (shown when there are multiple rooms) */}
        {rooms.length > 1 ? (
          <label className="col-span-2 block rounded-[var(--radius-md)] border border-border bg-card px-3 py-3 hover:border-primary/40">
            <span className="block text-xs font-semibold text-primary">{t("booking.select_room")}</span>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                onRoomChange(e.target.value);
                setDetailsOpen(false);
              }}
              className="mt-1 w-full bg-transparent text-sm font-semibold outline-none text-foreground"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(r.name)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {/* Date Selector */}
        <label className="col-span-1 rounded-[var(--radius-md)] border border-border bg-card px-3 py-3">
          <span className="block text-xs font-semibold">{t("booking.date_label")}</span>
          <Input
            type="date"
            value={date}
            min={format(tomorrow, "yyyy-MM-dd")}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 min-h-8 border-0 bg-transparent p-0 shadow-none ring-0 focus-visible:ring-0"
          />
        </label>

        {/* Start Time / Checkout Date / Overnight package selectors */}
        {stayType === "daily" ? (
          <label className="col-span-1 rounded-[var(--radius-md)] border border-border bg-card px-3 py-3">
            <span className="block text-xs font-semibold">{t("booking.checkout_label")}</span>
            <Input
              type="date"
              value={dailyCheckOut}
              min={date}
              onChange={(event) => setDailyCheckOut(event.target.value)}
              className="mt-1 min-h-8 border-0 bg-transparent p-0 shadow-none ring-0 focus-visible:ring-0"
            />
          </label>
        ) : stayType === "overnight" ? (
          <label className="col-span-1 rounded-[var(--radius-md)] border border-border bg-card px-3 py-3">
            <span className="block text-xs font-semibold">{t("booking.select_overnight_slot")}</span>
            <select
              value={selectedOvernightId}
              onChange={(event) => setSelectedOvernightId(event.target.value)}
              className="mt-2 w-full bg-transparent text-sm outline-none font-medium"
            >
              {activeRoom.overnightOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {language === "en" ? opt.labelEn : opt.labelVi}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="col-span-1 rounded-[var(--radius-md)] border border-border bg-card px-3 py-3">
            <span className="block text-xs font-semibold">{t("booking.checkin_label")}</span>
            <select
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="mt-2 w-full bg-transparent text-sm outline-none font-medium"
            >
              {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Hourly Duration Selector */}
        {stayType === "hourly" ? (
          <label className="col-span-1 rounded-[var(--radius-md)] border border-border bg-card px-3 py-3">
            <span className="block text-xs font-semibold">{t("booking.duration_label")}</span>
            <select
              value={durationHours}
              onChange={(event) => setDurationHours(Number(event.target.value))}
              className="mt-2 w-full bg-transparent text-sm outline-none font-medium"
            >
              {hourOptions.map((hours) => (
                <option key={hours} value={hours}>
                  {t("booking.hours_plural", { count: hours })}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {/* Guests Selector */}
        <label className={`${stayType === "hourly" ? "col-span-1" : "col-span-1"} rounded-[var(--radius-md)] border border-border bg-card px-3 py-3`}>
          <span className="block text-xs font-semibold">{t("booking.guests_label")}</span>
          <select
            value={guestCount}
            onChange={(event) => setGuestCount(Number(event.target.value))}
            className="mt-2 w-full bg-transparent text-sm outline-none font-medium"
          >
            {Array.from({ length: activeRoom.guests }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index === 0
                  ? t("booking.guest_count", { count: 1 })
                  : t("booking.guest_count_plural", { count: index + 1 })}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Button & Guest Info Form */}
      {!detailsOpen ? (
        <Button className="mt-4 w-full" size="lg" disabled={!validWindow} onClick={() => setDetailsOpen(true)}>
          {t("booking.continue", { price: formatCurrency(estimatedTotal) })}
        </Button>
      ) : (
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="text-xs font-semibold">
              {t("booking.form_name")}
              <Input name="name" required minLength={2} className="mt-1" autoComplete="name" />
            </label>
            <label className="text-xs font-semibold">
              {t("booking.form_email")}
              <Input name="email" type="email" required className="mt-1" autoComplete="email" />
            </label>
          </div>
          <label className="text-xs font-semibold">
            {t("booking.form_phone")} <span className="font-normal text-muted-foreground">{t("booking.form_phone_sub")}</span>
            <Input name="phone" type="tel" className="mt-1" autoComplete="tel" />
          </label>
          <label className="text-xs font-semibold">
            {t("booking.form_note")} <span className="font-normal text-muted-foreground">{t("booking.form_note_sub")}</span>
            <Input name="request" className="mt-1" placeholder={t("booking.form_note_placeholder")} />
          </label>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          {loading ? (
            <ButtonSkeleton className="min-h-12" />
          ) : (
            <Button type="submit" size="lg" disabled={!validWindow}>
              {t("booking.reserve")}
            </Button>
          )}
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setDetailsOpen(false)}
          >
            {t("booking.back")}
          </button>
        </form>
      )}

      {/* Receipt Summary */}
      {validWindow ? (
        <div className="mt-5 hidden gap-2 rounded-[var(--radius-lg)] border border-border bg-muted/40 p-3 text-sm sm:grid">
          <div className="flex flex-col gap-1 text-muted-foreground border-b border-border pb-2">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider">{t("booking.select_room")}</span>
            <span className="text-foreground font-medium text-sm">{t(activeRoom.name)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground pt-1">
            <span className="max-w-[70%] text-xs leading-relaxed">{computed.lineLabel}</span>
            <span className="font-medium text-foreground">{formatCurrency(computed.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>{format(computed.checkIn, "MMM d, HH:mm")} → {format(computed.checkOut, "MMM d, HH:mm")}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-2 mt-1">
            <span>{t("booking.estimated_total")}</span>
            <span className="text-primary">{formatCurrency(estimatedTotal)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-destructive">{t("booking.invalid_window")}</p>
      )}
    </aside>
  );
}
