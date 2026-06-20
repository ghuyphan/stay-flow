import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-8">
      <div className="grid gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-[calc(var(--radius-lg)+0.75rem)]" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    </Container>
  );
}
