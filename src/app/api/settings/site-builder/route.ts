import { NextResponse } from "next/server";
import { appRepository } from "@/server/repositories/app-repository";
import { normalizeBuilderV2Config } from "@/lib/site-builder-v2";

export async function GET() {
  return NextResponse.json(await appRepository.getSiteBuilder());
}

export async function PUT(request: Request) {
  try {
    const current = await appRepository.getSiteBuilder();
    const config = normalizeBuilderV2Config(await request.json(), current.live);
    return NextResponse.json(await appRepository.saveSiteBuilderDraft(config));
  } catch {
    return NextResponse.json({ error: "Website builder settings are invalid." }, { status: 400 });
  }
}
