import { ThemeCustomizer } from "@/components/admin/theme-customizer";
import { PageHeader } from "@/components/layout/page-header";
import { appRepository } from "@/server/repositories/app-repository";

export const dynamic = "force-dynamic";

export default async function AdminThemePage() {
  return (
    <div>
      <PageHeader title="Theme" description="Colors and appearance" />
      <ThemeCustomizer initialTheme={await appRepository.getTheme()} />
    </div>
  );
}
