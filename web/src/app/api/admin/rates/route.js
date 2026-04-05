import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRoomRates, updateRoomRates, addAuditLog } from "@/lib/data-store";

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

// GET /api/admin/rates
export async function GET() {
  const session = getSessionUser();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ rates: getRoomRates() });
}

// POST /api/admin/rates
export async function POST(request) {
  const session = getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { waterPerUnit, electricPerUnit } = await request.json();
  if (waterPerUnit == null || electricPerUnit == null) {
    return NextResponse.json({ message: "waterPerUnit and electricPerUnit are required" }, { status: 400 });
  }
  if (Number(waterPerUnit) <= 0 || Number(electricPerUnit) <= 0) {
    return NextResponse.json({ message: "rates must be positive" }, { status: 400 });
  }

  const rates = updateRoomRates(waterPerUnit, electricPerUnit);
  addAuditLog(session.id, "update_rates", "rate", "1",
    `อัปเดตอัตราค่าน้ำ=${waterPerUnit}, ค่าไฟ=${electricPerUnit}`);

  return NextResponse.json({ rates });
}
