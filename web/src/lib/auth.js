import { cookies } from "next/headers";

import { users } from "@/lib/data-store";

const SESSION_COOKIE = "dorm_session";

function encodeSessionUser(user) {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

function decodeSessionUser(value) {
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(json);

    if (!parsed?.id || !parsed?.role || !parsed?.username || !parsed?.name) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function toSessionUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    username: user.username,
    roomId: user.roomId ?? null,
  };
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function startSession(user) {
  return encodeSessionUser(toSessionUser(user));
}

export function endSession() {
  return;
}

export function getUserByToken(token) {
  if (!token) {
    return null;
  }
  return decodeSessionUser(token);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return getUserByToken(token);
}

export function sanitizeUser(user) {
  return toSessionUser(user);
}

export function findUserById(userId) {
  return users.find((item) => item.id === userId) ?? null;
}
