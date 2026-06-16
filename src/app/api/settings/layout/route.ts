import { NextResponse } from "next/server";
import { z } from "zod";
import { layoutSectionIds } from "@/lib/layout-sections";
import { appRepository } from "@/server/repositories/app-repository";

const schema = z.array(
  z.object({
    id: z.enum(layoutSectionIds),
    name: z.string().max(60),
    enabled: z.boolean(),
  }),
);

export async function GET() {
  return NextResponse.json(await appRepository.getLayout());
}

export async function PUT(request: Request) {
  const parsed = schema.safeParse(await request.json());
  return parsed.success
    ? NextResponse.json(await appRepository.saveLayout(parsed.data))
    : NextResponse.json({ error: "Invalid layout." }, { status: 400 });
}
