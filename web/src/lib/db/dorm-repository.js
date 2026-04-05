import bcrypt from "bcryptjs";
import { and, desc, eq, isNull, ne, or } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  buildUserIdFromRoleAndUsername,
  dormRooms as fallbackDormRooms,
  USER_ROLE_PREFIX_MAP,
} from "@/lib/data-store";
import {
  housingRecordsTable,
  invoicesTable,
  meterReadingsTable,
  paymentsTable,
  roomsTable,
  usersTable,
} from "@/lib/db/schema";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function createPaymentId() {
  const timePart = String(Date.now()).slice(-10);
  const randomPart = String(Math.floor(Math.random() * 90) + 10);
  return `PAY-${timePart}${randomPart}`;
}

function normalizeSlipUrl(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return "uploaded";
  }

  if (normalized.length <= 500) {
    return normalized;
  }

  return "uploaded";
}

function toDateOnly(value) {
  if (!value) {
    return null;
  }

  return String(value).slice(0, 10);
}

function getRoomMeta(roomId) {
  const fallbackRoom = fallbackDormRooms.find((room) => room.id === roomId);
  if (fallbackRoom) {
    return fallbackRoom;
  }

  const inferredFloor = Number.parseInt(String(roomId).split("-")[0]?.replace(/[^0-9]/g, ""), 10);

  return {
    id: roomId,
    floor: Number.isFinite(inferredFloor) ? inferredFloor : 0,
    monthlyPrice: 0,
    amenities: {},
  };
}

async function getHousingHistoryMapByStudentId(studentIds = null) {
  const db = getDb();
  let query = db
    .select({
      studentId: housingRecordsTable.studentId,
      roomId: housingRecordsTable.roomId,
      checkInDate: housingRecordsTable.checkInDate,
      checkOutDate: housingRecordsTable.checkOutDate,
    })
    .from(housingRecordsTable)
    .orderBy(desc(housingRecordsTable.checkInDate));

  if (Array.isArray(studentIds) && studentIds.length) {
    query = query.where(or(...studentIds.map((studentId) => eq(housingRecordsTable.studentId, studentId))));
  }

  const rows = await query;
  const historyMap = new Map();

  for (const row of rows) {
    const history = historyMap.get(row.studentId) ?? [];
    history.push({
      roomId: row.roomId,
      checkInDate: toDateOnly(row.checkInDate),
      checkOutDate: toDateOnly(row.checkOutDate),
    });
    historyMap.set(row.studentId, history);
  }

  return historyMap;
}

async function getOpenHousingRecordByStudentId(studentId) {
  const db = getDb();
  const rows = await db
    .select()
    .from(housingRecordsTable)
    .where(and(eq(housingRecordsTable.studentId, studentId), isNull(housingRecordsTable.checkOutDate)))
    .orderBy(desc(housingRecordsTable.checkInDate))
    .limit(1);

  return rows[0] ?? null;
}

async function getOpenHousingRecordByRoomId(roomId) {
  const db = getDb();
  const rows = await db
    .select()
    .from(housingRecordsTable)
    .where(and(eq(housingRecordsTable.roomId, roomId), isNull(housingRecordsTable.checkOutDate)))
    .orderBy(desc(housingRecordsTable.checkInDate))
    .limit(1);

  return rows[0] ?? null;
}

async function getCurrentRoomMapByStudentId() {
  const db = getDb();
  const rows = await db
    .select({
      studentId: housingRecordsTable.studentId,
      roomId: housingRecordsTable.roomId,
      checkInDate: housingRecordsTable.checkInDate,
    })
    .from(housingRecordsTable)
    .where(isNull(housingRecordsTable.checkOutDate));

  const map = new Map();

  for (const row of rows) {
    const existing = map.get(row.studentId);
    if (!existing || String(row.checkInDate) > String(existing.checkInDate)) {
      map.set(row.studentId, row);
    }
  }

  return map;
}

export async function getCurrentRoomIdByStudentId(studentId) {
  const roomMap = await getCurrentRoomMapByStudentId();
  return roomMap.get(studentId)?.roomId ?? null;
}

