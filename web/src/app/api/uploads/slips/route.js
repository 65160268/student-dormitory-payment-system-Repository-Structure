import { NextResponse } from "next/server";

import { getSessionCookieName, getUserByToken } from "@/lib/auth";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const MIME_EXTENSION = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

function parseDataUrl(dataUrl) {
  const match = String(dataUrl ?? "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2];
  const extension = MIME_EXTENSION[mimeType];

  if (!extension) {
    return null;
  }

  return { mimeType, base64Data, extension };
}

function sanitizeBaseName(name) {
  const base = String(name ?? "slip")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return base || "slip";
}

export async function POST(request) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  if (![
    "student",
    "finance",
    "admin",
    "staff",
    "manager",
  ].includes(user.role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = parseDataUrl(body.dataUrl);

  if (!parsed) {
    return NextResponse.json(
      { message: "invalid image payload" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(parsed.base64Data, "base64");
  if (!buffer.length || buffer.length > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: "slip image must be less than 4 MB" },
      { status: 400 },
    );
  }

  const safeName = sanitizeBaseName(body.fileName);
  const fileName = `${Date.now()}-${safeName}.${parsed.extension}`;

  return NextResponse.json({
    slipData: body.dataUrl,
    slipFileName: body.fileName ?? fileName,
  });
}
