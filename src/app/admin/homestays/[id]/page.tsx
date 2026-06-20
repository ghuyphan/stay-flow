import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { HomestayForm } from "@/components/admin/homestay-form";
import { RoomManager } from "@/components/admin/room-manager";
import { appRepository } from "@/server/repositories/app-repository";

export default async function ManageHomestayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const homestay = await appRepository.getHomestay(id);
  if (!homestay) notFound();
  return (
    <div>
      <PageHeader title={homestay.name} description={`${homestay.location} · ${homestay.rooms.length} phòng`} />
      <HomestayForm homestay={homestay} />
      <RoomManager homestayId={homestay.id} initialRooms={homestay.rooms} />
    </div>
  );
}