export async function getDashboardByRoleFromDb(role, user) {
  const db = getDb();

  const [allInvoices, allPayments, roomMap, activeRoomsResult, totalRoomsResult] = await Promise.all([
    db.select().from(invoicesTable),
    db.select().from(paymentsTable),
    getCurrentRoomMapByStudentId(),
    db.select().from(housingRecordsTable).where(isNull(housingRecordsTable.checkOutDate)),
    db.select().from(roomsTable).where(eq(roomsTable.isActive, 1)),
  ]);

  const outstandingTotal = allInvoices
    .filter((item) => item.status !== "paid")
    .reduce((sum, item) => sum + toNumber(item.total), 0);

  const paidThisMonth = allPayments
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + toNumber(item.amount), 0);

  const pendingSlips = allPayments.filter((item) => item.status === "pending").length;

  const activeRooms = new Set(activeRoomsResult.map((item) => item.roomId)).size;
  const totalRooms = totalRoomsResult.length;

  const common = {
    summary: {
      outstandingTotal,
      paidThisMonth,
      pendingSlips,
      activeRooms,
      totalRooms,
    },
  };

  if (role === "student") {
    const ownInvoices = allInvoices
      .filter((item) => item.studentId === user.id)
      .sort((a, b) => String(b.month).localeCompare(String(a.month)));
    const ownPayments = allPayments
      .filter((item) => item.studentId === user.id)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .map((item) => ({
        id: item.id,
        invoiceId: item.invoiceId,
        studentId: item.studentId,
        amount: toNumber(item.amount),
        note: item.note ?? "",
        slipUrl: item.slipUrl ?? "",
        slipFileName: item.slipFileName ?? "Slip image",
        submittedAt: toIsoDate(item.submittedAt),
        status: item.status,
        reviewerId: item.reviewerId,
        rejectReason: item.rejectReason ?? "",
        reviewedAt: toIsoDate(item.reviewedAt),
      }));

    const currentInvoice =
      ownInvoices.find((item) => item.status !== "paid") ?? ownInvoices[0] ?? null;

    return {
      ...common,
      highlights: {
        roomId: roomMap.get(user.id)?.roomId ?? user.roomId ?? "-",
        outstanding: ownInvoices
          .filter((item) => item.status !== "paid")
          .reduce((sum, item) => sum + toNumber(item.total), 0),
        currentInvoice: currentInvoice
          ? {
              invoiceId: currentInvoice.id,
              roomId: currentInvoice.roomId,
              month: currentInvoice.month,
              rent: toNumber(currentInvoice.rent),
              water: toNumber(currentInvoice.water),
              electricity: toNumber(currentInvoice.electricity),
              amount: toNumber(currentInvoice.total),
              status: currentInvoice.status,
            }
          : null,
      },
      rows: ownInvoices.map((item) => ({
        id: item.id,
        period: item.month,
        roomId: item.roomId,
        amount: toNumber(item.total),
        status: item.status,
        rent: toNumber(item.rent),
        water: toNumber(item.water),
        electricity: toNumber(item.electricity),
      })),
      payments: ownPayments,
    };
  }

  if (role === "finance") {
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map((item) => [item.id, item]));
    const invoiceMap = new Map(allInvoices.map((item) => [item.id, item]));

    return {
      ...common,
      rows: allPayments
        .slice()
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .map((item) => {
          const invoice = invoiceMap.get(item.invoiceId);
          const student = userMap.get(item.studentId);

          return {
            id: item.id,
            invoiceId: item.invoiceId,
            studentId: item.studentId,
            studentName: student?.name ?? "Unknown student",
            roomId: invoice?.roomId ?? roomMap.get(item.studentId)?.roomId ?? "-",
            rent: toNumber(invoice?.rent),
            water: toNumber(invoice?.water),
            electricity: toNumber(invoice?.electricity),
            amount: toNumber(item.amount),
            status: item.status,
            note: item.note ?? "",
            slip: item.slipUrl,
            slipFileName: item.slipFileName ?? "Slip image",
            rejectReason: item.rejectReason ?? "",
            submittedAt: toIsoDate(item.submittedAt),
          };
        }),
    };
  }

  if (role === "admin") {
    const users = await db.select().from(usersTable).where(eq(usersTable.isActive, 1));

    return {
      ...common,
      rows: users.map((item) => ({
        id: item.id,
        name: item.name,
        username: item.username,
        role: item.role,
        roomId: roomMap.get(item.id)?.roomId ?? "-",
      })),
    };
  }

  if (role === "staff") {
    const readings = await db
      .select()
      .from(meterReadingsTable)
      .orderBy(desc(meterReadingsTable.recordedAt));

    return {
      ...common,
      rows: readings.map((item) => ({
        id: item.id,
        roomId: item.roomId,
        month: item.month,
        waterUsage: toNumber(item.waterCurrent) - toNumber(item.waterPrevious),
        electricUsage: toNumber(item.electricCurrent) - toNumber(item.electricPrevious),
        recordedAt: toIsoDate(item.recordedAt),
      })),
    };
  }

  if (role === "manager") {
    const paidRooms = allInvoices.filter((item) => item.status === "paid").length;
    const pendingRooms = allInvoices.filter((item) => item.status !== "paid").length;
    const roomCount = Math.max(paidRooms + pendingRooms, 1);

    return {
      ...common,
      rows: [
        {
          id: "REP-MONTH-03",
          month: "2026-03",
          collectionRate: `${Math.round((paidRooms / roomCount) * 100)}%`,
          outstandingRooms: pendingRooms,
          paidRooms,
        },
      ],
    };
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.isActive, 1));
  return {
    ...common,
    rows: users.map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      username: item.username,
    })),
  };
}

