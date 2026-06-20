import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuilderRenderer } from "@/components/builder/builder-renderer";
import { homestays } from "@/lib/mock-data";
import { appRepository } from "@/server/repositories/app-repository";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return homestays.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const homestay = await appRepository.getHomestayBySlug(slug);
  if (!homestay) return {};
  return {
    title: `${homestay.name}, ${homestay.location}`,
    description: homestay.description,
    alternates: { canonical: `/homestays/${homestay.slug}` },
    openGraph: { title: homestay.name, description: homestay.description, images: [homestay.image] },
  };
}

import { Suspense } from "react";
import { HomestayDetailSkeleton } from "@/components/public-site/homestay-detail-skeleton";

export default async function HomestayDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [homestay, siteConfig] = await Promise.all([
    appRepository.getHomestayBySlug(slug),
    appRepository.getLiveSiteBuilder(),
  ]);
  if (!homestay) notFound();

  return (
    <Suspense fallback={<HomestayDetailSkeleton />}>
      <BuilderRenderer config={siteConfig} page={siteConfig.pages.detail} context={{ routeId: "detail", homestays: [homestay], homestay }} />
    </Suspense>
  );
}
