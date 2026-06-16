import { Compass } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { AIChatWidget } from "@/components/public-site/ai-chat-widget";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-background/90 shadow-[0_1px_0_rgb(24_32_29_/_0.05)] backdrop-blur-xl">
        <Container className="flex h-18 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Compass className="size-5" />
            </span>
            <span className="text-lg tracking-tight">StayFlow</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main navigation">
            <Link href="/homestays" className="hover:text-primary">
              Stays
            </Link>
            <Link href="/admin" className="hover:text-primary">
              For hosts
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNavigation />
          </div>
        </Container>
      </header>
      <main>{children}</main>
      <footer className="py-7">
        <Container className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 StayFlow</p>
          <div className="flex gap-5"><Link href="/homestays">Stays</Link><Link href="/admin">For hosts</Link></div>
        </Container>
      </footer>
      <AIChatWidget />
    </div>
  );
}
