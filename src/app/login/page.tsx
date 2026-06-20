import { BedDouble } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { verifyAdminSession } from "@/lib/session";

export default async function LoginPage() {
  const token = (await cookies()).get("stayflow_admin")?.value;
  const admin = await verifyAdminSession(
    token,
    process.env.SESSION_SECRET ?? "stayflow-local-session",
  );

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><BedDouble className="size-4" /></span>StayFlow</Link>
        <h1 className="mt-10 font-display text-4xl font-semibold">Đăng nhập chủ nhà</h1>
        <p className="mt-2 text-sm text-muted-foreground">Mật khẩu demo local: <code>stayflow-demo</code></p>
        <LoginForm />
      </div>
    </main>
  );
}
