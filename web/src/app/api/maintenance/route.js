import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  users,
  listMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceStatus,
} from "@/lib/data-store";

function getSessionUser() {
  const store = cookies();
  const raw = store.get("dorm_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

// GET /api/maintenance  — student sees own, staff/finance/admin see all
export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const studentFilter = session.role === "student" ? session.id : null;
  const list = listMaintenanceRequests(studentFilter);
  return NextResponse.json({ maintenance: list });
}

// POST /api/maintenance  — student creates request
export async function POST(request) {
  const session = getSessionUser();
  if (!session || session.role !== "student") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description } = body;

  if (!String(title ?? "").trim()) {
    return NextResponse.json({ message: "title is required" }, { status: 400 });
  }

  const req = createMaintenanceRequest({
    studentId: session.id,
    roomId: session.roomId,
    title,
    description,
  });

  return NextResponse.json({ maintenance: req }, { status: 201 });
}

// PATCH /api/maintenance  — staff updates status
export async function PATCH(request) {
  const session = getSessionUser();
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

  const updated = updateMaintenanceStatus(id, status, session.id);
  return NextResponse.json({ maintenance: updated });
}
