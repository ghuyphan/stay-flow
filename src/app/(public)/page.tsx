import { appRepository } from "@/server/repositories/app-repository";
import { HomeClient } from "@/components/public-site/home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [homestays, layout] = await Promise.all([
    appRepository.listHomestays(),
    appRepository.getLayout(),
  ]);

  return <HomeClient homestays={homestays} layout={layout} />;
}
