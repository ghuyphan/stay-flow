import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[var(--radius-md)] border border-input bg-card p-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/10 hover:border-ring/45",
        className,
      )}
      {...props}
    />
  );
}
