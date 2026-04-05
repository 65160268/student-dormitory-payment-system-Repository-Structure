import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { listRoomsWithStatus, listStudentUsers } from "@/lib/data-store";

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

export async function GET(request) {
  const auth = getAdminUser(request);
  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json({
    rooms: listRoomsWithStatus(),
    students: listStudentUsers(),
  });
}
