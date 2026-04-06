import { NextResponse } from "next/server";
import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { listAuditLogsData } from "@/lib/data-access";

function getAdminOrManagerUser(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return { error: NextResponse.json({ message: "unauthorized" }, { status: 401 }) };
  }

  if (!["admin", "manager"].includes(user.role)) {
    return { error: NextResponse.json({ message: "forbidden" }, { status: 403 }) };
  }

  return { user };
}

// GET /api/admin/audit-logs
export async function GET(request) {
  const auth = getAdminOrManagerUser(request);
  if (auth.error) {
    return auth.error;
  }

  const logs = await listAuditLogsData(100);
  return NextResponse.json({ logs });
}
