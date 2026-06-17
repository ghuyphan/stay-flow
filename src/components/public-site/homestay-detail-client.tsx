"use client";

import { Gamepad2, KeyRound, MapPin, Star, Utensils } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BookingPanel } from "@/components/booking/booking-panel";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { RoomCard } from "@/components/public-site/room-card";
import type { Homestay } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";

type Props = {
  homestay: Homestay;
};

export function HomestayDetailClient({ homestay }: Props) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const queryRoomId = searchParams.get("room");

  const [selectedRoomId, setSelectedRoomId] = useState(
    queryRoomId && homestay.rooms.some((r) => r.id === queryRoomId)
      ? queryRoomId
      : homestay.rooms[0]?.id || ""
  );

  return (
    <>
      <Container className="py-4 lg:py-8">
        <div className="relative -mx-4 overflow-hidden bg-card md:mx-0 md:rounded-[calc(var(--radius-lg)+0.75rem)] md:border md:border-border md:shadow-[var(--shadow-sm)]">
          <div className="relative h-[430px] md:h-[520px]">
            <Image
              src={homestay.gallery[0]}
              alt={`${t(homestay.name)} room`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgb(255_253_248_/_0.96)_100%)] md:bg-[linear-gradient(90deg,rgb(255_253_248_/_0.98)_0%,rgb(255_253_248_/_0.82)_38%,transparent_78%)]" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:inset-y-0 md:left-0 md:right-auto md:flex md:w-[46%] md:flex-col md:justify-end md:p-8">
              <div className="mb-3 flex flex-wrap gap-2">
                {homestay.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} tone="primary">
                    {t(tag)}
                  </Badge>
                ))}
              </div>
              <h1 className="max-w-[11ch] font-display text-5xl font-semibold leading-[0.98] tracking-tight md:text-6xl">
                {t(homestay.name)}
              </h1>
              <p className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" /> {t(homestay.location)}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-current text-accent" /> {homestay.rating}
                </span>
              </p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground md:text-base">
                {t(homestay.description)}
              </p>
            </div>
          </div>
        </div>
      </Container>

      <Container className="grid gap-6 pb-20 lg:grid-cols-[1fr_360px] lg:pb-24">
        <div className="grid gap-6">
          <section className="grid grid-cols-3 gap-2">
            {[
              { icon: KeyRound, title: t("homestay.short_stay_ready"), body: t("homestay.short_stay_desc") },
              { icon: Utensils, title: t("homestay.easy_arrival"), body: t("homestay.easy_arrival_desc") },
              { icon: Gamepad2, title: t("homestay.book_secure"), body: t("homestay.book_secure_desc") },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[var(--radius-lg)] border border-border bg-card/75 p-3 md:p-4">
                <Icon className="size-5 text-primary" />
                <p className="mt-3 text-sm font-semibold leading-tight">{title}</p>
                <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">{body}</p>
              </div>
            ))}
          </section>

          <section>
            <div className="flex flex-wrap gap-2">
              {homestay.amenities.map((amenity) => (
                <p key={amenity} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground">
                  {t(amenity)}
                </p>
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-accent">{t("homestay.choose_room")}</p>
                <h2 className="mt-1 font-display text-3xl font-semibold">{t("homestay.rooms_avail")}</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {homestay.rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  slug={homestay.slug}
                  isActive={room.id === selectedRoomId}
                  onSelect={setSelectedRoomId}
                />
              ))}
            </div>
          </section>
        </div>
        <BookingPanel
          homestayId={homestay.id}
          rooms={homestay.rooms}
          selectedRoomId={selectedRoomId}
          onRoomChange={setSelectedRoomId}
        />
      </Container>
    </>
  );
}
