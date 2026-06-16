import { NextResponse } from "next/server";
import { z } from "zod";
import { appRepository } from "@/server/repositories/app-repository";

const schema = z.object({ message: z.string().trim().min(1).max(500) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ reply: "Please send a shorter question." }, { status: 400 });
  }

  const message = parsed.data.message;
  const reference = message.match(/SF-\d{6}-[A-Z0-9]{4,8}/i)?.[0];
  if (reference) {
    const booking = await appRepository.getBooking(reference);
    const email = message.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0]?.replace(/[?.!,]$/, "");
    return NextResponse.json({
      reply: booking && email?.toLowerCase() === booking.customerEmail.toLowerCase()
        ? `${booking.bookingRef} is ${booking.status.replaceAll("_", " ")}. Payment is ${booking.paymentStatus}.`
        : booking
          ? "For privacy, include the booking email with the reference."
          : `I couldn't find ${reference}. Check the reference and try again.`,
    });
  }

  const lower = message.toLowerCase();
  if (lower.includes("available") || lower.includes("availability")) {
    return NextResponse.json({
      reply: "Choose hourly, overnight, or daily on a room page. StayFlow checks the exact time window on the server before creating the booking.",
    });
  }
  if (lower.includes("price") || lower.includes("cost")) {
    const prices = (await appRepository.listHomestays())
      .map((stay) => `${stay.name} from $${stay.priceFrom}/hour`)
      .join("; ");
    return NextResponse.json({ reply: `${prices}. Final pricing is calculated after you choose a time window.` });
  }
  if (lower.includes("cancel")) {
    return NextResponse.json({
      reply: "Open your booking status page and choose Cancel booking. The cancellation policy is shown before confirmation.",
    });
  }

  const knowledge = await appRepository.getKnowledge();
  return NextResponse.json({
    reply: knowledge.map((item) => item.content).join(" "),
  });
}
