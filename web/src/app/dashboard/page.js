import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardEntryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(`/portal/${user.role}`);
}
