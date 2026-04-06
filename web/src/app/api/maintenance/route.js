import { NextResponse } from "next/server";
import {
  createMaintenanceRequestData,
  listMaintenanceRequestsData,
  updateMaintenanceStatusData,
} from "@/lib/data-access";
import { getSessionCookieName, getUserByToken } from "@/lib/auth";

function getSessionUser(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  return getUserByToken(token);
}

// GET /api/maintenance  — student sees own, staff/finance/admin see all
export async function GET(request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const studentFilter = session.role === "student" ? session.id : null;
  const list = await listMaintenanceRequestsData(studentFilter);
  return NextResponse.json({ maintenance: list });
}

// POST /api/maintenance  — student creates request
export async function POST(request) {
  const session = getSessionUser(request);
  if (!session || session.role !== "student") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description } = body;

  if (!String(title ?? "").trim()) {
    return NextResponse.json({ message: "title is required" }, { status: 400 });
  }

  try {
    const req = await createMaintenanceRequestData({
      studentId: session.id,
      roomId: session.roomId,
      title,
      description,
    });

    return NextResponse.json({ maintenance: req }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message ?? "unable to create maintenance request" }, { status: 500 });
  }
}

// PATCH /api/maintenance  — staff updates status
export async function PATCH(request) {
  const session = getSessionUser(request);
  if (!session || !["staff", "admin"].includes(session.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id, status } = await request.json();
  if (!id || !status) {
    return NextResponse.json({ message: "id and status are required" }, { status: 400 });
  }

  const validStatuses = new Set(["open", "in_progress", "resolved", "closed"]);
  if (!validStatuses.has(status)) {
    return NextResponse.json({ message: "invalid status" }, { status: 400 });
  }

  try {
    const updated = await updateMaintenanceStatusData(id, status, session.id);
    return NextResponse.json({ maintenance: updated });
  } catch (error) {
    return NextResponse.json({ message: error.message ?? "unable to update maintenance request" }, { status: 500 });
  }
}
