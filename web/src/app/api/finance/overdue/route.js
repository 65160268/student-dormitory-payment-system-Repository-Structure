import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { markOverdueInvoices, listOverdueInvoices, addAuditLog } from "@/lib/data-store";

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

// GET /api/finance/overdue — list pending/overdue invoices
export async function GET() {
  const session = getSessionUser();
  if (!session || !["finance", "admin", "manager"].includes(session.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ invoices: listOverdueInvoices() });
}

// POST /api/finance/overdue — mark pending invoices as overdue
export async function POST() {
  const session = getSessionUser();
  if (!session || !["finance", "admin"].includes(session.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const result = markOverdueInvoices();
  addAuditLog(session.id, "mark_overdue", "invoice", "batch",
    `ทำเครื่องหมาย overdue ${result.marked} รายการ`);
  return NextResponse.json(result);
}
