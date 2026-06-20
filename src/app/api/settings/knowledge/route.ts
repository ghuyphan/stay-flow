import { NextResponse } from "next/server";
import { z } from "zod";
import { appRepository } from "@/server/repositories/app-repository";

const knowledgeItemSchema = z.object({
  id: z.string().min(1),
  titleEn: z.string().trim().min(2).max(120),
  titleVi: z.string().trim().min(2).max(120),
  contentEn: z.string().trim().min(5).max(2000),
  contentVi: z.string().trim().min(5).max(2000),
  enabled: z.boolean(),
});

const schema = z.array(knowledgeItemSchema).min(1).max(20);

export async function GET() {
  return NextResponse.json(await appRepository.listKnowledge());
}

export async function PUT(request: Request) {
  const parsed = schema.safeParse(await request.json());
  return parsed.success
    ? NextResponse.json(await appRepository.saveKnowledge(parsed.data))
    : NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Kiến thức không hợp lệ." }, { status: 400 });
}
