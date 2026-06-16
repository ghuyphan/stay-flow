"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PaymentActions({ bookingRef, accessToken }: { bookingRef: string; accessToken: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/bookings/${bookingRef}/pay`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accessToken }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("Payment could not be confirmed.");
      return;
    }
    router.push(`/booking/${bookingRef}/status?token=${accessToken}`);
    router.refresh();
  }

  return (
    <div>
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
      <Button onClick={pay} disabled={loading} size="lg" className="w-full">
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        Pay securely
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Demo payment confirms through the server endpoint.
      </p>
    </div>
  );
}