export async function getInvoiceByIdFromDb(invoiceId) {
  const db = getDb();
  const rows = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.id, invoiceId))
    .limit(1);

  const invoice = rows[0];
  if (!invoice) {
    return null;
  }

  return {
    ...invoice,
    rent: toNumber(invoice.rent),
    water: toNumber(invoice.water),
    electricity: toNumber(invoice.electricity),
    total: toNumber(invoice.total),
  };
}

export async function createPaymentSubmissionInDb(payload, user) {
  const db = getDb();
  const paymentId = createPaymentId();
  const now = new Date();

  const payment = {
    id: paymentId,
    invoiceId: payload.invoiceId,
    studentId: user.id,
    amount: Number(payload.amount),
    note: payload.note ?? "",
    slipUrl: normalizeSlipUrl(payload.slipUrl),
    slipFileName: payload.slipFileName ?? "uploaded-slip",
    submittedAt: now,
    status: "pending",
    reviewerId: null,
    rejectReason: "",
    reviewedAt: null,
  };

  await db.insert(paymentsTable).values(payment);

  return {
    ...payment,
    submittedAt: payment.submittedAt.toISOString(),
  };
}

export async function listPendingPaymentsFromDb() {
  const db = getDb();
  const rows = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.status, "pending"))
    .orderBy(desc(paymentsTable.submittedAt));

  return rows.map((item) => ({
    id: item.id,
    invoiceId: item.invoiceId,
    studentId: item.studentId,
    amount: toNumber(item.amount),
    note: item.note ?? "",
    slipUrl: item.slipUrl ?? "",
    slipFileName: item.slipFileName ?? "Slip image",
    submittedAt: toIsoDate(item.submittedAt),
    status: item.status,
    reviewerId: item.reviewerId,
    rejectReason: item.rejectReason ?? "",
    reviewedAt: toIsoDate(item.reviewedAt),
  }));
}

export async function decidePaymentInDb(paymentId, status, reviewerId, rejectReason = "") {
  const db = getDb();
  const normalizedReason = String(rejectReason ?? "").trim();

  const rows = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.id, paymentId))
    .limit(1);

  const payment = rows[0];
  if (!payment) {
    return null;
  }

  const reviewedAt = new Date();

  await db
    .update(paymentsTable)
    .set({
      status,
      reviewerId,
      rejectReason: status === "rejected" ? normalizedReason : "",
      reviewedAt,
    })
    .where(eq(paymentsTable.id, paymentId));

  if (status === "approved") {
    await db
      .update(invoicesTable)
      .set({ status: "paid" })
      .where(and(eq(invoicesTable.id, payment.invoiceId), ne(invoicesTable.status, "paid")));
  }

  const updatedRows = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.id, paymentId))
    .limit(1);

  const updated = updatedRows[0];

  return {
    id: updated.id,
    invoiceId: updated.invoiceId,
    studentId: updated.studentId,
    amount: toNumber(updated.amount),
    note: updated.note ?? "",
    slipUrl: updated.slipUrl ?? "",
    slipFileName: updated.slipFileName ?? "Slip image",
    submittedAt: toIsoDate(updated.submittedAt),
    status: updated.status,
    reviewerId: updated.reviewerId,
    rejectReason: updated.rejectReason ?? "",
    reviewedAt: toIsoDate(updated.reviewedAt),
  };
}

