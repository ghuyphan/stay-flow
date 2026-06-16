import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.SESSION_SECRET ?? "stayflow-local-session";
  const authenticated = await verifyAdminSession(
    request.cookies.get("stayflow_admin")?.value,
    secret,
  );

  const protectedAdmin = pathname.startsWith("/admin");
  const protectedWrite =
    request.method !== "GET" &&
    (pathname.startsWith("/api/homestays") || pathname.startsWith("/api/settings"));
  const protectedBookingRead =
    request.method === "GET" && pathname.startsWith("/api/bookings");

  if (protectedAdmin && !authenticated) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  if (protectedWrite && !authenticated) {
    return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  }
  if (protectedBookingRead && !authenticated) {
    return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/homestays/:path*",
    "/api/settings/:path*",
    "/api/bookings/:path*",
  ],
};
