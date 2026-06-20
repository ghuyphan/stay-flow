import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { verifyAdminSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("stayflow_admin")?.value;
  const admin = await verifyAdminSession(
    token,
    process.env.SESSION_SECRET ?? "stayflow-local-session",
  );

  if (!admin) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