export async function listUsersFromDb() {
  const db = getDb();
  const [users, roomMap, historyMap] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.isActive, 1)),
    getCurrentRoomMapByStudentId(),
    getHousingHistoryMapByStudentId(),
  ]);

  return users.map((item) => ({
    id: item.id,
    name: item.name,
    username: item.username,
    role: item.role,
    roomId: roomMap.get(item.id)?.roomId ?? null,
    checkInDate: toDateOnly(roomMap.get(item.id)?.checkInDate),
    checkOutDate: null,
    housingHistory: historyMap.get(item.id) ?? [],
  }));
}

export async function listStudentUsersFromDb() {
  const db = getDb();
  const students = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.isActive, 1), eq(usersTable.role, "student")));

  const studentIds = students.map((item) => item.id);
  const [roomMap, historyMap] = await Promise.all([
    getCurrentRoomMapByStudentId(),
    getHousingHistoryMapByStudentId(studentIds),
  ]);

  return students.map((item) => {
    const currentRoom = roomMap.get(item.id);
    const history = historyMap.get(item.id) ?? [];

    return {
      id: item.id,
      name: item.name,
      username: item.username,
      roomId: currentRoom?.roomId ?? null,
      checkInDate: toDateOnly(currentRoom?.checkInDate) ?? history[0]?.checkInDate ?? null,
      checkOutDate: history.find((entry) => entry.checkOutDate)?.checkOutDate ?? null,
      housingHistory: history,
    };
  });
}

export async function listRemovedStudentsFromDb() {
  const db = getDb();
  const students = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.isActive, 0), eq(usersTable.role, "student")));

  const historyMap = await getHousingHistoryMapByStudentId(students.map((item) => item.id));

  return students.map((item) => ({
    id: item.id,
    name: item.name,
    username: item.username,
    deletedAt: toIsoDate(item.deletedAt),
    checkInDate: historyMap.get(item.id)?.[0]?.checkInDate ?? null,
    checkOutDate: historyMap.get(item.id)?.find((entry) => entry.checkOutDate)?.checkOutDate ?? null,
    housingHistory: historyMap.get(item.id) ?? [],
  }));
}

export async function listRoomsWithStatusFromDb() {
  const db = getDb();
  const [rooms, currentRoomMap, students] = await Promise.all([
    db.select().from(roomsTable).where(eq(roomsTable.isActive, 1)),
    getCurrentRoomMapByStudentId(),
    db.select().from(usersTable).where(and(eq(usersTable.isActive, 1), eq(usersTable.role, "student"))),
  ]);

  const studentMap = new Map(students.map((student) => [student.id, student]));
  const occupantByRoomId = new Map();

  for (const [studentId, currentRoom] of currentRoomMap.entries()) {
    occupantByRoomId.set(currentRoom.roomId, studentMap.get(studentId));
  }

  return rooms.map((room) => {
    const occupant = occupantByRoomId.get(room.id);
    const meta = getRoomMeta(room.id);

    return {
      id: room.id,
      floor: meta.floor,
      monthlyPrice: meta.monthlyPrice,
      amenities: meta.amenities,
      status: occupant ? "occupied" : "vacant",
      occupant: occupant
        ? {
            id: occupant.id,
            name: occupant.name,
            username: occupant.username,
          }
        : null,
    };
  });
}

export async function createAdminUserInDb({ name, username, password, role }) {
  const db = getDb();
  const normalizedName = String(name ?? "").trim();
  const normalizedUsername = String(username ?? "").trim();
  const normalizedPassword = String(password ?? "").trim();
  const normalizedRole = String(role ?? "").trim().toLowerCase();

  if (!normalizedName || !normalizedUsername || !normalizedPassword || !normalizedRole) {
    throw new Error("name, username, password and role are required");
  }

  if (!USER_ROLE_PREFIX_MAP[normalizedRole]) {
    throw new Error("invalid role");
  }

  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.some((item) => item.username === normalizedUsername)) {
    throw new Error("username already exists");
  }

  const userId = buildUserIdFromRoleAndUsername(
    normalizedRole,
    normalizedUsername,
    existingUsers.map((item) => item.id),
  );

  const now = new Date();
  const passwordHash = await bcrypt.hash(normalizedPassword, 10);

  await db.insert(usersTable).values({
    id: userId,
    username: normalizedUsername,
    passwordHash,
    name: normalizedName,
    role: normalizedRole,
    isActive: 1,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: userId,
    name: normalizedName,
    username: normalizedUsername,
    role: normalizedRole,
    roomId: null,
  };
}

