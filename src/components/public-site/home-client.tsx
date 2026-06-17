"use client";

import { ArrowRight, Clock3, CreditCard, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { HomestayCard } from "@/components/public-site/homestay-card";
import { SearchBar } from "@/components/public-site/search-bar";
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
  const heroImage = hero.rooms[0]?.image ?? hero.gallery[1] ?? hero.image;
  const visibleSections = layout.filter((section) => section.enabled);
  const heroVisible = visibleSections.some((section) => section.id === "hero");

  return (
    <>
      {visibleSections.map((section) => {
        if (section.id === "hero") {
          return (
            <section key={section.id} className="pt-0 md:py-10">
              <Container>
                <div className="relative -mx-4 min-h-[500px] overflow-hidden bg-card md:mx-0 md:min-h-[560px] md:rounded-[calc(var(--radius-lg)+0.75rem)] md:border md:border-border md:shadow-[var(--shadow-sm)]">
                  <Image
                    src={heroImage}
                    alt={`${t(hero.name)} in ${t(hero.location)}`}
                    fill
                    loading="eager"
                    priority
                    className="object-cover object-[64%_center]"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-card)_0%,rgb(255_253_248_/_0.96)_31%,rgb(255_253_248_/_0.58)_55%,transparent_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-card via-card/72 to-transparent md:hidden" />
                  <div className="relative flex min-h-[500px] max-w-xl flex-col justify-between p-6 md:min-h-[560px] md:p-10">
                    <div />
                    <div className="pb-20 pt-6 md:pb-20">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-accent md:hidden">
                        <MapPin className="size-4" />
                        {t(hero.location)}
                      </p>
                      <h1 className="mt-3 max-w-[10.5ch] font-display text-[3.25rem] font-semibold leading-[0.98] tracking-tight md:text-6xl">
                        {t("hero.title")}
                      </h1>
                      <div className="mt-4 h-1 w-16 rounded-full bg-primary md:mt-5" />
                      <p className="mt-5 max-w-[16rem] text-base leading-7 text-muted-foreground">
                        {t("hero.subtitle")}
                      </p>
                    </div>
                    <div className="hidden flex-wrap gap-2 text-sm font-semibold text-muted-foreground md:flex">
                      <span className="rounded-full bg-card/90 px-3 py-1.5 shadow-sm">Short</span>
                      <span className="rounded-full bg-card/90 px-3 py-1.5 shadow-sm">One day</span>
                      <span className="rounded-full bg-card/90 px-3 py-1.5 shadow-sm">Overnight</span>
                    </div>
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if (section.id === "search") {
          return (
            <section key={section.id} className={heroVisible ? "relative z-10 -mt-20 pb-8 md:-mt-12" : "py-8"}>
              <Container>
                <div className="mx-auto max-w-5xl px-1 md:px-6">
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
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-accent">{t("home.featured_subtitle")}</p>
                    <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{t("home.featured_title")}</h2>
                  </div>
                  <Link href="/homestays" className="hidden items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary sm:flex">
                    {t("home.view_all")} <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {featured.map((homestay) => (
                    <HomestayCard key={homestay.id} homestay={homestay} />
                  ))}
                </div>
                <Link href="/homestays" className="mt-6 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-muted px-4 py-3 text-sm font-semibold sm:hidden">
                  {t("home.view_all")} <ArrowRight className="size-4" />
                </Link>
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
                    <div key={title} className="rounded-[var(--radius-lg)] border border-border bg-card/70 p-5">
                      <span className="grid size-10 place-items-center rounded-full bg-primary/20 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <h2 className="mt-4 font-semibold">{title}</h2>
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
                <div className="grid h-[320px] gap-3 overflow-hidden rounded-[calc(var(--radius-lg)+0.5rem)] md:grid-cols-3">
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
                <div className="rounded-[var(--radius-lg)] border border-border bg-card/70 p-6">
                  <p className="text-sm font-semibold text-accent">{t(hero.name)}</p>
                  <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{t("home.amenities_title")}</h2>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {hero.amenities.map((amenity) => (
                      <span key={amenity} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground">
                        {t(amenity)}
                      </span>
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
                <div className="grid gap-6 rounded-[var(--radius-lg)] border border-border bg-card/70 p-6 md:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <p className="text-sm font-semibold text-accent">FAQ</p>
                    <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{t("home.faq_title")}</h2>
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
