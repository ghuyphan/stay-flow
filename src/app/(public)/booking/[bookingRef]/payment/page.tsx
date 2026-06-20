import { notFound, redirect } from "next/navigation";
import { BuilderRenderer } from "@/components/builder/builder-renderer";
import { appRepository } from "@/server/repositories/app-repository";

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingRef: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const booking = await appRepository.getBooking((await params).bookingRef);
  if (!booking) notFound();
  const { token } = await searchParams;
  if (!token || token !== booking.accessToken) notFound();
  if (booking.paymentStatus === "paid") redirect(`/booking/${booking.bookingRef}/status?token=${token}`);
  const siteConfig = await appRepository.getLiveSiteBuilder();

  return <BuilderRenderer config={siteConfig} page={siteConfig.pages.bookingPayment} context={{ routeId: "bookingPayment", booking, accessToken: token }} />;
}
