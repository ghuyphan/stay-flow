"use client";

import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Homestay } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

export function HomestayCard({ homestay }: { homestay: Homestay }) {
  const { language, t } = useLanguage();

  return (
    <article className="group overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-sm)] transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/homestays/${homestay.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={homestay.image}
            alt={`${homestay.name} in ${homestay.location}`}
            fill
            loading="lazy"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {homestay.tags.slice(0, 1).map((tag) => (
              <Badge key={tag} className="bg-card/92 text-foreground backdrop-blur">
                {t(tag)}
              </Badge>
            ))}
          </div>
          <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/92 text-foreground backdrop-blur">
            <Heart className="size-4" />
          </span>
        </div>
        <div className="p-3 md:p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-tight md:text-base">{t(homestay.name)}</h3>
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground md:text-sm">
                <MapPin className="size-3.5 shrink-0" />
                {t(homestay.location)}
              </p>
            </div>
            <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold sm:flex">
              <Star className="size-4 fill-current text-accent" />
              {homestay.rating}
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2 md:mt-4">
            <span className="hidden line-clamp-1 text-xs font-medium text-muted-foreground sm:inline">
              {homestay.tags.slice(1, 3).map((tag) => t(tag)).join(" · ")}
            </span>
            <p className="shrink-0 text-left sm:text-right">
              <span className="mr-1 block text-xs text-muted-foreground md:inline">
                {language === "vi" ? "từ" : "from"}
              </span>
              <span className="font-semibold md:text-base">{formatCurrency(homestay.priceFrom)}</span>
              <span className="text-sm text-muted-foreground"> / 3h</span>
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
