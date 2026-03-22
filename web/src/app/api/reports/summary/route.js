import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { getSummaryReport } from "@/lib/data-store";

export async function GET(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  if (!["manager", "admin"].includes(user.role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ report: getSummaryReport() });
}
