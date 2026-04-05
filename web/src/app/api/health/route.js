import { NextResponse } from "next/server";

import { getDb, isDatabaseConfigured } from "@/lib/db/client";

export async function GET() {
  const start = Date.now();

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { status: "online", latency: 0, mode: "in-memory" },
      { status: 200 },
    );
  }

  try {
    const db = getDb();
    // Real DB ping: execute a trivial query
    await db.execute("SELECT 1");
    const latency = Date.now() - start;
    return NextResponse.json(
      { status: "online", latency, mode: "mysql" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { status: "offline", latency: null, error: error.message },
      { status: 503 },
    );
  }
}
