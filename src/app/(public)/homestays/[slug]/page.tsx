import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomestayDetailClient } from "@/components/public-site/homestay-detail-client";
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

export default async function HomestayDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const homestay = await appRepository.getHomestayBySlug(slug);
  if (!homestay) notFound();

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading...</div>}>
      <HomestayDetailClient homestay={homestay} />
    </Suspense>
  );
}
