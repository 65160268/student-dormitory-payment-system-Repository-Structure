import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { listPendingPaymentsData } from "@/lib/data-access";

export async function GET(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  if (!["finance", "admin"].includes(user.role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ items: await listPendingPaymentsData() });
}
