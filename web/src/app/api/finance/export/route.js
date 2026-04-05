import { cookies } from "next/headers";
import { invoices, payments, users } from "@/lib/data-store";

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

// GET /api/finance/export?month=2026-03  — returns CSV
export async function GET(request) {
  const session = getSessionUser();
  if (!session || !["finance", "admin"].includes(session.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  const filtered = month
    ? invoices.filter((item) => item.month === month)
    : invoices;

  const rows = filtered.map((inv) => {
    const student = users.find((u) => u.id === inv.studentId);
    const pay = payments.find((p) => p.invoiceId === inv.id);
    return [
      inv.id,
      inv.month,
      inv.studentId,
      student?.name ?? "-",
      inv.roomId,
      inv.rent,
      inv.water,
      inv.electricity,
      inv.total,
      inv.status,
      pay?.status ?? "-",
      pay?.submittedAt ? pay.submittedAt.slice(0, 10) : "-",
    ].join(",");
  });

  const header = "invoiceId,month,studentId,studentName,roomId,rent,water,electricity,total,invoiceStatus,paymentStatus,submittedAt";
  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payment-report-${month ?? "all"}.csv"`,
    },
  });
}
