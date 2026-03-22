import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { decidePayment } from "@/lib/data-store";

export async function POST(request, { params }) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  if (user.role !== "finance") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  if (!["approved", "rejected"].includes(body.status)) {
    return NextResponse.json(
      { message: "status must be approved or rejected" },
      { status: 400 },
    );
  }

  const { paymentId } = params;
  const payment = decidePayment(paymentId, body.status, user.id);
  if (!payment) {
    return NextResponse.json({ message: "payment not found" }, { status: 404 });
  }

  return NextResponse.json({ payment });
}
