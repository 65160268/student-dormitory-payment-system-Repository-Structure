import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { generateMonthlyInvoices } from "@/lib/data-store";

export async function POST(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  if (user.role !== "finance") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.month) {
    return NextResponse.json({ message: "month is required" }, { status: 400 });
  }

  const invoices = generateMonthlyInvoices(body.month);
  return NextResponse.json({ invoices, count: invoices.length }, { status: 201 });
}
