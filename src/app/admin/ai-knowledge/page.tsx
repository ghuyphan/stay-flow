import { PageHeader } from "@/components/layout/page-header";
import { KnowledgeManager } from "@/components/admin/knowledge-manager";
import { appRepository } from "@/server/repositories/app-repository";

export const dynamic = "force-dynamic";

export default async function AIKnowledgePage() {
  const items = await appRepository.listKnowledge();
  return (
    <div>
      <PageHeader title="Kiến thức AI" description="Các câu trả lời hỗ trợ đã duyệt cho chatbot song ngữ" />
      <KnowledgeManager initialItems={items} />
    </div>
  );
}
