import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Props = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
};

export function AdminStatsCard({ label, value, change, trend, icon: Icon }: Props) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="rounded-[var(--radius-lg)] bg-card p-4 shadow-[var(--shadow-sm)] ring-1 ring-black/[0.035]">
      <div className="flex items-start justify-between">
        <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-4.5" /></span>
        <span className={trend === "up" ? "flex items-center text-xs font-semibold text-success" : "flex items-center text-xs font-semibold text-warning"}>
          <TrendIcon className="size-3.5" /> {change}
        </span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
