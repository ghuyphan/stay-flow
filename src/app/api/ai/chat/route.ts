import { NextResponse } from "next/server";
import { z } from "zod";
import { appRepository } from "@/server/repositories/app-repository";

const schema = z.object({
  message: z.string().trim().min(1).max(500),
  language: z.enum(["en", "vi"]).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ reply: "Please send a shorter question." }, { status: 400 });
  }

  const message = parsed.data.message;
  const language = parsed.data.language ?? "en";
  const reference = message.match(/SF-\d{6}-[A-Z0-9]{4,8}/i)?.[0];
  if (reference) {
    const booking = await appRepository.getBooking(reference);
    const email = message.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0]?.replace(/[?.!,]$/, "");
    return NextResponse.json({
      reply: booking && email?.toLowerCase() === booking.customerEmail.toLowerCase()
        ? language === "vi"
          ? `${booking.bookingRef} hiện đang ${booking.status.replaceAll("_", " ")}. Thanh toán: ${booking.paymentStatus}.`
          : `${booking.bookingRef} is ${booking.status.replaceAll("_", " ")}. Payment is ${booking.paymentStatus}.`
        : booking
          ? language === "vi"
            ? "Để bảo mật, hãy gửi kèm email đặt phòng với mã booking."
            : "For privacy, include the booking email with the reference."
          : language === "vi"
            ? `Mình chưa tìm thấy ${reference}. Kiểm tra lại mã rồi thử lần nữa nha.`
            : `I couldn't find ${reference}. Check the reference and try again.`,
    });
  }

  const lower = message.toLowerCase();
  if (lower.includes("available") || lower.includes("availability") || lower.includes("trống") || lower.includes("còn phòng")) {
    return NextResponse.json({
      reply: language === "vi"
        ? "Chọn theo giờ, qua đêm hoặc theo ngày trong trang phòng. StayFlow sẽ kiểm tra đúng khung giờ trên server trước khi tạo booking."
        : "Choose hourly, overnight, or daily on a room page. StayFlow checks the exact time window on the server before creating the booking.",
    });
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("giá") || lower.includes("bao nhiêu")) {
    const prices = (await appRepository.listHomestays())
      .map((stay) => language === "vi" ? `${stay.name} từ ${stay.priceFrom.toLocaleString("vi-VN")}đ` : `${stay.name} from ${stay.priceFrom.toLocaleString("vi-VN")}đ`)
      .join("; ");
    return NextResponse.json({
      reply: language === "vi"
        ? `${prices}. Giá cuối cùng được tính sau khi bạn chọn khung giờ.`
        : `${prices}. Final pricing is calculated after you choose a time window.`,
    });
  }
  if (lower.includes("cancel") || lower.includes("hủy")) {
    return NextResponse.json({
      reply: language === "vi"
        ? "Mở trang trạng thái booking rồi chọn Hủy đặt phòng. Chính sách hủy sẽ hiện trước khi xác nhận."
        : "Open your booking status page and choose Cancel booking. The cancellation policy is shown before confirmation.",
    });
  }

  const knowledge = await appRepository.getKnowledge(language);
  return NextResponse.json({
    reply: knowledge.map((item) => item.content).join(" "),
  });
}
