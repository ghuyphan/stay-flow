import { BuilderRenderer } from "@/components/builder/builder-renderer";
import { appRepository } from "@/server/repositories/app-repository";

export default async function SupportPage() {
  const [siteConfig, homestays] = await Promise.all([
    appRepository.getLiveSiteBuilder(),
    appRepository.listHomestays(),
  ]);
  return <BuilderRenderer config={siteConfig} page={siteConfig.pages.support} context={{ routeId: "support", homestays }} />;
}
