import { NextResponse } from "next/server";
import { appRepository } from "@/server/repositories/app-repository";

export async function POST() {
  try {
    return NextResponse.json(await appRepository.publishSiteBuilderDraft());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Website builder draft is invalid." },
      { status: 400 },
    );
  }
}
