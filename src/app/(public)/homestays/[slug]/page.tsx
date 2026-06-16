import type { Metadata } from "next";
import { Clock3, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/components/booking/booking-panel";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { RoomCard } from "@/components/public-site/room-card";
import { homestays } from "@/lib/mock-data";
import { appRepository } from "@/server/repositories/app-repository";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return homestays.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const homestay = await appRepository.getHomestayBySlug(slug);
  if (!homestay) return {};
  return {
    title: `${homestay.name}, ${homestay.location}`,
    description: homestay.description,
    alternates: { canonical: `/homestays/${homestay.slug}` },
    openGraph: { title: homestay.name, description: homestay.description, images: [homestay.image] },
  };
}

export default async function HomestayDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const homestay = await appRepository.getHomestayBySlug(slug);
  if (!homestay) notFound();

  return (
    <>
      <Container className="py-8 lg:py-12">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">{homestay.tags.map((tag) => <Badge key={tag} tone="primary">{tag}</Badge>)}</div>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">{homestay.name}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="size-4" /> {homestay.location}</span>
              <span className="flex items-center gap-1"><Star className="size-4 fill-current text-accent" /> {homestay.rating} ({homestay.reviewCount} reviews)</span>
            </p>
          </div>
        </div>
        <div className="grid h-[460px] grid-cols-1 gap-2 overflow-hidden rounded-[var(--radius-lg)] md:grid-cols-2">
          <div className="relative"><Image src={homestay.gallery[0]} alt={`${homestay.name} exterior`} fill priority className="object-cover" sizes="50vw" /></div>
          <div className="hidden grid-cols-2 gap-2 md:grid">
            {homestay.gallery.slice(1, 4).map((image, index) => (
              <div key={image} className={`relative ${index === 0 ? "col-span-2" : ""}`}>
                <Image src={image} alt={`${homestay.name} gallery image ${index + 2}`} fill className="object-cover" sizes="25vw" />
              </div>
            ))}
          </div>
        </div>
      </Container>

      <Container className="grid gap-12 pb-20 lg:grid-cols-[1fr_360px] lg:pb-28">
        <div>
          <section className="pb-10">
            <p className="font-display text-3xl font-semibold">Private by the hour or overnight</p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{homestay.description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3"><Sparkles className="size-5 text-primary" /><div><p className="font-semibold">Short-stay ready</p><p className="text-sm text-muted-foreground">Hourly, overnight, daily</p></div></div>
              <div className="flex gap-3"><Clock3 className="size-5 text-primary" /><div><p className="font-semibold">Easy arrival</p><p className="text-sm text-muted-foreground">Pick the exact time</p></div></div>
              <div className="flex gap-3"><ShieldCheck className="size-5 text-primary" /><div><p className="font-semibold">Book securely</p><p className="text-sm text-muted-foreground">Protected payment</p></div></div>
            </div>
          </section>
          <section className="rounded-[var(--radius-lg)] bg-card p-6 shadow-[var(--shadow-sm)]">
            <h2 className="font-display text-3xl font-semibold">What this place offers</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {homestay.amenities.map((amenity) => <p key={amenity} className="flex items-center gap-3 text-sm"><span className="size-2 rounded-full bg-primary" />{amenity}</p>)}
            </div>
          </section>
          <section className="pt-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Choose your room</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">Rooms available for your stay</h2>
            </div>
            <div className="mt-7 grid gap-5">
              {homestay.rooms.map((room) => <RoomCard key={room.id} room={room} slug={homestay.slug} />)}
            </div>
          </section>
        </div>
        <BookingPanel
          homestayId={homestay.id}
          roomId={homestay.rooms[0].id}
          hourlyPrice={homestay.rooms[0].hourlyPrice}
          overnightPrice={homestay.rooms[0].overnightPrice}
          dailyPrice={homestay.rooms[0].dailyPrice}
          minHours={homestay.rooms[0].minHours}
          maxHours={homestay.rooms[0].maxHours}
          maxGuests={homestay.rooms[0].guests}
        />
      </Container>
    </>
  );
}
