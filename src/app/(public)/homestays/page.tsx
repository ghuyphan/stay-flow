import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { HomestayCard } from "@/components/public-site/homestay-card";
import { SearchBar } from "@/components/public-site/search-bar";
import { Button } from "@/components/ui/button";
import { appRepository } from "@/server/repositories/app-repository";

export const metadata: Metadata = {
  title: "Homestays",
  description: "Browse distinctive, verified homestays across Vietnam.",
};

export default async function HomestaysPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; guests?: string }>;
}) {
  const filters = await searchParams;
  const homestays = await appRepository.listHomestays();
  const location = filters.location?.toLowerCase().trim();
  const guestCount = Number(filters.guests ?? "1");
  const results = homestays.filter(
    (homestay) =>
      (!location ||
        homestay.location.toLowerCase().includes(location) ||
        homestay.name.toLowerCase().includes(location)) &&
      homestay.rooms.some((room) => room.guests >= guestCount),
  );
  return (
    <Container className="py-12 lg:py-16">
      <PageHeader
        eyebrow="Explore"
        title="Find your kind of stay"
        description="From cool mountain mornings to lantern-lit river evenings."
      />
      <div className="mt-8">
        <SearchBar compact />
      </div>
      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm text-muted-foreground"><strong className="text-foreground">{results.length}</strong> stays</p>
        <Button variant="outline"><SlidersHorizontal className="size-4" /> Filters</Button>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {results.map((homestay) => <HomestayCard key={homestay.id} homestay={homestay} />)}
      </div>
      {results.length === 0 ? <p className="py-20 text-center text-muted-foreground">No stays match those filters.</p> : null}
    </Container>
  );
}
