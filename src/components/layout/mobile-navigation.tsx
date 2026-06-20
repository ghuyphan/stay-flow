"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { SiteBuilderLink } from "@/lib/site-builder";
import { textForLanguage } from "@/lib/site-builder";

export function MobileNavigation({ links }: { links: SiteBuilderLink[] }) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((value) => !value)}
        className="grid size-12 place-items-center rounded-[var(--radius-md)] bg-muted text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open ? (
        <nav className="absolute inset-x-0 top-full border-b border-border bg-background/96 px-4 py-4 shadow-sm backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <Link key={`${link.href}-${textForLanguage(link.label, language)}`} onClick={() => setOpen(false)} href={link.href} className="rounded-lg px-3 py-3 font-medium hover:bg-muted">
                {textForLanguage(link.label, language)}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
