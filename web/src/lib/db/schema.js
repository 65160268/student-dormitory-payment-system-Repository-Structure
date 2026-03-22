import { mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  roomId: varchar("room_id", { length: 20 }),
});
