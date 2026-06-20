"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonSkeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Homestay } from "@/lib/types";

export function HomestayForm({ homestay }: { homestay?: Homestay }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(
      homestay ? `/api/homestays/${homestay.id}` : "/api/homestays",
      {
        method: homestay ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          slug: form.get("slug"),
          location: form.get("location"),
          description: form.get("description"),
          priceFrom: Number(form.get("priceFrom")),
          image: form.get("image"),
        }),
      },
    );
    const result = (await response.json()) as Homestay & { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Không thể lưu cơ sở.");
      return;
    }
    router.push(`/admin/homestays/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 grid max-w-4xl gap-4">
      <Card className="p-5">
        <div className="mb-5">
          <h2 className="font-semibold">Thông tin cơ sở</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tên, đường dẫn, địa điểm và mô tả ngắn hiển thị cho khách.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Tên<Input name="name" defaultValue={homestay?.name} required className="mt-2" /></label>
          <label className="text-sm font-semibold">Đường dẫn URL<Input name="slug" defaultValue={homestay?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="mt-2" /></label>
          <label className="text-sm font-semibold sm:col-span-2">Địa điểm<Input name="location" defaultValue={homestay?.location} required className="mt-2" /></label>
          <label className="text-sm font-semibold sm:col-span-2">Mô tả<Textarea name="description" defaultValue={homestay?.description} required minLength={10} rows={4} className="mt-2" /></label>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-5">
          <h2 className="font-semibold">Hình ảnh và giá khởi điểm</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ảnh này dùng cho thẻ danh sách và trang chi tiết.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <label className="text-sm font-semibold">Giá từ<Input name="priceFrom" type="number" min="1" defaultValue={homestay?.priceFrom ?? 1250000} required className="mt-2" /></label>
          <label className="text-sm font-semibold">URL ảnh bìa<Input name="image" type="url" defaultValue={homestay?.image} required className="mt-2" /></label>
        </div>
      </Card>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <div className="sticky bottom-4 z-10 flex rounded-[var(--radius-lg)] bg-background/90 py-2 backdrop-blur">
        {loading ? (
          <ButtonSkeleton className="w-40" />
        ) : (
          <Button type="submit">{homestay ? "Lưu thay đổi" : "Tạo cơ sở"}</Button>
        )}
      </div>
    </form>
  );
}
