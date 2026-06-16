import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  confirmed: "Confirmed",
  pending_payment: "Pending payment",
  checked_in: "Checked in",
  paid: "Paid",
  cancelled: "Cancelled",
};

export function BookingStatusBadge({ status }: { status: string }) {
  const tone = status === "pending_payment" ? "warning" : status === "cancelled" ? "neutral" : "success";
  return <Badge tone={tone}>{labels[status] ?? status}</Badge>;
}
