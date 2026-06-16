import { BedDouble, Maximize2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Room } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function RoomCard({ room, slug }: { room: Room; slug: string }) {
  return (
    <article className="grid overflow-hidden rounded-[var(--radius-lg)] bg-card p-3 shadow-[var(--shadow-sm)] md:grid-cols-[220px_1fr] md:gap-5">
      <div className="relative min-h-52 overflow-hidden rounded-[var(--radius-lg)]">
        <Image src={room.image} alt={room.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 35vw" />
      </div>
      <div className="flex flex-col p-2 pt-5 md:pt-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-semibold">{room.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{room.description}</p>
          </div>
          <Badge tone={room.remaining <= 1 ? "warning" : "success"}>{room.remaining} left</Badge>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Users className="size-4" /> Up to {room.guests}</span>
          <span className="flex items-center gap-2"><BedDouble className="size-4" /> {room.beds}</span>
          <span className="flex items-center gap-2"><Maximize2 className="size-4" /> {room.size}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <p>
            <span className="text-xl font-semibold">{formatCurrency(room.hourlyPrice)}</span>
            <span className="text-sm text-muted-foreground"> / hour</span>
          </p>
          <Button asChild variant="outline">
            <Link href={`/homestays/${slug}/rooms/${room.id}`}>View room</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
