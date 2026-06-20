"use client";

import {
  BedDouble,
  BrainCircuit,
  CalendarCheck,
  House,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Paintbrush,
  Settings,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoutButton } from "@/components/admin/logout-button";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", labelKey: "admin.nav.overview", icon: LayoutDashboard },
  { href: "/admin/homestays", labelKey: "admin.nav.homestays", icon: House },
  { href: "/admin/bookings", labelKey: "admin.nav.bookings", icon: CalendarCheck },
  { href: "/admin/payments", labelKey: "admin.nav.payments", icon: WalletCards },
  { href: "/admin/layout-builder", labelKey: "admin.nav.site_builder", icon: Paintbrush },
  { href: "/admin/ai-knowledge", labelKey: "admin.nav.ai_knowledge", icon: BrainCircuit },
  { href: "/admin/settings", labelKey: "admin.nav.settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem("stayflow_admin_sidebar") === "collapsed",
  );

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("stayflow_admin_sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  return (
    <div
      className={cn("min-h-screen bg-background lg:grid lg:h-screen lg:overflow-hidden", collapsed ? "lg:grid-cols-[64px_1fr]" : "lg:grid-cols-[248px_1fr]")}
      style={{ "--admin-sidebar-width": collapsed ? "64px" : "248px" } as CSSProperties}
    >
      {mobileOpen ? <button aria-label={t("admin.sidebar.close")} className="fixed inset-0 z-30 bg-black/35 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-border/80 bg-card transition-[width] duration-200 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col",
        collapsed && "lg:w-[64px]",
        mobileOpen && "flex flex-col",
      )}>
        <div className={cn("group/sidebar-brand relative flex h-18 items-center gap-2 px-5", collapsed && "lg:justify-center lg:px-3")}>
          <Link href="/admin" className={cn("flex items-center gap-2 font-semibold", collapsed && "lg:justify-center")} title="StayFlow">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-sm)]">
              <BedDouble className="size-5" />
            </span>
            <span className={cn("text-lg", collapsed && "lg:hidden")}>StayFlow</span>
          </Link>
          <button
            aria-label={collapsed ? t("admin.sidebar.expand") : t("admin.sidebar.collapse")}
            onClick={toggleCollapsed}
            className={cn(
              "pointer-events-none absolute hidden size-9 place-items-center rounded-lg bg-card/95 text-muted-foreground opacity-0 shadow-[var(--shadow-sm)] transition-all hover:bg-muted hover:text-foreground focus-visible:pointer-events-auto focus-visible:opacity-100 lg:grid",
              "group-hover/sidebar-brand:pointer-events-auto group-hover/sidebar-brand:opacity-100",
              collapsed ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : "right-4 top-1/2 -translate-y-1/2",
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
          <button aria-label={t("admin.sidebar.close")} onClick={() => setMobileOpen(false)} className="ml-auto grid size-9 place-items-center lg:hidden"><X className="size-5" /></button>
        </div>
        <div className={cn("px-3 pb-3", collapsed && "lg:px-2")}>
          <Link href="/admin/homestays" onClick={() => setMobileOpen(false)} className={cn("flex w-full items-center gap-3 rounded-xl bg-muted/45 px-3 py-2.5 text-left transition-colors hover:bg-muted", collapsed && "lg:justify-center lg:px-0 lg:py-2")} title={t("District One Studio")}>
            <span className="grid size-9 place-items-center rounded-lg bg-card text-primary shadow-[var(--shadow-sm)]"><House className="size-4.5" /></span>
            <span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
              <span className="block text-xs text-muted-foreground">{t("admin.property.label")}</span>
              <span className="block truncate text-sm font-semibold">{t("District One Studio")}</span>
            </span>
          </Link>
        </div>
        <nav className={cn("flex-1 space-y-1 px-3 py-2", collapsed && "lg:px-2")}>
          {navigation.map(({ href, labelKey, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            const label = t(labelKey);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={label}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  collapsed && "lg:min-h-10 lg:justify-center lg:px-0",
                  active && "bg-muted/70 text-foreground",
                )}
              >
                <Icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
                <span className={cn(collapsed && "lg:hidden")}>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={cn("p-4", collapsed && "lg:px-2")}>
          <div className={cn("flex items-center gap-3 rounded-xl px-1 py-1", collapsed && "lg:justify-center")}>
            <span className="grid size-9 place-items-center rounded-full bg-accent/20 text-sm font-bold text-foreground">HP</span>
            <span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}><span className="block truncate text-sm font-semibold">Huy Phan</span><span className="block text-xs text-muted-foreground">{t("admin.user.role")}</span></span>
            <span className={cn("hidden lg:block", collapsed && "lg:hidden")}><ThemeToggle /></span>
            <span className={cn(collapsed && "lg:hidden")}><LogoutButton /></span>
          </div>
        </div>
      </aside>
      <div className="min-w-0 lg:h-screen lg:overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-background/90 px-4 shadow-[0_1px_0_rgb(24_32_29_/_0.06)] backdrop-blur lg:hidden">
          <button aria-label={t("admin.sidebar.open")} onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-xl bg-card shadow-[var(--shadow-sm)] lg:hidden"><Menu className="size-5" /></button>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-[1320px] px-4 py-6 md:px-6 lg:px-7">{children}</main>
      </div>
    </div>
  );
}
