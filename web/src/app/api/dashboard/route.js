import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { getDashboardData } from "@/lib/data-access";
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

  let data;
  try {
    data = await getDashboardData(role, user);
  } catch {
    data = getDashboardByRole(role, user);
  }

  return NextResponse.json({ role, data });
}
