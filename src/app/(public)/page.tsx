import { appRepository } from "@/server/repositories/app-repository";
import { BuilderRenderer } from "@/components/builder/builder-renderer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [homestays, siteConfig] = await Promise.all([
    appRepository.listHomestays(),
    appRepository.getLiveSiteBuilder(),
  ]);

  return <BuilderRenderer config={siteConfig} page={siteConfig.pages.home} context={{ routeId: "home", homestays }} />;
}
