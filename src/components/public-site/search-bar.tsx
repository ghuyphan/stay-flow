"use client";

import { CalendarDays, Clock3, MapPin, Moon, Search, Sun, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [guests, setGuests] = useState("2");
  const [stayType, setStayType] = useState("hourly");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams();
    if (location) query.set("location", location);
    if (checkIn) query.set("checkIn", checkIn);
    query.set("guests", guests);
    query.set("stayType", stayType);
    router.push(`/homestays?${query}`);
  }

  const stayTypes = [
    { value: "hourly", label: t("booking.hourly"), icon: Clock3 },
    { value: "daily", label: t("booking.daily"), icon: Sun },
    { value: "overnight", label: t("booking.overnight"), icon: Moon },
  ];

  return (
    <form
      onSubmit={submit}
      className={`rounded-[calc(var(--radius-lg)+0.5rem)] border border-border bg-card/96 p-3 shadow-[var(--shadow-md)] ${
        compact ? "" : "md:p-4"
      }`}
    >
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <label className="col-span-2 flex min-h-16 items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background/65 px-3 md:col-span-1">
          <MapPin className="size-5 shrink-0 text-foreground/70 md:size-5" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-muted-foreground">{t("search.where")}</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder={t("search.where_placeholder")}
              className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-muted-foreground"
            />
          </span>
        </label>
        <label className="flex min-h-16 items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background/65 px-3">
          <CalendarDays className="size-5 shrink-0 text-foreground/70" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-muted-foreground">{t("search.date")}</span>
            <input
              type="date"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              className="mt-0.5 w-full min-w-0 bg-transparent text-sm font-semibold outline-none"
            />
          </span>
        </label>
        <label className="flex min-h-16 items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background/65 px-3">
          <Users className="size-5 shrink-0 text-foreground/70" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-muted-foreground">{t("search.guests")}</span>
            <select
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none"
            >
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </span>
        </label>
      </div>
      <div className="mt-3 grid gap-2">
        <div className="grid grid-cols-3 gap-2">
          {stayTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStayType(value)}
              className={`inline-flex min-h-12 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border px-2 text-sm font-semibold transition-all active:scale-[0.98] md:gap-2 md:px-3 ${
                stayType === value
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-transparent bg-muted/70 text-foreground/75 hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
        <Button type="submit" size="lg" className="w-full">
          <Search className="size-4" />
          <span>{t("search.submit")}</span>
        </Button>
      </div>
    </form>
  );
}
