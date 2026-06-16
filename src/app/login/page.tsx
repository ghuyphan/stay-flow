import { BedDouble } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><BedDouble className="size-4" /></span>StayFlow</Link>
        <h1 className="mt-10 font-display text-4xl font-semibold">Host sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Local demo password: <code>stayflow-demo</code></p>
        <LoginForm />
      </div>
    </main>
  );
}
