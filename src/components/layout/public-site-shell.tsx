"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { AIChatWidget } from "@/components/public-site/ai-chat-widget";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLanguage } from "@/components/language-provider";
import type { SiteBuilderConfig } from "@/lib/site-builder";
import { textForLanguage } from "@/lib/site-builder";
import type { BuilderV2Config } from "@/lib/site-builder-v2";

export function PublicSiteShell({
  children,
  siteConfig,
  showChat = true,
  stickyHeader = true,
}: {
  children: React.ReactNode;
  siteConfig: SiteBuilderConfig | BuilderV2Config;
  showChat?: boolean;
  stickyHeader?: boolean;
}) {
  const { language, setLanguage } = useLanguage();
  const header = "site" in siteConfig ? siteConfig.site.header : siteConfig.header;
  const footer = "site" in siteConfig ? siteConfig.site.footer : siteConfig.footer;

  return (
    <div className="min-h-screen">
      <header
        className={[
          stickyHeader ? "sticky top-0 z-20" : "relative z-0",
          "site-header-surface border-b border-border/70 bg-background/88 backdrop-blur-md",
        ].join(" ")}
      >
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-xl">
            <span className="hidden size-9 place-items-center rounded-[var(--radius-md)] bg-primary/20 text-primary md:grid">
              <Sparkles className="size-5" />
            </span>
            <span>{header.siteName}</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex" aria-label="Main navigation">
            {header.links.map((link) => (
              <Link key={`${link.href}-${textForLanguage(link.label, language)}`} href={link.href} className="hover:text-primary">
                {textForLanguage(link.label, language)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {header.primaryCta.href ? (
              <Link href={header.primaryCta.href} className="hidden rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background md:inline-flex">
                {textForLanguage(header.primaryCta.label, language)}
              </Link>
            ) : null}
            {header.showLanguageToggle ? (
              <button
                type="button"
                onClick={() => setLanguage(language === "en" ? "vi" : "en")}
                className="hidden size-10 place-items-center rounded-full border border-border bg-card text-xs font-semibold transition-all hover:bg-muted active:scale-95 md:grid"
                title={language === "en" ? "Chuyển sang tiếng Việt" : "Switch to English"}
              >
                {language === "en" ? "VI" : "EN"}
              </button>
            ) : null}
            {header.showThemeToggle ? <div className="hidden md:block">
              <ThemeToggle />
            </div> : null}
            <MobileNavigation links={[...header.links, header.primaryCta]} />
          </div>
        </Container>
      </header>
      <main>{children}</main>
      <footer className="py-7">
        <Container className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">{header.siteName}</p>
            <p>{textForLanguage(footer.tagline, language)}</p>
          </div>
          <div className="flex gap-5">
            {footer.links.map((link) => (
              <Link key={`${link.href}-${textForLanguage(link.label, language)}`} href={link.href}>{textForLanguage(link.label, language)}</Link>
            ))}
          </div>
        </Container>
      </footer>
      {showChat ? <AIChatWidget /> : null}
    </div>
  );
}
