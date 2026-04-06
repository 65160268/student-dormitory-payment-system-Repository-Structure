import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";
import { createPaymentSubmissionData, getInvoiceDataById } from "@/lib/data-access";

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
  if (!body.invoiceId) {
    return NextResponse.json(
      { message: "invoiceId is required" },
      { status: 400 },
    );
  }

  if (!body.slipData && !body.slipUrl) {
    return NextResponse.json(
      { message: "slip image is required" },
      { status: 400 },
    );
  }

  const invoice = await getInvoiceDataById(body.invoiceId);
  if (!invoice) {
    return NextResponse.json({ message: "invoice not found" }, { status: 404 });
  }

  if (invoice.studentId !== user.id) {
    return NextResponse.json({ message: "forbidden invoice access" }, { status: 403 });
  }

  const payment = await createPaymentSubmissionData(
    {
      ...body,
      slipData: body.slipData ?? body.slipUrl,
      amount: invoice.total,
    },
    user,
  );
  return NextResponse.json({ payment }, { status: 201 });
}
