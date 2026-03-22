import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { saveMeterReading } from "@/lib/data-store";

export async function POST(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  if (user.role !== "staff") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const fields = [
    "roomId",
    "month",
    "waterPrevious",
    "waterCurrent",
    "electricPrevious",
    "electricCurrent",
  ];

  const missing = fields.find((field) => body[field] === undefined || body[field] === "");
  if (missing) {
    return NextResponse.json({ message: `${missing} is required` }, { status: 400 });
  }

  if (
    Number(body.waterCurrent) < Number(body.waterPrevious) ||
    Number(body.electricCurrent) < Number(body.electricPrevious)
  ) {
    return NextResponse.json(
      { message: "current meter value must be greater than previous value" },
      { status: 400 },
    );
  }

  const reading = saveMeterReading(body, user);
  return NextResponse.json({ reading }, { status: 201 });
}
