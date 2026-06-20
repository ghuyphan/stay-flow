"use client";

import { ArrowRight, Gamepad2, KeyRound, MapPin, Sparkles, Star, Utensils, Wifi } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { HomestayCard } from "@/components/public-site/homestay-card";
import { SearchBar } from "@/components/public-site/search-bar";
import type { Homestay } from "@/lib/types";
import type { BuilderIconName, SiteBuilderConfig, SiteSectionInstance } from "@/lib/site-builder";
import { textForLanguage } from "@/lib/site-builder";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

type HomeClientProps = {
  homestays: Homestay[];
  siteConfig: SiteBuilderConfig;
  builderEditing?: {
    selectedSectionId?: string;
    onSelectSection?: (sectionId: string) => void;
    onTextChange?: (sectionId: string, field: "eyebrow" | "title" | "subtitle", value: string, language: "en" | "vi") => void;
  };
};

const iconMap: Record<BuilderIconName, typeof Sparkles> = {
  sparkles: Sparkles,
  key: KeyRound,
  utensils: Utensils,
  gamepad: Gamepad2,
  wifi: Wifi,
  map: MapPin,
  star: Star,
};

export function HomeClient({ homestays, siteConfig, builderEditing }: HomeClientProps) {
  const { language, t } = useLanguage();
  const hero = homestays[0];
  if (!hero) return null;
  const visibleSections = siteConfig.pages.home.sections.filter((section) => section.enabled);

  return (
    <>
      {visibleSections.map((section, index) => {
        if (section.type === "hero") {
          const image = section.props.image || hero.rooms[0]?.image || hero.gallery[1] || hero.image;
          const overlay =
            section.style.overlay === "strong"
              ? "bg-[linear-gradient(90deg,var(--color-card)_0%,rgb(255_255_255_/_0.9)_42%,rgb(255_255_255_/_0.22)_72%,transparent_100%)]"
              : section.style.overlay === "none"
                ? "bg-transparent"
                : "bg-[linear-gradient(90deg,var(--color-card)_0%,rgb(255_255_255_/_0.82)_34%,rgb(255_255_255_/_0.2)_64%,transparent_100%)]";
          return (
            <section key={section.id} className="pt-0 md:py-[var(--section-y-sm)]">
              <Container>
                <div className="relative -mx-4 min-h-[420px] overflow-hidden bg-card shadow-[var(--shadow-md)] md:mx-0 md:min-h-[500px] md:rounded-[var(--radius-lg)] md:border md:border-border">
                  <Image
                    src={image}
                    alt={textForLanguage(section.props.title, language) || `${t(hero.name)} in ${t(hero.location)}`}
                    fill
                    loading="eager"
                    priority
                    className="object-cover object-[64%_center]"
                    sizes="100vw"
                  />
                  <div className={`absolute inset-0 ${overlay}`} />
                  <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-card via-card/60 to-transparent md:hidden" />
                  <div className="relative flex min-h-[420px] max-w-lg flex-col justify-end p-6 md:min-h-[500px] md:p-10">
                    <div className="pb-16 pt-6 md:pb-16">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-accent">
                        <MapPin className="size-4" />
                        <EditablePreviewText
                          value={textForLanguage(section.props.eyebrow, language) || t(hero.location)}
                          enabled={Boolean(builderEditing?.onTextChange)}
                          selected={builderEditing?.selectedSectionId === section.id}
                          onFocus={() => builderEditing?.onSelectSection?.(section.id)}
                          onCommit={(value) => builderEditing?.onTextChange?.(section.id, "eyebrow", value, language)}
                        />
                      </p>
                      <h1 className="mt-3 max-w-[11ch] font-display text-[2.75rem] font-semibold leading-none md:text-6xl">
                        <EditablePreviewText
                          value={textForLanguage(section.props.title, language)}
                          enabled={Boolean(builderEditing?.onTextChange)}
                          selected={builderEditing?.selectedSectionId === section.id}
                          onFocus={() => builderEditing?.onSelectSection?.(section.id)}
                          onCommit={(value) => builderEditing?.onTextChange?.(section.id, "title", value, language)}
                        />
                      </h1>
                      <p className="mt-4 max-w-[18rem] text-sm leading-6 text-muted-foreground md:text-base">
                        <EditablePreviewText
                          value={textForLanguage(section.props.subtitle, language)}
                          enabled={Boolean(builderEditing?.onTextChange)}
                          selected={builderEditing?.selectedSectionId === section.id}
                          onFocus={() => builderEditing?.onSelectSection?.(section.id)}
                          onCommit={(value) => builderEditing?.onTextChange?.(section.id, "subtitle", value, language)}
                        />
                      </p>
                      {section.props.primaryCta?.href ? (
                        <Link href={section.props.primaryCta.href} className="mt-6 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-foreground/85">
                          {textForLanguage(section.props.primaryCta.label, language)}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if (section.type === "search") {
          const followsHero = visibleSections[index - 1]?.type === "hero";
          return (
            <section key={section.id} className={followsHero ? "relative z-10 -mt-14 pb-[var(--section-y-sm)] md:-mt-10" : "py-[var(--section-y-sm)]"}>
              <Container>
                <div className="mx-auto max-w-4xl px-1 md:px-0">
                  <SearchBar
                    defaultLocation={section.props.defaultLocation}
                    enabledStayTypes={section.props.enabledStayTypes}
                  />
                </div>
              </Container>
            </section>
          );
        }

        if (section.type === "featuredStays") {
          return <FeaturedStaysSection key={section.id} section={section} homestays={homestays} />;
        }

        if (section.type === "trust") {
          const items = section.props.items ?? [];
          return (
            <section key={section.id} className="py-[calc(var(--section-y-sm)*0.75)]">
              <Container>
                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-3">
                  {items.map((item) => {
                    const Icon = iconMap[item.icon ?? "sparkles"] ?? Sparkles;
                    return (
                      <div key={item.id} title={textForLanguage(item.body, language)} className="grid min-h-24 place-items-center bg-card p-3 text-center">
                        <span className="grid size-9 place-items-center rounded-full bg-muted text-foreground">
                          <Icon className="size-5" />
                        </span>
                        <h2 className="mt-2 text-xs font-semibold leading-tight md:text-sm">{textForLanguage(item.title, language)}</h2>
                      </div>
                    );
                  })}
                </div>
              </Container>
            </section>
          );
        }

        if (section.type === "gallery") {
          const images = (section.props.images?.length ? section.props.images : hero.gallery).slice(0, 4);
          return (
            <section key={section.id} className="py-[var(--section-y-sm)]">
              <Container>
                <div className="grid h-[300px] gap-2 overflow-hidden rounded-[var(--radius-lg)] md:grid-cols-3">
                  {images.slice(0, 3).map((image, imageIndex) => (
                    <div key={`${image}-${imageIndex}`} className={`relative ${imageIndex === 0 ? "md:col-span-2" : ""}`}>
                      <Image
                        src={image}
                        alt={`${t(hero.name)} gallery ${imageIndex + 1}`}
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

        if (section.type === "amenities") {
          const items = section.props.items?.length
            ? section.props.items.map((item) => textForLanguage(item.title, language))
            : hero.amenities.map((amenity) => t(amenity));
          return (
            <section key={section.id} className="py-[var(--section-y-sm)]">
              <Container>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{textForLanguage(section.props.title, language)}</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {items.map((amenity) => (
                      <span key={amenity} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if (section.type === "faq") {
          return (
            <section key={section.id} className="py-[var(--section-y-sm)] md:pb-[calc(var(--section-y)*1.35)]">
              <Container>
                <h2 className="mb-4 text-xl font-semibold tracking-tight">{textForLanguage(section.props.title, language)}</h2>
                <div className="grid gap-2 md:grid-cols-2">
                  {(section.props.faqs ?? []).map((faq) => (
                    <div key={faq.id} className="border-t border-border py-4">
                      <h3 className="font-semibold">{textForLanguage(faq.question, language)}</h3>
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{textForLanguage(faq.answer, language)}</p>
                    </div>
                  ))}
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

function EditablePreviewText({
  value,
  enabled,
  selected,
  onFocus,
  onCommit,
}: {
  value: string;
  enabled: boolean;
  selected: boolean;
  onFocus: () => void;
  onCommit: (value: string) => void;
}) {
  if (!enabled) return <>{value}</>;

  return (
    <span
      data-builder-editable="true"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      className={cn(
        "-mx-1 inline-block max-w-full rounded-md px-1 outline-none transition",
        "hover:bg-primary/10 focus:bg-card/80 focus:ring-2 focus:ring-primary/35",
        selected && "bg-primary/10 ring-1 ring-primary/25",
      )}
      onFocus={onFocus}
      onBlur={(event) => {
        const nextValue = event.currentTarget.textContent?.trim() ?? "";
        if (nextValue && nextValue !== value) onCommit(nextValue);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </span>
  );
}

function FeaturedStaysSection({ section, homestays }: { section: SiteSectionInstance; homestays: Homestay[] }) {
  const { language } = useLanguage();
  const selected = section.props.source === "manual" && section.props.homestayIds?.length
    ? section.props.homestayIds.flatMap((id) => homestays.find((homestay) => homestay.id === id) ?? [])
    : homestays.slice(0, section.props.itemCount ?? 4);

  return (
    <section className="py-[var(--section-y-sm)] md:py-[var(--section-y)]">
      <Container>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{textForLanguage(section.props.eyebrow, language)}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{textForLanguage(section.props.title, language)}</h2>
          </div>
          {section.props.primaryCta?.href ? (
            <Link href={section.props.primaryCta.href} className="hidden items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/85 sm:flex">
              {textForLanguage(section.props.primaryCta.label, language)} <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
          {selected.map((homestay) => (
            <HomestayCard key={homestay.id} homestay={homestay} />
          ))}
        </div>
        {section.props.primaryCta?.href ? (
          <Link href={section.props.primaryCta.href} className="mt-6 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-muted px-4 py-3 text-sm font-semibold sm:hidden">
            {textForLanguage(section.props.primaryCta.label, language)} <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </Container>
    </section>
  );
}
