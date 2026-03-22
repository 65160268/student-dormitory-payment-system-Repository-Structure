import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";

export async function GET(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
