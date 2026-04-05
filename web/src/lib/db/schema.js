import {
  char,
  datetime,
  decimal,
  mysqlEnum,
  mysqlTable,
  text,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  id: varchar("id", { length: 30 }).primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  isActive: tinyint("is_active").notNull().default(1),
  deletedAt: datetime("deleted_at"),
  createdAt: datetime("created_at"),
  updatedAt: datetime("updated_at"),
});

export const roomsTable = mysqlTable("rooms", {
  id: varchar("id", { length: 10 }).primaryKey(),
  isActive: tinyint("is_active").notNull().default(1),
});

export const housingRecordsTable = mysqlTable("housing_records", {
  studentId: varchar("student_id", { length: 30 }).notNull(),
  roomId: varchar("room_id", { length: 10 }).notNull(),
  checkInDate: char("check_in_date", { length: 10 }).notNull(),
  checkOutDate: char("check_out_date", { length: 10 }),
  createdAt: datetime("created_at"),
});

export const meterReadingsTable = mysqlTable("meter_readings", {
  id: varchar("id", { length: 20 }).primaryKey(),
  roomId: varchar("room_id", { length: 10 }).notNull(),
  month: char("month", { length: 7 }).notNull(),
  waterPrevious: decimal("water_previous", { precision: 10, scale: 2 }).notNull(),
  waterCurrent: decimal("water_current", { precision: 10, scale: 2 }).notNull(),
  electricPrevious: decimal("electric_previous", { precision: 10, scale: 2 }).notNull(),
  electricCurrent: decimal("electric_current", { precision: 10, scale: 2 }).notNull(),
  recordedBy: varchar("recorded_by", { length: 30 }).notNull(),
  recordedAt: datetime("recorded_at"),
});

export const invoicesTable = mysqlTable("invoices", {
  id: varchar("id", { length: 25 }).primaryKey(),
  studentId: varchar("student_id", { length: 30 }).notNull(),
  roomId: varchar("room_id", { length: 10 }).notNull(),
  month: char("month", { length: 7 }).notNull(),
  rent: decimal("rent", { precision: 10, scale: 2 }).notNull(),
  water: decimal("water", { precision: 10, scale: 2 }).notNull(),
  electricity: decimal("electricity", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).notNull(),
  createdAt: datetime("created_at"),
  updatedAt: datetime("updated_at"),
});

export const paymentsTable = mysqlTable("payments", {
  id: varchar("id", { length: 20 }).primaryKey(),
  invoiceId: varchar("invoice_id", { length: 25 }).notNull(),
  studentId: varchar("student_id", { length: 30 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  note: text("note"),
  slipUrl: varchar("slip_url", { length: 500 }),
  slipFileName: varchar("slip_file_name", { length: 255 }),
  submittedAt: datetime("submitted_at"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull(),
  reviewerId: varchar("reviewer_id", { length: 30 }),
  rejectReason: text("reject_reason"),
  reviewedAt: datetime("reviewed_at"),
});
