"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useLanguage();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return <button onClick={logout} aria-label={t("admin.sign_out")} className="grid size-9 place-items-center rounded-lg hover:bg-muted"><LogOut className="size-4" /></button>;
}
