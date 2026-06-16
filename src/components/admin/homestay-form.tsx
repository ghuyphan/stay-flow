"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      setError(result.error ?? "Unable to save homestay.");
      return;
    }
    router.push(`/admin/homestays/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 grid max-w-3xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">Name<Input name="name" defaultValue={homestay?.name} required className="mt-2" /></label>
        <label className="text-sm font-semibold">URL slug<Input name="slug" defaultValue={homestay?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="mt-2" /></label>
      </div>
      <label className="text-sm font-semibold">Location<Input name="location" defaultValue={homestay?.location} required className="mt-2" /></label>
      <label className="text-sm font-semibold">Description<textarea name="description" defaultValue={homestay?.description} required minLength={10} rows={4} className="mt-2 w-full rounded-[var(--radius-md)] border bg-background p-3 text-sm outline-none focus:border-ring" /></label>
      <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
        <label className="text-sm font-semibold">Price from<Input name="priceFrom" type="number" min="1" defaultValue={homestay?.priceFrom ?? 80} required className="mt-2" /></label>
        <label className="text-sm font-semibold">Cover image URL<Input name="image" type="url" defaultValue={homestay?.image} required className="mt-2" /></label>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <div><Button type="submit" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : null}{homestay ? "Save changes" : "Create homestay"}</Button></div>
    </form>
  );
}
