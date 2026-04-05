import { NextResponse } from "next/server";

import { getDb, getDbRuntimeInfo, isDatabaseConfigured } from "@/lib/db/client";

export async function GET() {
  const runtime = getDbRuntimeInfo();

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        status: "online",
        mode: "in-memory",
        runtime,
      },
      { status: 200 },
    );
  }

  try {
    const db = getDb();
    const startedAt = Date.now();
    await db.execute("SELECT 1");
    const latency = Date.now() - startedAt;

    return NextResponse.json(
      {
        status: "online",
        mode: "mysql",
        latency,
        runtime,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "offline",
        mode: "mysql",
        runtime,
        error: error?.message ?? "database unavailable",
      },
      { status: 503 },
    );
  }
}
