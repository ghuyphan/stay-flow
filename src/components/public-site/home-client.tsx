"use client";

import { ArrowRight, Clock3, CreditCard, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { HomestayCard } from "@/components/public-site/homestay-card";
import { SearchBar } from "@/components/public-site/search-bar";
import { Badge } from "@/components/ui/badge";
import type { Homestay } from "@/lib/types";
import type { StoredLayoutSection } from "@/server/repositories/app-repository";
import { useLanguage } from "@/components/language-provider";

type HomeClientProps = {
  homestays: Homestay[];
  layout: StoredLayoutSection[];
};

export function HomeClient({ homestays, layout }: HomeClientProps) {
  const { t } = useLanguage();
  const featured = homestays.slice(0, 4);
  const hero = featured[0];
  if (!hero) return null;
  const visibleSections = layout.filter((section) => section.enabled);
  const heroVisible = visibleSections.some((section) => section.id === "hero");

  return (
    <>
      {visibleSections.map((section) => {
        if (section.id === "hero") {
          return (
            <section key={section.id} className="py-8 md:py-12">
              <Container>
                <div className="relative min-h-[520px] overflow-hidden rounded-[var(--radius-lg)]">
                  <Image
                    src={hero.image}
                    alt={`${t(hero.name)} in ${t(hero.location)}`}
                    fill
                    loading="eager"
                    priority
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
                  <div className="relative flex min-h-[520px] max-w-xl flex-col justify-end p-6 text-white md:p-10">
                    <p className="text-sm font-semibold">{t(hero.location)}</p>
                    <h1 className="mt-2 font-display text-5xl font-semibold leading-none md:text-6xl">
                      {t("hero.title")}
                    </h1>
                    <p className="mt-4 max-w-md text-white/80">
                      {t("hero.subtitle")}
                    </p>
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if (section.id === "search") {
          return (
            <section key={section.id} className={heroVisible ? "relative z-10 -mt-10 pb-8" : "py-8"}>
              <Container>
                <div className="mx-auto max-w-5xl px-3">
                  <SearchBar />
                </div>
              </Container>
            </section>
          );
        }

        if (section.id === "rooms") {
          return (
            <section key={section.id} className="py-12 md:py-16">
              <Container>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("home.featured_subtitle")}</p>
                    <h2 className="mt-1 font-display text-3xl font-semibold">{t("home.featured_title")}</h2>
                  </div>
                  <Link href="/homestays" className="flex items-center gap-2 text-sm font-semibold">
                    {t("home.view_all")} <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="mt-7 grid gap-x-6 gap-y-10 md:grid-cols-2">
                  {featured.map((homestay) => (
                    <HomestayCard key={homestay.id} homestay={homestay} />
                  ))}
                </div>
              </Container>
            </section>
          );
        }

        if (section.id === "trust") {
          const items = [
            { icon: Clock3, title: t("home.trust_1_title"), body: t("home.trust_1_desc") },
            { icon: ShieldCheck, title: t("home.trust_2_title"), body: t("home.trust_2_desc") },
            { icon: CreditCard, title: t("home.trust_3_title"), body: t("home.trust_3_desc") },
          ];
          return (
            <section key={section.id} className="py-12">
              <Container>
                <div className="grid gap-4 md:grid-cols-3">
                  {items.map(({ icon: Icon, title, body }) => (
                    <div key={title} className="rounded-[var(--radius-lg)] bg-card p-5 shadow-[var(--shadow-sm)]">
                      <Icon className="size-5 text-primary" />
                      <h2 className="mt-5 font-semibold">{title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                    </div>
                  ))}
                </div>
              </Container>
            </section>
          );
        }

        if (section.id === "gallery") {
          return (
            <section key={section.id} className="py-12">
              <Container>
                <div className="grid h-[360px] gap-3 overflow-hidden rounded-[var(--radius-lg)] md:grid-cols-3">
                  {hero.gallery.slice(0, 3).map((image, index) => (
                    <div key={image} className={`relative ${index === 0 ? "md:col-span-2" : ""}`}>
                      <Image
                        src={image}
                        alt={`${t(hero.name)} gallery ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </Container>
            </section>
          );
        }

        if (section.id === "amenities") {
          return (
            <section key={section.id} className="py-12">
              <Container>
                <div className="rounded-[var(--radius-lg)] bg-card p-6 shadow-[var(--shadow-sm)]">
                  <p className="text-sm text-muted-foreground">{t(hero.name)}</p>
                  <h2 className="mt-1 font-display text-3xl font-semibold">{t("home.amenities_title")}</h2>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {hero.amenities.map((amenity) => (
                      <Badge key={amenity} tone="primary">
                        {t(amenity)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if (section.id === "faq") {
          return (
            <section key={section.id} className="py-12 md:pb-20">
              <Container>
                <div className="grid gap-6 rounded-[var(--radius-lg)] bg-card p-6 shadow-[var(--shadow-sm)] md:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <p className="text-sm text-primary">FAQ</p>
                    <h2 className="mt-1 font-display text-3xl font-semibold">{t("home.faq_title")}</h2>
                  </div>
                  <div className="grid gap-5">
                    <div>
                      <h3 className="font-semibold">{t("home.faq_1_q")}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t("home.faq_1_a")}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("home.faq_2_q")}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t("home.faq_2_a")}</p>
                    </div>
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        return null;
      })}
    </>
  );
}
