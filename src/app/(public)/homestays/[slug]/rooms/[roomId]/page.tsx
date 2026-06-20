import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuilderRenderer } from "@/components/builder/builder-renderer";
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

  const siteConfig = await appRepository.getLiveSiteBuilder();
  return <BuilderRenderer config={siteConfig} page={siteConfig.pages.room} context={{ routeId: "room", homestays: [homestay], homestay, room }} />;
}
