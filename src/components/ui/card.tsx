import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] bg-card text-card-foreground shadow-[var(--shadow-sm)] ring-1 ring-black/[0.035]",
        className,
      )}
      {...props}
    />
  );
}
