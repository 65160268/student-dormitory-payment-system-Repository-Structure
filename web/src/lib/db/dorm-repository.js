import bcrypt from "bcryptjs";
import { and, desc, eq, isNull, ne, or } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  buildUserIdFromRoleAndUsername,
  dormRooms as fallbackDormRooms,
  USER_ROLE_PREFIX_MAP,
} from "@/lib/data-store";
import {
  auditLogsTable,
  housingRecordsTable,
  invoicesTable,
  maintenanceRequestsTable,
  meterReadingsTable,
  paymentsTable,
  roomRatesTable,
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

function createMeterReadingId() {
  const timePart = String(Date.now()).slice(-10);
  const randomPart = String(Math.floor(Math.random() * 90) + 10);
  return `MTR-${timePart}${randomPart}`;
}

function normalizeBillingMonth(value) {
  const normalized = String(value ?? "").trim();
  if (/^\d{4}-\d{2}$/.test(normalized)) {
    return normalized;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized.slice(0, 7);
  }
  return normalized.slice(0, 7);
}

function createInvoiceId(month) {
  const monthPart = String(month ?? "").replace(/[^0-9]/g, "").slice(0, 6) || "000000";
  const randomPart = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${monthPart}-${randomPart}`;
}

const DEFAULT_RENT = 4500;
const DEFAULT_WATER_RATE_PER_UNIT = 22;
const DEFAULT_ELECTRIC_RATE_PER_UNIT = 8;

async function getCurrentRoomRatesRow() {
  const db = getDb();
  const rows = await db
    .select()
    .from(roomRatesTable)
    .orderBy(desc(roomRatesTable.updatedAt), desc(roomRatesTable.effectiveFrom))
    .limit(1);

  return rows[0] ?? null;
}

function mapRoomRates(row) {
  return {
    waterPerUnit: toNumber(row?.waterPerUnit) || DEFAULT_WATER_RATE_PER_UNIT,
    electricPerUnit: toNumber(row?.electricPerUnit) || DEFAULT_ELECTRIC_RATE_PER_UNIT,
    effectiveFrom: row?.effectiveFrom ?? new Date().toISOString().slice(0, 10),
  };
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

function normalizeSlipData(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
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

  const allInvoices = await db.select().from(invoicesTable);
  const allPayments = await db.select().from(paymentsTable);
  const roomMap = await getCurrentRoomMapByStudentId();
  const activeRoomsResult = await db
    .select()
    .from(housingRecordsTable)
    .where(isNull(housingRecordsTable.checkOutDate));
  const totalRoomsResult = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.isActive, 1));

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
        slipUrl: item.slipData ?? item.slipUrl ?? "",
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
            slip: item.slipData ?? item.slipUrl,
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
    const students = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
      })
      .from(usersTable)
      .where(and(eq(usersTable.role, "student"), eq(usersTable.isActive, 1)));

    const studentById = new Map(students.map((item) => [item.id, item]));
    const occupantByRoomId = new Map(
      Array.from(roomMap.entries()).map(([studentId, currentRoom]) => [currentRoom.roomId, studentById.get(studentId)]),
    );

    const occupiedRoomIds = new Set(Array.from(roomMap.values()).map((item) => item.roomId));

    const readings = (await db
      .select()
      .from(meterReadingsTable)
      .orderBy(desc(meterReadingsTable.recordedAt)))
      .filter((item) => occupiedRoomIds.has(item.roomId));

    const roomOptions = new Set();
    totalRoomsResult.forEach((item) => {
      if (item?.id) {
        roomOptions.add(item.id);
      }
    });
    Array.from(roomMap.values()).forEach((item) => {
      if (item?.roomId) {
        roomOptions.add(item.roomId);
      }
    });
    readings.forEach((item) => {
      if (item?.roomId) {
        roomOptions.add(item.roomId);
      }
    });

    return {
      ...common,
      roomOptions: Array.from(roomOptions).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })),
      rows: readings.map((item) => ({
        id: item.id,
        roomId: item.roomId,
        studentId: occupantByRoomId.get(item.roomId)?.id ?? "-",
        studentUsername: occupantByRoomId.get(item.roomId)?.username ?? "-",
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
    slipData: normalizeSlipData(payload.slipData),
    slipUrl: payload.slipUrl ? normalizeSlipUrl(payload.slipUrl) : null,
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
    slipUrl: item.slipData ?? item.slipUrl ?? "",
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
    slipUrl: updated.slipData ?? updated.slipUrl ?? "",
    slipFileName: updated.slipFileName ?? "Slip image",
    submittedAt: toIsoDate(updated.submittedAt),
    status: updated.status,
    reviewerId: updated.reviewerId,
    rejectReason: updated.rejectReason ?? "",
    reviewedAt: toIsoDate(updated.reviewedAt),
  };
}

export async function saveMeterReadingInDb(payload, user) {
  const db = getDb();
  const now = new Date();
  const month = normalizeBillingMonth(payload.month);

  const existingRows = await db
    .select({ id: meterReadingsTable.id })
    .from(meterReadingsTable)
    .where(and(eq(meterReadingsTable.roomId, payload.roomId), eq(meterReadingsTable.month, month)))
    .limit(1);

  const existing = existingRows[0];

  if (existing) {
    await db
      .update(meterReadingsTable)
      .set({
        waterPrevious: Number(payload.waterPrevious),
        waterCurrent: Number(payload.waterCurrent),
        electricPrevious: Number(payload.electricPrevious),
        electricCurrent: Number(payload.electricCurrent),
        recordedBy: user.id,
        recordedAt: now,
      })
      .where(eq(meterReadingsTable.id, existing.id));

    return {
      id: existing.id,
      roomId: payload.roomId,
      month,
      waterPrevious: toNumber(payload.waterPrevious),
      waterCurrent: toNumber(payload.waterCurrent),
      electricPrevious: toNumber(payload.electricPrevious),
      electricCurrent: toNumber(payload.electricCurrent),
      recordedBy: user.id,
      recordedAt: now.toISOString(),
    };
  }

  const reading = {
    id: createMeterReadingId(),
    roomId: payload.roomId,
    month,
    waterPrevious: Number(payload.waterPrevious),
    waterCurrent: Number(payload.waterCurrent),
    electricPrevious: Number(payload.electricPrevious),
    electricCurrent: Number(payload.electricCurrent),
    recordedBy: user.id,
    recordedAt: now,
  };

  await db.insert(meterReadingsTable).values(reading);

  return {
    ...reading,
    waterPrevious: toNumber(reading.waterPrevious),
    waterCurrent: toNumber(reading.waterCurrent),
    electricPrevious: toNumber(reading.electricPrevious),
    electricCurrent: toNumber(reading.electricCurrent),
    recordedAt: reading.recordedAt.toISOString(),
  };
}

export async function upsertInvoiceFromMeterReadingInDb(reading) {
  const db = getDb();

  const openHousingRows = await db
    .select({ studentId: housingRecordsTable.studentId })
    .from(housingRecordsTable)
    .where(and(eq(housingRecordsTable.roomId, reading.roomId), isNull(housingRecordsTable.checkOutDate)))
    .orderBy(desc(housingRecordsTable.checkInDate))
    .limit(1);

  const occupant = openHousingRows[0];
  if (!occupant) {
    return null;
  }

  const usageWater = Math.max(0, toNumber(reading.waterCurrent) - toNumber(reading.waterPrevious));
  const usageElectric = Math.max(0, toNumber(reading.electricCurrent) - toNumber(reading.electricPrevious));

  const latestInvoiceRows = await db
    .select({ rent: invoicesTable.rent })
    .from(invoicesTable)
    .where(eq(invoicesTable.studentId, occupant.studentId))
    .orderBy(desc(invoicesTable.month), desc(invoicesTable.createdAt))
    .limit(1);

  const currentRates = mapRoomRates(await getCurrentRoomRatesRow());

  const roomRent = toNumber(getRoomMeta(reading.roomId)?.monthlyPrice);
  const baseRent = toNumber(latestInvoiceRows[0]?.rent) || roomRent || DEFAULT_RENT;
  const waterCharge = usageWater * currentRates.waterPerUnit;
  const electricityCharge = usageElectric * currentRates.electricPerUnit;
  const total = baseRent + waterCharge + electricityCharge;

  const existingRows = await db
    .select()
    .from(invoicesTable)
    .where(and(eq(invoicesTable.studentId, occupant.studentId), eq(invoicesTable.month, reading.month)))
    .limit(1);

  const existing = existingRows[0];
  const now = new Date();

  if (existing) {
    await db
      .update(invoicesTable)
      .set({
        roomId: reading.roomId,
        rent: baseRent,
        water: waterCharge,
        electricity: electricityCharge,
        total,
        updatedAt: now,
      })
      .where(eq(invoicesTable.id, existing.id));

    return {
      id: existing.id,
      studentId: existing.studentId,
      roomId: reading.roomId,
      month: reading.month,
      rent: baseRent,
      water: waterCharge,
      electricity: electricityCharge,
      total,
      status: existing.status,
    };
  }

  const invoice = {
    id: createInvoiceId(reading.month),
    studentId: occupant.studentId,
    roomId: reading.roomId,
    month: reading.month,
    rent: baseRent,
    water: waterCharge,
    electricity: electricityCharge,
    total,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(invoicesTable).values(invoice);

  return {
    ...invoice,
    rent: toNumber(invoice.rent),
    water: toNumber(invoice.water),
    electricity: toNumber(invoice.electricity),
    total: toNumber(invoice.total),
  };
}

export async function getRoomRatesFromDb() {
  return mapRoomRates(await getCurrentRoomRatesRow());
}

export async function addAuditLogInDb(actorId, action, targetType, targetId, detail) {
  const db = getDb();
  const now = new Date();

  await db.insert(auditLogsTable).values({
    actorId,
    action,
    targetType: targetType ?? null,
    targetId: targetId ?? null,
    detail: { message: String(detail ?? "") },
    createdAt: now,
  });

  return {
    actorId,
    action,
    targetType: targetType ?? null,
    targetId: targetId ?? null,
    detail: String(detail ?? ""),
    createdAt: now.toISOString(),
  };
}

export async function listAuditLogsFromDb(limit = 50) {
  const db = getDb();
  const [logs, users] = await Promise.all([
    db
      .select()
      .from(auditLogsTable)
      .orderBy(desc(auditLogsTable.createdAt), desc(auditLogsTable.id))
      .limit(limit),
    db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable),
  ]);

  const userMap = new Map(users.map((item) => [item.id, item.name]));

  return logs.map((log) => ({
    id: String(log.id),
    actorId: log.actorId,
    actorName: userMap.get(log.actorId) ?? log.actorId,
    action: log.action,
    targetType: log.targetType ?? "",
    targetId: log.targetId ?? "",
    detail: typeof log.detail === "object" && log.detail !== null
      ? String(log.detail.message ?? JSON.stringify(log.detail))
      : String(log.detail ?? ""),
    createdAt: toIsoDate(log.createdAt),
  }));
}

export async function listMaintenanceRequestsFromDb(filterStudentId = null) {
  const db = getDb();
  let query = db
    .select()
    .from(maintenanceRequestsTable)
    .orderBy(desc(maintenanceRequestsTable.createdAt), desc(maintenanceRequestsTable.id));

  if (filterStudentId) {
    query = query.where(eq(maintenanceRequestsTable.studentId, filterStudentId));
  }

  const [requests, users] = await Promise.all([
    query,
    db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable),
  ]);

  const userMap = new Map(users.map((item) => [item.id, item.name]));

  return requests.map((item) => ({
    id: String(item.id),
    studentId: item.studentId,
    roomId: item.roomId,
    title: item.title,
    description: item.description ?? "",
    status: item.status,
    assignedTo: item.assignedTo,
    assignedToName: item.assignedTo ? (userMap.get(item.assignedTo) ?? null) : null,
    studentName: userMap.get(item.studentId) ?? "Unknown",
    createdAt: toIsoDate(item.createdAt),
    updatedAt: toIsoDate(item.updatedAt),
    resolvedAt: toIsoDate(item.resolvedAt),
  }));
}

export async function createMaintenanceRequestInDb({ studentId, roomId, title, description }) {
  const db = getDb();
  const [studentRows, openHousingRows] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, studentId)).limit(1),
    db
      .select({ roomId: housingRecordsTable.roomId })
      .from(housingRecordsTable)
      .where(and(eq(housingRecordsTable.studentId, studentId), isNull(housingRecordsTable.checkOutDate)))
      .orderBy(desc(housingRecordsTable.checkInDate))
      .limit(1),
  ]);

  const student = studentRows[0];
  if (!student) {
    throw new Error("student not found");
  }

  const resolvedRoomId = roomId ?? openHousingRows[0]?.roomId ?? null;
  if (!resolvedRoomId) {
    throw new Error("student room not found");
  }

  const now = new Date();
  const [result] = await db.insert(maintenanceRequestsTable).values({
    studentId,
    roomId: resolvedRoomId,
    title: String(title ?? "").trim(),
    description: String(description ?? "").trim(),
    status: "open",
    assignedTo: null,
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: String(result.insertId),
    studentId,
    roomId: resolvedRoomId,
    title: String(title ?? "").trim(),
    description: String(description ?? "").trim(),
    status: "open",
    assignedTo: null,
    assignedToName: null,
    studentName: student.name,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    resolvedAt: null,
  };
}

export async function updateMaintenanceStatusInDb(id, status, staffId = null) {
  const db = getDb();
  const normalizedId = Number(id);
  const rows = await db
    .select()
    .from(maintenanceRequestsTable)
    .where(eq(maintenanceRequestsTable.id, normalizedId))
    .limit(1);

  const request = rows[0];
  if (!request) {
    throw new Error("maintenance request not found");
  }

  const resolvedAt = status === "resolved" ? new Date() : null;
  await db
    .update(maintenanceRequestsTable)
    .set({
      status,
      assignedTo: staffId && status === "in_progress" ? staffId : request.assignedTo,
      resolvedAt: status === "resolved" ? resolvedAt : request.resolvedAt,
      updatedAt: new Date(),
    })
    .where(eq(maintenanceRequestsTable.id, normalizedId));

  const updatedRows = await db
    .select()
    .from(maintenanceRequestsTable)
    .where(eq(maintenanceRequestsTable.id, normalizedId))
    .limit(1);

  const users = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable);
  const userMap = new Map(users.map((item) => [item.id, item.name]));
  const updated = updatedRows[0];

  return {
    id: String(updated.id),
    studentId: updated.studentId,
    roomId: updated.roomId,
    title: updated.title,
    description: updated.description ?? "",
    status: updated.status,
    assignedTo: updated.assignedTo,
    assignedToName: updated.assignedTo ? (userMap.get(updated.assignedTo) ?? null) : null,
    studentName: userMap.get(updated.studentId) ?? "Unknown",
    createdAt: toIsoDate(updated.createdAt),
    updatedAt: toIsoDate(updated.updatedAt),
    resolvedAt: toIsoDate(updated.resolvedAt),
  };
}

export async function updateRoomRatesInDb(waterPerUnit, electricPerUnit, updatedBy) {
  const db = getDb();
  const now = new Date();
  const effectiveFrom = now.toISOString().slice(0, 10);
  const existing = await getCurrentRoomRatesRow();

  if (existing) {
    await db
      .update(roomRatesTable)
      .set({
        waterPerUnit: Number(waterPerUnit),
        electricPerUnit: Number(electricPerUnit),
        effectiveFrom,
        updatedBy,
        updatedAt: now,
      })
      .where(eq(roomRatesTable.id, existing.id));
  } else {
    await db.insert(roomRatesTable).values({
      id: 1,
      waterPerUnit: Number(waterPerUnit),
      electricPerUnit: Number(electricPerUnit),
      effectiveFrom,
      updatedBy,
      updatedAt: now,
    });
  }

  return mapRoomRates(await getCurrentRoomRatesRow());
}

export async function listUsersFromDb() {
  const db = getDb();
  const [users, roomMap, historyMap] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.isActive, 1)),
    getCurrentRoomMapByStudentId(),
    getHousingHistoryMapByStudentId(),
  ]);

  return users.map((item) => {
    const currentRoom = roomMap.get(item.id);
    const history = historyMap.get(item.id) ?? [];

    return {
      id: item.id,
      name: item.name,
      username: item.username,
      role: item.role,
      roomId: currentRoom?.roomId ?? null,
      checkInDate: toDateOnly(currentRoom?.checkInDate) ?? history[0]?.checkInDate ?? null,
      checkOutDate: history.find((entry) => entry.checkOutDate)?.checkOutDate ?? null,
      housingHistory: history,
    };
  });
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
