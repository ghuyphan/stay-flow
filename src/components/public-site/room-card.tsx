"use client";

import { BedDouble, Maximize2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Room } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

export function RoomCard({
  room,
  slug,
  isActive = false,
  onSelect,
}: {
  room: Room;
  slug: string;
  isActive?: boolean;
  onSelect?: (roomId: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <article
      className={`grid overflow-hidden rounded-[var(--radius-lg)] bg-card p-3 shadow-[var(--shadow-sm)] md:grid-cols-[220px_1fr] md:gap-5 border-2 transition-all duration-300 ${
        isActive ? "border-primary ring-2 ring-primary/10" : "border-transparent"
      }`}
    >
      <div className="relative min-h-52 overflow-hidden rounded-[var(--radius-lg)]">
        <Image src={room.image} alt={room.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 35vw" />
      </div>
      <div className="flex flex-col p-2 pt-5 md:pt-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-semibold">{t(room.name)}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{t(room.description)}</p>
          </div>
          <Badge tone={room.remaining <= 1 ? "warning" : "success"}>
            {room.remaining === 1 ? t("room.left", { count: 1 }) : t("room.left_plural", { count: room.remaining })}
          </Badge>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Users className="size-4" /> {t("room.guests", { guests: room.guests })}</span>
          <span className="flex items-center gap-2"><BedDouble className="size-4" /> {room.beds}</span>
          <span className="flex items-center gap-2"><Maximize2 className="size-4" /> {room.size}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <div>
            <span className="text-xl font-semibold">{formatCurrency(room.hourlyBlockPrice)}</span>
            <span className="text-sm text-muted-foreground"> / {room.hourlyBlockHours}h</span>
          </div>
          <Button
            type="button"
            variant={isActive ? "primary" : "outline"}
            onClick={() => onSelect?.(room.id)}
            className="transition-all active:scale-95 font-semibold"
          >
            {isActive ? t("booking.select_room") + " ✓" : t("room.view_details")}
          </Button>
        </div>
      </div>
    </article>
  );
}
