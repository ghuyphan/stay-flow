import { NextResponse } from "next/server";
import { z } from "zod";
import { layoutPageDefinitions } from "@/lib/layout-sections";
import { appRepository } from "@/server/repositories/app-repository";

const sectionSchema = z.object({
  id: z.string().max(80),
  name: z.string().max(60),
  enabled: z.boolean(),
});

const legacySchema = z.array(
  z.object({
    id: z.string().refine(
      (id) => layoutPageDefinitions.home.sections.some((section) => section.id === id),
      "Unknown home section",
    ),
    name: z.string().max(60),
    enabled: z.boolean(),
  }),
);

const schema = z.object({
  home: z.array(sectionSchema),
  homestays: z.array(sectionSchema),
  detail: z.array(sectionSchema),
});

const requestSchema = z.union([legacySchema, schema]);

const responseSchema = z.object({
  home: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      enabled: z.boolean(),
    }),
  ),
  homestays: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      enabled: z.boolean(),
    }),
  ),
  detail: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      enabled: z.boolean(),
    }),
  ),
});

export async function GET() {
  return NextResponse.json(responseSchema.parse(await appRepository.getLayouts()));
}

export async function PUT(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Bố cục không hợp lệ." }, { status: 400 });
  }

  if (Array.isArray(parsed.data)) {
    return NextResponse.json(await appRepository.saveLayout(parsed.data));
  }

  return NextResponse.json(await appRepository.saveLayouts(parsed.data));
}
