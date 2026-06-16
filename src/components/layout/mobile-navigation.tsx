"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-sm)]"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open ? (
        <nav className="absolute inset-x-0 top-full bg-background px-4 py-4 shadow-sm">
          <div className="mx-auto grid max-w-7xl gap-1">
            <Link onClick={() => setOpen(false)} href="/homestays" className="rounded-lg px-3 py-3 font-medium hover:bg-muted">Stays</Link>
            <Link onClick={() => setOpen(false)} href="/admin" className="rounded-lg px-3 py-3 font-medium hover:bg-muted">Host dashboard</Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
