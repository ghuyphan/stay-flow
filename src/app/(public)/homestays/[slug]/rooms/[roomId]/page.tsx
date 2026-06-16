import type { Metadata } from "next";
import { ArrowLeft, BedDouble, Maximize2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/components/booking/booking-panel";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { appRepository } from "@/server/repositories/app-repository";

type PageProps = { params: Promise<{ slug: string; roomId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, roomId } = await params;
  const homestay = await appRepository.getHomestayBySlug(slug);
  const room = homestay?.rooms.find((item) => item.id === roomId);
  return room && homestay
    ? { title: `${room.name} at ${homestay.name}`, description: room.description }
    : {};
}

export default async function RoomPage({ params }: PageProps) {
  const { slug, roomId } = await params;
  const homestay = await appRepository.getHomestayBySlug(slug);
  const room = homestay?.rooms.find((item) => item.id === roomId);
  if (!homestay || !room) notFound();

  return (
    <Container className="py-8 lg:py-12">
      <Link
        href={`/homestays/${homestay.slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to {homestay.name}
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)]">
            <Image src={room.image} alt={room.name} fill priority className="object-cover" sizes="70vw" />
          </div>
          <div className="pt-8">
            <Badge tone={room.remaining <= 1 ? "warning" : "success"}>
              {room.remaining} room{room.remaining === 1 ? "" : "s"} left
            </Badge>
            <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">{room.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{room.description}</p>
            <div className="mt-7 flex flex-wrap gap-6 rounded-[var(--radius-lg)] bg-card p-5 text-sm shadow-[var(--shadow-sm)]">
              <span className="flex items-center gap-2"><Users className="size-5 text-primary" /> Up to {room.guests} guests</span>
              <span className="flex items-center gap-2"><BedDouble className="size-5 text-primary" /> {room.beds}</span>
              <span className="flex items-center gap-2"><Maximize2 className="size-5 text-primary" /> {room.size}</span>
            </div>
            <h2 className="mt-8 font-display text-2xl font-semibold">Room details</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Includes high-speed Wi-Fi, fresh towels, private bathroom access, soft lighting,
              and flexible self check-in. Final availability is confirmed when you submit your time.
            </p>
          </div>
        </div>
        <BookingPanel
          homestayId={homestay.id}
          roomId={room.id}
          hourlyPrice={room.hourlyPrice}
          overnightPrice={room.overnightPrice}
          dailyPrice={room.dailyPrice}
          minHours={room.minHours}
          maxHours={room.maxHours}
          maxGuests={room.guests}
        />
      </div>
    </Container>
  );
}
