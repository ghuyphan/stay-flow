import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Stack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-6", className)} {...props} />;
}
