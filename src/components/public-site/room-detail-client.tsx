"use client";

import { ArrowLeft, Gamepad2, KeyRound, Maximize2, Scan, Users, Utensils, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BookingPanel } from "@/components/booking/booking-panel";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import type { Homestay, Room } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

type Props = {
  homestay: Homestay;
  room: Room;
};

export function RoomDetailClient({ homestay, room }: Props) {
  const { t } = useLanguage();
  const [selectedRoomId, setSelectedRoomId] = useState(room.id);
  const roomGallery = Array.from(
    new Set([...(room.gallery ?? []), room.image, ...homestay.gallery]),
  ).filter(Boolean);
  const [activeImage, setActiveImage] = useState(roomGallery[0]);
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <>
      <Container className="py-3 lg:py-6">
        <Link
          href={`/homestays/${homestay.slug}`}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("room.back_to_homestay", { name: t(homestay.name) })}
        </Link>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge tone="primary">{homestay.tags[0] ? t(homestay.tags[0]) : t("booking.hourly")}</Badge>
            <h1 className="mt-3 text-4xl font-semibold leading-none tracking-tight md:text-5xl">
              {t(room.name)}
            </h1>
            <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t(room.description)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 shadow-sm">
              <Users className="size-3.5" /> {t("room.guests", { guests: room.guests })}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 shadow-sm">
              <Maximize2 className="size-3.5" /> {room.size}
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[calc(var(--radius-lg)+0.75rem)] bg-card shadow-[var(--shadow-sm)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-[16/10]">
            <Image
              src={activeImage}
              alt={t(room.name)}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-card"
            >
              <Scan className="size-3.5" />
              {t("room.full_photo")}
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:max-w-3xl">
          {roomGallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(image)}
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border bg-card transition md:h-24 md:w-32 ${
                activeImage === image ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
              aria-label={`Show room photo ${index + 1}`}
            >
              <Image src={image} alt={`${t(room.name)} photo ${index + 1}`} fill className="object-cover" sizes="33vw" />
            </button>
          ))}
        </div>
      </Container>

      <Container className="grid gap-5 pb-20 lg:grid-cols-[1fr_360px] lg:pb-24">
        <div className="grid gap-6">
          <section className="rounded-[var(--radius-lg)] bg-card p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-accent">{t(homestay.name)}</p>
                <h2 className="mt-1 text-xl font-semibold">{formatCurrency(room.hourlyBlockPrice)} / {room.hourlyBlockHours}h</h2>
              </div>
              {room.overnightPrice ? (
                <p className="text-right text-xs font-semibold text-muted-foreground">
                  {formatCurrency(room.overnightPrice)} overnight
                </p>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: KeyRound, title: t("homestay.short_stay_ready") },
                { icon: Utensils, title: t("homestay.easy_arrival") },
                { icon: Gamepad2, title: t("homestay.book_secure") },
              ].map(({ icon: Icon, title }) => (
                <span key={title} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  <Icon className="size-3.5 text-primary" />
                  {title}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {homestay.amenities.slice(0, 4).map((amenity) => (
                <span key={amenity} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  {t(amenity)}
                </span>
              ))}
            </div>
          </section>
        </div>

        <BookingPanel
          homestayId={homestay.id}
          rooms={[room]}
          selectedRoomId={selectedRoomId}
          onRoomChange={setSelectedRoomId}
        />
      </Container>

      {viewerOpen ? (
        <div className="fixed inset-0 z-[90] bg-[#151923]/95 p-4 text-white backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setViewerOpen(false)}
            className="absolute right-4 top-4 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/20"
            aria-label={t("room.close_photo")}
          >
            <X className="size-5" />
          </button>
          <div className="mx-auto flex h-full max-w-5xl flex-col gap-3 pt-12">
            <div className="relative min-h-0 flex-1">
              <Image src={activeImage} alt={t(room.name)} fill className="object-contain" sizes="100vw" />
            </div>
            <div className="flex gap-2 overflow-x-auto md:mx-auto md:w-full md:max-w-3xl">
              {roomGallery.map((image, index) => (
                <button
                  key={`viewer-${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border transition md:h-24 md:w-32 ${
                    activeImage === image ? "border-primary ring-2 ring-primary/40" : "border-white/20"
                  }`}
                  aria-label={`Show room photo ${index + 1}`}
                >
                  <Image src={image} alt={`${t(room.name)} photo ${index + 1}`} fill className="object-cover" sizes="33vw" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
