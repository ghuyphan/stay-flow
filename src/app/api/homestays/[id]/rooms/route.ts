import { NextResponse } from "next/server";
import { appRepository } from "@/server/repositories/app-repository";
import { roomInputSchema } from "@/server/validation/homestay";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = roomInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const room = await appRepository.createRoom((await params).id, parsed.data);
  return room
    ? NextResponse.json(room, { status: 201 })
    : NextResponse.json({ error: "Homestay not found." }, { status: 404 });
}
