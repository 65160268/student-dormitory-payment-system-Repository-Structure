import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listAuditLogs } from "@/lib/data-store";

function getSessionUser() {
  const store = cookies();
  const raw = store.get("dorm_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

// GET /api/admin/audit-logs
export async function GET() {
  const session = getSessionUser();
  if (!session || !["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const logs = listAuditLogs(100);
  return NextResponse.json({ logs });
}
