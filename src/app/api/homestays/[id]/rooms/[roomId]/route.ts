import { NextResponse } from "next/server";
import { appRepository } from "@/server/repositories/app-repository";
import { roomInputSchema } from "@/server/validation/homestay";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; roomId: string }> },
) {
  const parsed = roomInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { id, roomId } = await params;
  const room = await appRepository.updateRoom(id, roomId, parsed.data);
  return room
    ? NextResponse.json(room)
    : NextResponse.json({ error: "Room not found." }, { status: 404 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; roomId: string }> },
) {
  const { id, roomId } = await params;
  return (await appRepository.deleteRoom(id, roomId))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Keep at least one room." }, { status: 400 });
}
