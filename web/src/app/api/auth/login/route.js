import { NextResponse } from "next/server";

import { findUserByCredential } from "@/lib/user-auth";
import { getSessionCookieName, sanitizeUser, startSession } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { message: "username and password are required" },
      { status: 400 },
    );
  }

  let user;
  try {
    user = await findUserByCredential(username, password);
  } catch (error) {
    const isDev = process.env.NODE_ENV !== "production";
    const message = isDev
      ? `database auth error: ${error.message}`
      : "authentication service unavailable";

    return NextResponse.json({ message }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json(
      { message: "invalid credentials" },
      { status: 401 },
    );
  }

  const token = startSession(user);
  const response = NextResponse.json({ user: sanitizeUser(user) });

  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
