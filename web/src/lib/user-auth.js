import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { users as fallbackUsers } from "@/lib/data-store";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { usersTable } from "@/lib/db/schema";

function mapDbUser(row) {
  return {
    id: row.id,
    username: row.username,
    password: row.passwordHash,
    name: row.fullName,
    role: row.role,
    roomId: row.roomId ?? null,
  };
}

function isBcryptHash(value) {
  return typeof value === "string" && value.startsWith("$2");
}

async function verifyPassword(plainPassword, storedPassword) {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  return plainPassword === storedPassword;
}

async function findFromDatabase(username, password) {
  const db = getDb();
  if (!db) {
    return null;
  }

  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  const user = rows[0];
  if (!user) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return null;
  }

  return mapDbUser(user);
}

function findFromFallback(username, password) {
  return fallbackUsers.find(
    (user) => user.username === username && user.password === password,
  );
}

export async function findUserByCredential(username, password) {
  if (isDatabaseConfigured()) {
    return findFromDatabase(username, password);
  }

  return findFromFallback(username, password);
}
