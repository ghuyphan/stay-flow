"use client";

import {
  BedDouble,
  BookOpenCheck,
  Bot,
  Building2,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Menu,
  Palette,
  PanelTop,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoutButton } from "@/components/admin/logout-button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/homestays", label: "Homestays", icon: Building2 },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpenCheck },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/layout-builder", label: "Layout builder", icon: PanelTop },
  { href: "/admin/theme", label: "Theme", icon: Palette },
  { href: "/admin/ai-knowledge", label: "AI knowledge", icon: Bot },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:grid lg:h-screen lg:grid-cols-[248px_1fr] lg:overflow-hidden">
      {mobileOpen ? <button aria-label="Close sidebar" className="fixed inset-0 z-30 bg-black/35 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden w-[248px] bg-card shadow-[1px_0_0_rgb(24_32_29_/_0.06)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col", mobileOpen && "flex flex-col")}>
        <div className="flex h-18 items-center px-5">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <BedDouble className="size-5" />
            </span>
            StayFlow
          </Link>
          <button aria-label="Close sidebar" onClick={() => setMobileOpen(false)} className="ml-auto grid size-9 place-items-center lg:hidden"><X className="size-5" /></button>
        </div>
        <div className="p-3">
          <button className="flex w-full items-center gap-3 rounded-xl bg-background p-3 text-left shadow-[var(--shadow-sm)]">
            <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary"><Building2 className="size-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">District One Studio</span>
              <span className="block text-xs text-muted-foreground">Saigon</span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-secondary text-secondary-foreground",
                )}
              >
                <Icon className="size-4.5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-accent/20 text-sm font-bold text-foreground">HP</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">Huy Phan</span><span className="block text-xs text-muted-foreground">Owner</span></span>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <div className="min-w-0 lg:h-screen lg:overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-background/90 px-4 shadow-[0_1px_0_rgb(24_32_29_/_0.06)] backdrop-blur lg:px-7">
          <button aria-label="Open sidebar" onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-xl bg-card shadow-[var(--shadow-sm)] lg:hidden"><Menu className="size-5" /></button>
          <p className="hidden text-sm text-muted-foreground lg:block">Monday, June 15</p>
          <div className="ml-auto flex items-center gap-2"><ThemeToggle /></div>
        </header>
        <main className="max-w-[1320px] px-4 py-6 md:px-6 lg:px-7 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
