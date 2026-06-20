import { SiteBuilderV2Editor } from "@/components/builder/site-builder-v2-editor";
import { appRepository } from "@/server/repositories/app-repository";

export const dynamic = "force-dynamic";

export default async function LayoutBuilderPage() {
  const [siteBuilder, homestays] = await Promise.all([
    appRepository.getSiteBuilder(),
    appRepository.listHomestays(),
  ]);

  return <SiteBuilderV2Editor initialSiteBuilder={siteBuilder} homestays={homestays} />;
}
