import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { createPaymentSubmission } from "@/lib/data-store";

export async function POST(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  if (user.role !== "student") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.invoiceId || !body.amount) {
    return NextResponse.json(
      { message: "invoiceId and amount are required" },
      { status: 400 },
    );
  }

  const payment = createPaymentSubmission(body, user);
  return NextResponse.json({ payment }, { status: 201 });
}
