import { NextResponse } from "next/server";
import { z } from "zod";
import { appRepository } from "@/server/repositories/app-repository";

const schema = z.object({
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  card: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  muted: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  border: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  mode: z.enum(["light", "dark", "system"]),
  radius: z.enum(["sm", "md", "lg"]),
  font: z.enum(["manrope", "inter", "system"]),
  density: z.enum(["compact", "comfortable", "spacious"]),
  cardStyle: z.enum(["flat", "soft", "elevated"]),
});

export async function GET() {
  return NextResponse.json(await appRepository.getTheme());
}

export async function PUT(request: Request) {
  const parsed = schema.safeParse(await request.json());
  return parsed.success
    ? NextResponse.json(await appRepository.saveTheme(parsed.data))
    : NextResponse.json({ error: "Giao diện không hợp lệ." }, { status: 400 });
}
