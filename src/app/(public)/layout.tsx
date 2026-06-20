import { PublicSiteShell } from "@/components/layout/public-site-shell";
import { appRepository } from "@/server/repositories/app-repository";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const siteConfig = await appRepository.getLiveSiteBuilder();
  return <PublicSiteShell siteConfig={siteConfig}>{children}</PublicSiteShell>;
}
