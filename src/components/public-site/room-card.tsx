"use client";

import { BedDouble, Maximize2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  const detailHref = `/homestays/${slug}/rooms/${room.id}`;

  return (
    <article
      className={`grid overflow-hidden rounded-[var(--radius-lg)] bg-card p-2 md:grid-cols-[150px_1fr] md:gap-4 border transition-all duration-300 ${
        isActive ? "border-primary shadow-[var(--shadow-sm)] ring-2 ring-primary/10" : "border-border"
      }`}
    >
      <Link href={detailHref} className="relative min-h-40 overflow-hidden rounded-[calc(var(--radius-lg)-0.25rem)] md:min-h-32">
        <Image src={room.image} alt={room.name} fill className="object-cover transition duration-500 hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 220px" />
        {room.gallery?.length ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm">
            {room.gallery.length} photos
          </span>
        ) : null}
      </Link>
      <div className="flex flex-col p-2 md:py-1">
        <div className="grid grid-cols-[1fr_auto] items-start gap-3">
          <div className="min-w-0">
            <Link href={detailHref} className="truncate text-lg font-semibold leading-tight hover:text-primary">
              {t(room.name)}
            </Link>
            <p className="mt-1 line-clamp-1 text-sm leading-5 text-muted-foreground md:line-clamp-2">{t(room.description)}</p>
          </div>
          <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold leading-none ${
            room.remaining <= 1 ? "bg-warning/12 text-warning" : "bg-secondary text-secondary-foreground"
          }`}>
            {room.remaining === 1 ? t("room.left", { count: 1 }) : t("room.left_plural", { count: room.remaining })}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5"><Users className="size-3.5" /> {t("room.guests", { guests: room.guests })}</span>
          <span className="flex items-center gap-1.5"><BedDouble className="size-3.5" /> {room.beds}</span>
          <span className="flex items-center gap-1.5"><Maximize2 className="size-3.5" /> {room.size}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <span className="text-lg font-semibold">{formatCurrency(room.hourlyBlockPrice)}</span>
            <span className="text-sm text-muted-foreground"> / {room.hourlyBlockHours}h</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={detailHref} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              {t("room.view_details")}
            </Link>
            <Button
              type="button"
              variant={isActive ? "primary" : "outline"}
              onClick={() => onSelect?.(room.id)}
              size="sm"
              className="min-h-10 rounded-full px-4 font-semibold"
            >
              {isActive ? t("room.selected") : t("room.select")}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
