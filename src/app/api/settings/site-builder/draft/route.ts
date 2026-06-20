import { NextResponse } from "next/server";
import { normalizeBuilderV2Config } from "@/lib/site-builder-v2";
import { appRepository } from "@/server/repositories/app-repository";

export async function PUT(request: Request) {
  try {
    const current = await appRepository.getSiteBuilder();
    const config = normalizeBuilderV2Config(await request.json(), current.live);
    return NextResponse.json(await appRepository.saveSiteBuilderDraft(config));
  } catch {
    return NextResponse.json({ error: "Website builder draft is invalid." }, { status: 400 });
  }
}
