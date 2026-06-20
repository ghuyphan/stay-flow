import type { Metadata } from "next";
import { BuilderRenderer } from "@/components/builder/builder-renderer";
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
  const [homestays, siteConfig] = await Promise.all([
    appRepository.listHomestays(),
    appRepository.getLiveSiteBuilder(),
  ]);
  const location = filters.location?.toLowerCase().trim();
  const guestCount = Number(filters.guests ?? "1");
  const results = homestays.filter(
    (homestay) =>
      (!location ||
        homestay.location.toLowerCase().includes(location) ||
        homestay.name.toLowerCase().includes(location)) &&
      homestay.rooms.some((room) => room.guests >= guestCount),
  );

  return <BuilderRenderer config={siteConfig} page={siteConfig.pages.homestays} context={{ routeId: "homestays", homestays, results }} />;
}
