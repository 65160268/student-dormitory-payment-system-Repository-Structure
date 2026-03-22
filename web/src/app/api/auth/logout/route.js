import { NextResponse } from "next/server";

import { endSession, getSessionCookieName } from "@/lib/auth";

export async function POST(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  endSession(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
