import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export function HomestayDetailSkeleton() {
  return (
    <Container className="py-4 lg:py-8">
      <div className="overflow-hidden rounded-[calc(var(--radius-lg)+0.75rem)] border border-border bg-card shadow-[var(--shadow-sm)]">
        <Skeleton className="h-[430px] rounded-none md:h-[520px]" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-5/6 max-w-xl" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        </div>
        <Skeleton className="h-[460px] rounded-[calc(var(--radius-lg)+0.5rem)]" />
      </div>
    </Container>
  );
}
