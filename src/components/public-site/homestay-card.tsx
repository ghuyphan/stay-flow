"use client";

import { ArrowUpRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Homestay } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

export function HomestayCard({ homestay }: { homestay: Homestay }) {
  const { language, t } = useLanguage();

  return (
    <article className="group">
      <Link href={`/homestays/${homestay.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)]">
          <Image
            src={homestay.image}
            alt={`${homestay.name} in ${homestay.location}`}
            fill
            loading="eager"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            {homestay.tags.slice(0, 1).map((tag) => (
              <Badge key={tag} className="bg-white/92 text-[#18201d] backdrop-blur">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/92 text-[#18201d]">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <div className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-semibold">{t(homestay.name)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(homestay.location)}</p>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Star className="size-4 fill-current text-accent" />
              {homestay.rating}
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-xs text-muted-foreground">
              {homestay.tags.map((tag) => t(tag)).join(" · ")}
            </span>
            <p className="text-right">
              <span className="text-xs text-muted-foreground mr-1 block sm:inline">
                {language === "vi" ? "từ" : "from"}
              </span>
              <span className="font-semibold">{formatCurrency(homestay.priceFrom)}</span>
              <span className="text-sm text-muted-foreground"> / 3h</span>
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
