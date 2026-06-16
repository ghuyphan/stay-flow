"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [guests, setGuests] = useState("2");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams();
    if (location) query.set("location", location);
    if (checkIn) query.set("checkIn", checkIn);
    query.set("guests", guests);
    router.push(`/homestays?${query}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`grid gap-0 overflow-hidden rounded-[var(--radius-lg)] bg-card shadow-[var(--shadow-md)] ring-1 ring-black/[0.035] md:grid-cols-[1.3fr_1fr_0.7fr_auto] ${compact ? "" : ""}`}
    >
      <label className="px-4 py-3 md:shadow-[1px_0_0_rgb(24_32_29_/_0.05)]">
        <span className="block text-xs font-semibold">Where</span>
        <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="District 1 or Thao Dien" className="mt-1 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </label>
      <label className="px-4 py-3 md:shadow-[1px_0_0_rgb(24_32_29_/_0.05)]">
        <span className="block text-xs font-semibold">Date</span>
        <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none" />
      </label>
      <label className="px-4 py-3 md:shadow-[1px_0_0_rgb(24_32_29_/_0.05)]">
        <span className="block text-xs font-semibold">Guests</span>
        <select value={guests} onChange={(event) => setGuests(event.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none">
          {[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}</option>)}
        </select>
      </label>
      <Button type="submit" size="lg" className="m-2 min-w-14"><Search className="size-4" /><span>Search</span></Button>
    </form>
  );
}
