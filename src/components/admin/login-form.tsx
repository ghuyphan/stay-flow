"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ButtonSkeleton } from "@/components/ui/skeleton";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = (await response.json()) as { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Không thể đăng nhập.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <label className="text-sm font-semibold">Mật khẩu<Input name="password" type="password" required autoFocus className="mt-2" /></label>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {loading ? <ButtonSkeleton className="min-h-12" /> : <Button type="submit" size="lg">Đăng nhập</Button>}
    </form>
  );
}
