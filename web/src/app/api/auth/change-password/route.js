import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { changeUserPassword } from "@/lib/data-store";

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

// POST /api/auth/change-password
export async function POST(request) {
  const session = getSessionUser();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "currentPassword and newPassword are required" }, { status: 400 });
  }
  if (String(newPassword).length < 6) {
    return NextResponse.json({ message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
  }

  try {
    const result = changeUserPassword(session.id, currentPassword, newPassword);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
