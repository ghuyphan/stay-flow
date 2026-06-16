import { NextResponse } from "next/server";
import { appRepository } from "@/server/repositories/app-repository";
import { homestayInputSchema } from "@/server/validation/homestay";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = homestayInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  try {
    const homestay = await appRepository.updateHomestay((await params).id, parsed.data);
    return homestay
      ? NextResponse.json(homestay)
      : NextResponse.json({ error: "Homestay not found." }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update homestay." },
      { status: 400 },
    );
  }
}