export async function assignStudentToRoomInDb(studentId, roomId) {
  const db = getDb();
  const [studentRows, roomRows, currentStudentRoom, currentRoomOccupant] = await Promise.all([
    db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, studentId), eq(usersTable.role, "student"), eq(usersTable.isActive, 1)))
      .limit(1),
    db
      .select()
      .from(roomsTable)
      .where(and(eq(roomsTable.id, roomId), eq(roomsTable.isActive, 1)))
      .limit(1),
    getOpenHousingRecordByStudentId(studentId),
    getOpenHousingRecordByRoomId(roomId),
  ]);

  const student = studentRows[0];
  if (!student) {
    throw new Error("student not found");
  }

  if (!roomRows[0]) {
    throw new Error("room not found");
  }

  if (currentStudentRoom) {
    throw new Error("student is already assigned to a room");
  }

  if (currentRoomOccupant) {
    throw new Error("room is occupied");
  }

  const today = new Date().toISOString().slice(0, 10);
  await db.insert(housingRecordsTable).values({
    studentId,
    roomId,
    checkInDate: today,
    checkOutDate: null,
    createdAt: new Date(),
  });

  return {
    studentId: student.id,
    studentName: student.name,
    roomId,
  };
}

export async function moveOutStudentFromRoomInDb(studentId) {
  const db = getDb();
  const [studentRows, openRecord] = await Promise.all([
    db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, studentId), eq(usersTable.role, "student"), eq(usersTable.isActive, 1)))
      .limit(1),
    getOpenHousingRecordByStudentId(studentId),
  ]);

  const student = studentRows[0];
  if (!student) {
    throw new Error("student not found");
  }

  if (!openRecord) {
    throw new Error("student is not assigned to any room");
  }

  const checkOutDate = new Date().toISOString().slice(0, 10);

  await db
    .update(housingRecordsTable)
    .set({ checkOutDate })
    .where(
      and(
        eq(housingRecordsTable.studentId, studentId),
        eq(housingRecordsTable.roomId, openRecord.roomId),
        eq(housingRecordsTable.checkInDate, openRecord.checkInDate),
        isNull(housingRecordsTable.checkOutDate),
      ),
    );

  return {
    studentId: student.id,
    studentName: student.name,
    previousRoomId: openRecord.roomId,
    checkOutDate,
  };
}

export async function deleteStudentUserInDb(studentId) {
  const db = getDb();
  const [studentRows, openRecord] = await Promise.all([
    db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, studentId), eq(usersTable.role, "student"), eq(usersTable.isActive, 1)))
      .limit(1),
    getOpenHousingRecordByStudentId(studentId),
  ]);

  const student = studentRows[0];
  if (!student) {
    throw new Error("student not found");
  }

  if (openRecord) {
    throw new Error("student must move out before deletion");
  }

  const historyRows = await db
    .select()
    .from(housingRecordsTable)
    .where(eq(housingRecordsTable.studentId, studentId))
    .orderBy(desc(housingRecordsTable.checkInDate))
    .limit(1);

  if (historyRows[0] && !historyRows[0].checkOutDate) {
    throw new Error("student must have a move-out date before deletion");
  }

  const now = new Date();
  await db
    .update(usersTable)
    .set({ isActive: 0, deletedAt: now, updatedAt: now })
    .where(eq(usersTable.id, studentId));

  return {
    id: student.id,
    name: student.name,
    username: student.username,
  };
}

export async function restoreStudentUserInDb(studentId) {
  const db = getDb();
  const rows = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.id, studentId), eq(usersTable.role, "student"), eq(usersTable.isActive, 0)))
    .limit(1);

  const student = rows[0];
  if (!student) {
    throw new Error("student not found in archive");
  }

  const now = new Date();
  await db
    .update(usersTable)
    .set({ isActive: 1, deletedAt: null, updatedAt: now })
    .where(eq(usersTable.id, studentId));

  return {
    id: student.id,
    name: student.name,
    username: student.username,
  };
}
