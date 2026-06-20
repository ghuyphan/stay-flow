"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonSkeleton } from "@/components/ui/skeleton";

export function CancelBookingButton({ bookingRef, accessToken }: { bookingRef: string; accessToken: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (!window.confirm("Cancel this booking?")) return;
    setLoading(true);
    await fetch(`/api/bookings/${bookingRef}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "cancel", accessToken }),
    });
    setLoading(false);
    router.refresh();
  }

  if (loading) return <ButtonSkeleton className="w-36" />;

  return (
    <Button variant="outline" onClick={cancel}>
      Cancel booking
    </Button>
  );
}
