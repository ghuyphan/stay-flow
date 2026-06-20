"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Homestay } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

export function HomestayCard({ homestay }: { homestay: Homestay }) {
  const { language, t } = useLanguage();

  return (
    <article className="group">
      <Link href={`/homestays/${homestay.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-muted sm:aspect-[4/3]">
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
              <span key={tag} className="rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                {t(tag)}
              </span>
            ))}
          </div>
        </div>
        <div className="pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-tight md:text-base">{t(homestay.name)}</h3>
              <p className="mt-1 truncate text-xs text-muted-foreground md:text-sm">{t(homestay.location)}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold">
              <Star className="size-3.5 fill-current text-accent" />
              {homestay.rating}
            </span>
          </div>
          <div className="mt-3">
            <p>
              <span className="mr-1 text-xs text-muted-foreground">
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
