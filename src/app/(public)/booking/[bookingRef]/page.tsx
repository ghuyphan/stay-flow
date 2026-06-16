import { redirect } from "next/navigation";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingRef: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token;
  redirect(`/booking/${(await params).bookingRef}/status${token ? `?token=${token}` : ""}`);
}
