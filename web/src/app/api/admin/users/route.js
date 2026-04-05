import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import {
  createAdminUser,
  deleteStudentUser,
  listRemovedStudents,
  listUsers,
  restoreStudentUser,
} from "@/lib/data-store";

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
    users: listUsers(),
    removedStudents: listRemovedStudents(),
  });
}

export async function POST(request) {
  const auth = getAdminUser(request);
  if (auth.error) {
    return auth.error;
  }

  const body = await request.json();

  try {
    const user = createAdminUser(body);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "failed to create user" },
      { status: 400 },
    );
  }
}

export async function DELETE(request) {
  const auth = getAdminUser(request);
  if (auth.error) {
    return auth.error;
  }

  const body = await request.json();

  if (!body.studentId) {
    return NextResponse.json(
      { message: "studentId is required" },
      { status: 400 },
    );
  }

  try {
    const deleted = deleteStudentUser(body.studentId);
    return NextResponse.json({ deleted });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "failed to delete student" },
      { status: 400 },
    );
  }
}

export async function PATCH(request) {
  const auth = getAdminUser(request);
  if (auth.error) {
    return auth.error;
  }

  const body = await request.json();

  if (!body.studentId) {
    return NextResponse.json(
      { message: "studentId is required" },
      { status: 400 },
    );
  }

  try {
    const restored = restoreStudentUser(body.studentId);
    return NextResponse.json({ restored });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "failed to restore student" },
      { status: 400 },
    );
  }
}
