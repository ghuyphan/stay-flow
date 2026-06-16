import { NextResponse } from "next/server";
import { appRepository } from "@/server/repositories/app-repository";
import { homestayInputSchema } from "@/server/validation/homestay";

export async function GET() {
  return NextResponse.json(await appRepository.listHomestays());
}

export async function POST(request: Request) {
  const parsed = homestayInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  try {
    return NextResponse.json(await appRepository.createHomestay(parsed.data), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create homestay." },
      { status: 400 },
    );
  }
}
