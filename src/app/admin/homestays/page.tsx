import { MapPin, Plus, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appRepository } from "@/server/repositories/app-repository";

export const dynamic = "force-dynamic";

export default async function AdminHomestaysPage() {
  const homestays = await appRepository.listHomestays();
  return (
    <div>
      <PageHeader title="Cơ sở lưu trú" description={`${homestays.length} cơ sở`} action={<Button asChild><Link href="/admin/homestays/new"><Plus className="size-4" /> Thêm cơ sở</Link></Button>} />
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {homestays.map((homestay) => (
          <Card key={homestay.id} className="grid overflow-hidden sm:grid-cols-[180px_1fr]">
            <div className="relative min-h-48 sm:min-h-full"><Image src={homestay.image} alt={homestay.name} fill className="object-cover" sizes="180px" /></div>
            <div className="p-5">
              <div className="flex justify-between gap-4"><div><Badge tone="success">Đang hiển thị</Badge><h2 className="mt-3 font-display text-2xl font-semibold">{homestay.name}</h2></div><span className="flex h-fit items-center gap-1 text-sm font-semibold"><Star className="size-4 fill-current text-accent" />{homestay.rating}</span></div>
              <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />{homestay.location}</p>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-muted/45 p-3"><p className="text-sm text-muted-foreground">{homestay.rooms.length} loại phòng</p><Button asChild variant="outline" size="sm"><Link href={`/admin/homestays/${homestay.id}`}>Quản lý</Link></Button></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
