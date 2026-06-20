"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonSkeleton } from "@/components/ui/skeleton";

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
      {loading ? (
        <ButtonSkeleton className="min-h-12" />
      ) : (
        <Button onClick={pay} size="lg" className="w-full">
          Pay securely
        </Button>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Demo payment confirms through the server endpoint.
      </p>
    </div>
  );
}
