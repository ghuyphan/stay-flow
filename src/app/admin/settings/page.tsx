import { CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const settings = [
    {
      icon: Database,
      title: "Nguồn dữ liệu",
      body: "Bản demo đang dùng kho lưu cục bộ; schema Prisma PostgreSQL đã có sẵn cho triển khai thật.",
    },
    {
      icon: ShieldCheck,
      title: "Kiểm tra phía server",
      body: "Tình trạng phòng, giá, trạng thái đặt phòng và thanh toán đều do server kiểm soát.",
    },
  ];

  return (
    <div>
      <PageHeader title="Cài đặt" description="Trạng thái môi trường và nền tảng" />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {settings.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="p-5">
            <div className="flex items-start gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-primary"><Icon className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{title}</p>
                  <CheckCircle2 className="size-5 text-success" />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
