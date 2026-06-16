import { LayoutBuilder } from "@/components/builder/layout-builder";
import { PageHeader } from "@/components/layout/page-header";
import { appRepository } from "@/server/repositories/app-repository";

export const dynamic = "force-dynamic";

export default async function LayoutBuilderPage() {
  return (
    <div>
      <PageHeader
        title="Layout builder"
        description="Arrange trusted sections, preview breakpoints, and publish without unsafe custom code."
      />
      <div className="mt-6"><LayoutBuilder initialSections={await appRepository.getLayout()} /></div>
    </div>
  );
}
