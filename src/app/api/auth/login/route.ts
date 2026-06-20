import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession } from "@/lib/session";

const schema = z.object({ password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Vui lòng nhập mật khẩu." }, { status: 400 });

  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Chưa cấu hình đăng nhập quản trị." }, { status: 503 });
  }
  const password = configuredPassword ?? "stayflow-demo";
  if (parsed.data.password !== password) {
    return NextResponse.json({ error: "Mật khẩu không đúng." }, { status: 401 });
  }

  const secret = process.env.SESSION_SECRET ?? "stayflow-local-session";
  const response = NextResponse.json({ ok: true });
  response.cookies.set("stayflow_admin", await createAdminSession(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return response;
}
