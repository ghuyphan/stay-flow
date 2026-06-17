"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { AIChatWidget } from "@/components/public-site/ai-chat-widget";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLanguage } from "@/components/language-provider";

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/88 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight md:text-xl">
            <span className="hidden size-9 place-items-center rounded-[var(--radius-md)] bg-primary/20 text-primary md:grid">
              <Sparkles className="size-5" />
            </span>
            <span>StayFlow</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main navigation">
            <Link href="/homestays" className="hover:text-primary">
              {t("nav.stays")}
            </Link>
            <Link href="/admin" className="hover:text-primary">
              {t("nav.for_hosts")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {/* Language Switcher Toggler */}
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "vi" : "en")}
              className="hidden size-10 place-items-center rounded-full border border-border bg-card text-base transition-all hover:bg-muted active:scale-95 md:grid"
              title={language === "en" ? "Chuyển sang tiếng Việt" : "Switch to English"}
            >
              {language === "en" ? "🇻🇳" : "🇬🇧"}
            </button>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <MobileNavigation />
          </div>
        </Container>
      </header>
      <main>{children}</main>
      <footer className="py-7">
        <Container className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright")}</p>
          <div className="flex gap-5">
            <Link href="/homestays">{t("nav.stays")}</Link>
            <Link href="/admin">{t("nav.for_hosts")}</Link>
          </div>
        </Container>
      </footer>
      <AIChatWidget />
    </div>
  );
}
