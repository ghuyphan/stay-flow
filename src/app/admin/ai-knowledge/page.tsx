import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { appRepository } from "@/server/repositories/app-repository";

export const dynamic = "force-dynamic";

export default async function AIKnowledgePage() {
  const items = await appRepository.getKnowledge();
  return (
    <div>
      <PageHeader title="AI knowledge" description="Approved support answers" />
      <Card className="mt-5 overflow-hidden">
        {items.map((item) => <article key={item.id} className="p-4"><h2 className="font-semibold">{item.title}</h2><p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">{item.content}</p></article>)}
      </Card>
    </div>
  );
}
