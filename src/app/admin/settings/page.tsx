import { CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Environment and platform status" />
      <Card className="mt-5 grid gap-2 p-2">
        <div className="flex items-center gap-4 p-4"><Database className="size-5 text-primary" /><div className="flex-1"><p className="font-semibold">Data adapter</p><p className="text-sm text-muted-foreground">Local persistent store for demo; Prisma PostgreSQL schema included for deployment.</p></div><CheckCircle2 className="size-5 text-success" /></div>
        <div className="flex items-center gap-4 p-4"><ShieldCheck className="size-5 text-primary" /><div className="flex-1"><p className="font-semibold">Server validation</p><p className="text-sm text-muted-foreground">Availability, price, booking state, and payment state are server-controlled.</p></div><CheckCircle2 className="size-5 text-success" /></div>
      </Card>
    </div>
  );
}
