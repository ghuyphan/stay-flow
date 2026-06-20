"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/language-provider";

export function BookingStatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const tone = status === "pending_payment" ? "warning" : status === "cancelled" ? "neutral" : "success";
  return <Badge tone={tone}>{t(`status.${status}`)}</Badge>;
}
