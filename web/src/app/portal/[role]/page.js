import { redirect } from "next/navigation";

import { PortalClient } from "@/components/app/portal-client";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data-access";
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

  let dashboardData;
  try {
    dashboardData = await getDashboardData(role, user);
  } catch {
    dashboardData = getDashboardByRole(role, user);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8">
      <PortalClient user={user} dashboardData={dashboardData} />
    </div>
  );
}
