"use client";

import { SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { HomestayCard } from "@/components/public-site/homestay-card";
import { SearchBar } from "@/components/public-site/search-bar";
import { Button } from "@/components/ui/button";
import type { Homestay } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";

type HomestaysClientProps = {
  results: Homestay[];
};

export function HomestaysClient({ results }: HomestaysClientProps) {
  const { t } = useLanguage();

  return (
    <Container className="py-12 lg:py-16">
      <PageHeader
        eyebrow={t("homestays.eyebrow")}
        title={t("homestays.title")}
        description={t("homestays.desc")}
      />
      <div className="mt-8">
        <SearchBar compact />
      </div>
      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{results.length}</strong> {t("homestays.stays_count", { count: results.length })}
        </p>
        <Button variant="outline">
          <SlidersHorizontal className="size-4" /> {t("homestays.filters")}
        </Button>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {results.map((homestay) => (
          <HomestayCard key={homestay.id} homestay={homestay} />
        ))}
      </div>
      {results.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t("homestays.no_results")}</p>
      ) : null}
    </Container>
  );
}
