import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db/client";
import { assignStudentToRoomInDb } from "@/lib/db/dorm-repository";
import { assignStudentToRoom } from "@/lib/data-store";

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

  if (!body.studentId || !body.roomId) {
    return NextResponse.json(
      { message: "studentId and roomId are required" },
      { status: 400 },
    );
  }

  try {
    const assignment = isDatabaseConfigured()
      ? await assignStudentToRoomInDb(body.studentId, body.roomId)
      : assignStudentToRoom(body.studentId, body.roomId);

    return NextResponse.json({ assignment });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "failed to assign room" },
      { status: 400 },
    );
  }
}
