import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db/client";
import { moveOutStudentFromRoomInDb } from "@/lib/db/dorm-repository";
import { moveOutStudentFromRoom } from "@/lib/data-store";

export async function POST(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const body = await request.json();

  if (!body.studentId) {
    return NextResponse.json(
      { message: "studentId is required" },
      { status: 400 },
    );
  }

  try {
    const movedOut = isDatabaseConfigured()
      ? await moveOutStudentFromRoomInDb(body.studentId)
      : moveOutStudentFromRoom(body.studentId);

    return NextResponse.json({ movedOut });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "failed to move out student" },
      { status: 400 },
    );
  }
}
