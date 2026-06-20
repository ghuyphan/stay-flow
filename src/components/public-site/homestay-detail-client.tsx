"use client";

import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BookingPanel } from "@/components/booking/booking-panel";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { RoomCard } from "@/components/public-site/room-card";
import type { Homestay } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import type { SiteBuilderConfig } from "@/lib/site-builder";
import { textForLanguage } from "@/lib/site-builder";

type Props = {
  homestay: Homestay;
  siteConfig: SiteBuilderConfig;
};

export function HomestayDetailClient({ homestay, siteConfig }: Props) {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryRoomId = searchParams.get("room");
  const visibleSections = siteConfig.pages.detail.sections.filter((section) => section.enabled);

  const [selectedRoomId, setSelectedRoomId] = useState(
    queryRoomId && homestay.rooms.some((r) => r.id === queryRoomId)
      ? queryRoomId
      : homestay.rooms[0]?.id || ""
  );

  return (
    <>
      {visibleSections.map((section) => {
        if (section.type === "detailHero") {
          const overlay =
            section.style.overlay === "strong"
              ? "md:bg-[linear-gradient(90deg,var(--color-card)_0%,color-mix(in_srgb,var(--color-card)_92%,transparent)_44%,transparent_82%)]"
              : section.style.overlay === "none"
                ? "md:bg-none"
                : "md:bg-[linear-gradient(90deg,var(--color-card)_0%,color-mix(in_srgb,var(--color-card)_82%,transparent)_38%,transparent_78%)]";
          return (
            <Container key={section.id} className="py-3 lg:py-6">
              <div className="relative -mx-4 overflow-hidden bg-card md:mx-0 md:rounded-[calc(var(--radius-lg)+0.75rem)] md:border md:border-border md:shadow-[var(--shadow-sm)]">
                <div className="relative h-[390px] md:h-[500px]">
                  <Image
                    src={section.props.image || homestay.gallery[0]}
                    alt={`${t(homestay.name)} room`}
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className={`absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,var(--color-card)_100%)] ${overlay}`} />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:inset-y-0 md:left-0 md:right-auto md:flex md:w-[44%] md:flex-col md:justify-end md:p-8">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {homestay.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} tone="primary">
                          {t(tag)}
                        </Badge>
                      ))}
                    </div>
                    <h1 className="max-w-[11ch] text-4xl font-semibold leading-[0.98] tracking-tight md:text-6xl">
                      {textForLanguage(section.props.title, language) || t(homestay.name)}
                    </h1>
                    <p className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-4" /> {t(homestay.location)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="size-4 fill-current text-accent" /> {homestay.rating}
                      </span>
                    </p>
                    <p className="mt-3 line-clamp-2 max-w-sm text-sm leading-6 text-muted-foreground">
                      {textForLanguage(section.props.subtitle, language) || t(homestay.description)}
                    </p>
                  </div>
                </div>
              </div>
            </Container>
          );
        }

        if (section.type === "detailAmenities") {
          return (
            <Container key={section.id}>
              <section className="border-y border-border py-4">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
                  {homestay.amenities.map((amenity) => (
                    <span key={amenity} className="inline-flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary/70" aria-hidden="true" />
                      {t(amenity)}
                    </span>
                  ))}
                </div>
              </section>
            </Container>
          );
        }

        if (section.type === "detailRooms") {
          return (
            <Container key={section.id} className="py-[var(--section-y-sm)]">
              <section>
                <h2 className="text-2xl font-semibold">{textForLanguage(section.props.title, language)}</h2>
                <div className="mt-4 grid gap-3">
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
            </Container>
          );
        }

        if (section.type === "detailBooking") {
          return (
            <Container key={section.id} className={section.style.bookingPlacement === "sticky" ? "pb-20 lg:max-w-2xl lg:pb-24" : "pb-20 lg:max-w-xl lg:pb-24"}>
              <BookingPanel
                homestayId={homestay.id}
                rooms={homestay.rooms}
                selectedRoomId={selectedRoomId}
                onRoomChange={setSelectedRoomId}
              />
            </Container>
          );
        }

        return null;
      })}
    </>
  );
}
