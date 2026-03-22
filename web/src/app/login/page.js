import { redirect } from "next/navigation";

import { LoginForm } from "@/components/app/login-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(`/portal/${user.role}`);
  }

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center px-4 py-10">
      <LoginForm />
    </div>
  );
}
