import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { decidePaymentData } from "@/lib/data-access";

export async function POST(request, context) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  if (!["finance", "admin"].includes(user.role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  if (!["approved", "rejected"].includes(body.status)) {
    return NextResponse.json(
      { message: "status must be approved or rejected" },
      { status: 400 },
    );
  }

  if (body.status === "rejected" && !String(body.rejectReason ?? "").trim()) {
    return NextResponse.json(
      { message: "reject reason is required" },
      { status: 400 },
    );
  }

  const resolvedParams = await context?.params;
  const paymentId = String(resolvedParams?.paymentId ?? "").trim();

  if (!paymentId) {
    return NextResponse.json({ message: "paymentId is required" }, { status: 400 });
  }

  const payment = await decidePaymentData(
    paymentId,
    body.status,
    user.id,
    String(body.rejectReason ?? "").trim(),
  );
  if (!payment) {
    return NextResponse.json({ message: "payment not found" }, { status: 404 });
  }

  return NextResponse.json({ payment });
}
