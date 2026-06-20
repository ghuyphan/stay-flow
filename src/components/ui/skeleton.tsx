import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-[var(--radius-md)] bg-muted", className)}
      {...props}
    />
  );
}

export function ButtonSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("min-h-11 w-full", className)} {...props} />;
}
