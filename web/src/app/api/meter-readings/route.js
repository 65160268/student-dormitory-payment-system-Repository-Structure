import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { saveMeterReadingData, upsertInvoiceFromMeterReadingData } from "@/lib/data-access";

function normalizeMonthValue(value) {
  const normalized = String(value ?? "").trim();
  if (/^\d{4}-\d{2}$/.test(normalized)) {
    return normalized;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized.slice(0, 7);
  }
  return null;
}

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
  const normalizedMonth = normalizeMonthValue(body.month);
  const fields = [
    "roomId",
    "waterPrevious",
    "waterCurrent",
    "electricPrevious",
    "electricCurrent",
  ];

  const missing = fields.find((field) => body[field] === undefined || body[field] === "");
  if (missing) {
    return NextResponse.json({ message: `${missing} is required` }, { status: 400 });
  }

  if (!normalizedMonth) {
    return NextResponse.json({ message: "month must be in YYYY-MM format" }, { status: 400 });
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

  try {
    const reading = await saveMeterReadingData(
      {
        ...body,
        month: normalizedMonth,
      },
      user,
    );
    const invoice = await upsertInvoiceFromMeterReadingData(reading);
    return NextResponse.json({ reading, invoice }, { status: 201 });
  } catch (error) {
    if (error?.code === "ER_NO_REFERENCED_ROW_2") {
      return NextResponse.json({ message: "room or staff account not found" }, { status: 400 });
    }

    return NextResponse.json({ message: error?.message ?? "unable to save meter reading" }, { status: 500 });
  }
}
