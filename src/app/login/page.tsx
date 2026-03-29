import { redirect } from "next/navigation";
import { LoginForm } from "@/components/dashboard/login-form";
import { PublicShell } from "@/components/public/public-shell";
import { getAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <PublicShell>
      <section className="auth-section">
        <LoginForm />
      </section>
    </PublicShell>
  );
}
