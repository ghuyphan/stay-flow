"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Room } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const emptyRoom = {
  name: "",
  description: "",
  guests: 2,
  beds: "1 queen bed",
  size: "30 m²",
  hourlyPrice: 18,
  overnightPrice: 49,
  dailyPrice: 80,
  hourlyBlockHours: 3,
  hourlyBlockPrice: 50,
  hourlyExtraHourPrice: 15,
  overnightOptions: [
    {
      id: "on-1",
      labelEn: "Late Overnight (22:30 - 08:00)",
      labelVi: "Qua đêm muộn (22:30 - 08:00)",
      checkInTime: "22:30",
      checkOutTime: "08:00",
      price: 70
    },
    {
      id: "on-2",
      labelEn: "Standard Overnight (22:00 - 10:00)",
      labelVi: "Qua đêm thường (22:00 - 10:00)",
      checkInTime: "22:00",
      checkOutTime: "10:00",
      price: 85
    }
  ],
  minHours: 2,
  maxHours: 12,
  price: 80,
  image: "",
  remaining: 1,
};

export function RoomManager({
  homestayId,
  initialRooms,
}: {
  homestayId: string;
  initialRooms: Room[];
}) {
  const [rooms, setRooms] = useState(initialRooms);
  const [editing, setEditing] = useState<Room | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    const overnightOptionsJson = form.get("overnightOptions") as string;
    let overnightOptions = [];
    try {
      overnightOptions = JSON.parse(overnightOptionsJson);
    } catch {
      setError("Overnight options must be a valid JSON array.");
      return;
    }

    const payload = {
      name: form.get("name"),
      description: form.get("description"),
      guests: Number(form.get("guests")),
      beds: form.get("beds"),
      size: form.get("size"),
      hourlyPrice: Number(form.get("hourlyBlockPrice")) / 3, // backward compatibility fallback value
      overnightPrice: overnightOptions[0]?.price || 49,     // backward compatibility fallback value
      dailyPrice: Number(form.get("dailyPrice")),
      hourlyBlockHours: Number(form.get("hourlyBlockHours")),
      hourlyBlockPrice: Number(form.get("hourlyBlockPrice")),
      hourlyExtraHourPrice: Number(form.get("hourlyExtraHourPrice")),
      overnightOptions,
      minHours: Number(form.get("minHours")),
      maxHours: Number(form.get("maxHours")),
      price: Number(form.get("dailyPrice")), // legacy base price mappings
      image: form.get("image"),
      remaining: Number(form.get("remaining")),
    };

    const response = await fetch(
      editing
        ? `/api/homestays/${homestayId}/rooms/${editing.id}`
        : `/api/homestays/${homestayId}/rooms`,
      {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = (await response.json()) as Room & { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Unable to save room.");
      return;
    }
    setRooms((current) =>
      editing
        ? current.map((room) => (room.id === editing.id ? result : room))
        : [...current, result],
    );
    setEditing(null);
    setAdding(false);
  }

  async function remove(room: Room) {
    if (!window.confirm(`Delete ${room.name}?`)) return;
    const response = await fetch(`/api/homestays/${homestayId}/rooms/${room.id}`, {
      method: "DELETE",
    });
    if (response.ok) setRooms((current) => current.filter((item) => item.id !== room.id));
    else setError("Each homestay must keep at least one room.");
  }

  const formRoom = editing ?? emptyRoom;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Rooms</h2>
        <Button variant="outline" size="sm" onClick={() => { setAdding(true); setEditing(null); }}><Plus className="size-4" /> Add room</Button>
      </div>
      <div className="mt-4 grid gap-3">
        {rooms.map((room) => (
          <div key={room.id} className="flex flex-col gap-3 rounded-[var(--radius-lg)] bg-card p-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="font-semibold">{room.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {room.guests} guests · {room.beds} · {formatCurrency(room.hourlyBlockPrice)}/{room.hourlyBlockHours}h · {room.overnightOptions?.length || 0} overnight slots
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setEditing(room); setAdding(false); }}><Pencil className="size-4" /> Edit</Button>
              <Button variant="ghost" size="sm" onClick={() => remove(room)}><Trash2 className="size-4" /> Delete</Button>
            </div>
          </div>
        ))}
      </div>
      {adding || editing ? (
        <form onSubmit={submit} className="mt-5 rounded-[var(--radius-lg)] bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-5 flex items-center justify-between"><h3 className="font-semibold">{editing ? "Edit room" : "New room"}</h3><button type="button" aria-label="Close room form" onClick={() => { setAdding(false); setEditing(null); }}><X className="size-4" /></button></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Name<Input name="name" defaultValue={formRoom.name} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Image URL<Input name="image" type="url" defaultValue={formRoom.image} required className="mt-1" /></label>
            <label className="text-sm font-semibold sm:col-span-2">Description<Input name="description" defaultValue={formRoom.description} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Beds<Input name="beds" defaultValue={formRoom.beds} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Size<Input name="size" defaultValue={formRoom.size} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Guests<Input name="guests" type="number" min="1" defaultValue={formRoom.guests} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Hourly Block Hours<Input name="hourlyBlockHours" type="number" min="1" defaultValue={formRoom.hourlyBlockHours} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Hourly Block Price<Input name="hourlyBlockPrice" type="number" min="1" defaultValue={formRoom.hourlyBlockPrice} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Hourly Extra Hour Price<Input name="hourlyExtraHourPrice" type="number" min="0" defaultValue={formRoom.hourlyExtraHourPrice} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Daily price<Input name="dailyPrice" type="number" min="1" defaultValue={formRoom.dailyPrice} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Min hours<Input name="minHours" type="number" min="1" defaultValue={formRoom.minHours} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Max hours<Input name="maxHours" type="number" min="1" defaultValue={formRoom.maxHours} required className="mt-1" /></label>
            <label className="text-sm font-semibold">Rooms available<Input name="remaining" type="number" min="0" defaultValue={formRoom.remaining} required className="mt-1" /></label>
            
            <label className="text-sm font-semibold sm:col-span-2">
              Overnight Options (JSON Array)
              <textarea
                name="overnightOptions"
                rows={6}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                defaultValue={JSON.stringify(formRoom.overnightOptions, null, 2)}
                required
              />
            </label>
          </div>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="mt-5">Save room</Button>
        </form>
      ) : error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
