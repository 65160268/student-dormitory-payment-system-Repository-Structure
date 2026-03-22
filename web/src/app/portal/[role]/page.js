import Link from "next/link";
import { redirect } from "next/navigation";

import { PortalClient } from "@/components/app/portal-client";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardByRole } from "@/lib/data-store";
import { isRolePathAllowed, isValidRole } from "@/lib/role-config";

export const dynamic = "force-dynamic";

export default async function RolePortalPage({ params }) {
  const { role } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isValidRole(role) || !isRolePathAllowed(user.role, role)) {
    redirect(`/portal/${user.role}`);
  }

  const dashboardData = getDashboardByRole(role, user);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-8">
      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/85 p-4">
        <div>
          <h1 className="font-heading text-xl font-semibold">DormPayment Control Panel</h1>
          <p className="text-sm text-muted-foreground">
            Role-based portal connected to API endpoints.
          </p>
        </div>
        <Link href="/" className="text-sm text-primary underline-offset-4 hover:underline">
          Back to Landing
        </Link>
      </div>

      <PortalClient user={user} dashboardData={dashboardData} />
    </div>
  );
}
