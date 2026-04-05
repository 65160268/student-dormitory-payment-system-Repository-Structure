import { NextResponse } from "next/server";
import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { getRoomRates, updateRoomRates, addAuditLog } from "@/lib/data-store";

function getAdminUser(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return { error: NextResponse.json({ message: "unauthorized" }, { status: 401 }) };
  }

  if (user.role !== "admin") {
    return { error: NextResponse.json({ message: "forbidden" }, { status: 403 }) };
  }

  return { user };
}

// GET /api/admin/rates
export async function GET(request) {
  const auth = getAdminUser(request);
  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json({ rates: getRoomRates() });
}

// POST /api/admin/rates
export async function POST(request) {
  const auth = getAdminUser(request);
  if (auth.error) {
    return auth.error;
  }

  const { waterPerUnit, electricPerUnit } = await request.json();
  if (waterPerUnit == null || electricPerUnit == null) {
    return NextResponse.json({ message: "waterPerUnit and electricPerUnit are required" }, { status: 400 });
  }
  if (Number(waterPerUnit) <= 0 || Number(electricPerUnit) <= 0) {
    return NextResponse.json({ message: "rates must be positive" }, { status: 400 });
  }

  const rates = updateRoomRates(waterPerUnit, electricPerUnit);
  addAuditLog(auth.user.id, "update_rates", "rate", "1",
    `อัปเดตอัตราค่าน้ำ=${waterPerUnit}, ค่าไฟ=${electricPerUnit}`);

  return NextResponse.json({ rates });
}
