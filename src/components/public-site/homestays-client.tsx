"use client";

import { SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/layout/container";
import { HomestayCard } from "@/components/public-site/homestay-card";
import { SearchBar } from "@/components/public-site/search-bar";
import { Button } from "@/components/ui/button";
import type { Homestay } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import type { SiteBuilderConfig } from "@/lib/site-builder";
import { textForLanguage } from "@/lib/site-builder";

type HomestaysClientProps = {
  results: Homestay[];
  siteConfig: SiteBuilderConfig;
};

export function HomestaysClient({ results, siteConfig }: HomestaysClientProps) {
  const { language, t } = useLanguage();
  const visibleSections = siteConfig.pages.homestays.sections.filter((section) => section.enabled);
  const hasGrid = visibleSections.some((section) => section.type === "resultGrid");

  return (
    <Container className="py-[var(--section-y-sm)] lg:py-[var(--section-y)]">
      {visibleSections.map((section) => {
        if (section.type === "listingHeader") {
          return (
            <div key={section.id} className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {textForLanguage(section.props.eyebrow, language)}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">{textForLanguage(section.props.title, language)}</h1>
              </div>
              <Button variant="ghost" className="hidden rounded-full sm:inline-flex">
                <SlidersHorizontal className="size-4" /> {t("homestays.filters")}
              </Button>
            </div>
          );
        }

        if (section.type === "listingSearch") {
          return (
            <div key={section.id} className="mt-5">
              <SearchBar compact defaultLocation={section.props.defaultLocation} />
            </div>
          );
        }

        if (section.type === "resultCount") {
          return (
            <p key={section.id} className="mt-5 text-sm font-medium text-muted-foreground">
              <strong className="text-foreground">{results.length}</strong> {textForLanguage(section.props.body, language)}
            </p>
          );
        }

        if (section.type === "resultGrid") {
          return (
            <div key={section.id} className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {results.map((homestay) => (
                <HomestayCard key={homestay.id} homestay={homestay} />
              ))}
            </div>
          );
        }

        return null;
      })}
      {results.length === 0 && hasGrid ? (
        <p className="py-20 text-center text-muted-foreground">
          {textForLanguage(visibleSections.find((section) => section.type === "resultGrid")?.props.emptyText, language)}
        </p>
      ) : null}
    </Container>
  );
}
