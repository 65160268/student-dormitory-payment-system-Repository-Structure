import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { getDashboardByRole } from "@/lib/data-store";

export async function GET(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const role = request.nextUrl.searchParams.get("role") ?? user.role;
  if (role !== user.role) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const data = getDashboardByRole(role, user);
  return NextResponse.json({ role, data });
}
