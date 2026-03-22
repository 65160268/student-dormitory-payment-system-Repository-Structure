import { randomUUID } from "crypto";

export const users = [
  {
    id: "stu-65160381",
    username: "65160381",
    password: "pass1234",
    name: "Parinya Trinyakul",
    role: "student",
    roomId: "A-214",
  },
  {
    id: "staff-001",
    username: "staff01",
    password: "pass1234",
    name: "Dorm Staff",
    role: "staff",
  },
  {
    id: "fin-001",
    username: "finance01",
    password: "pass1234",
    name: "Finance Officer",
    role: "finance",
  },
  {
    id: "mgr-001",
    username: "manager01",
    password: "pass1234",
    name: "Dorm Manager",
    role: "manager",
  },
  {
    id: "admin-001",
    username: "admin01",
    password: "pass1234",
    name: "System Admin",
    role: "admin",
  },
];

export const roomRates = {
  rent: 4500,
  waterPerUnit: 22,
  electricPerUnit: 8,
};

export const invoices = [
  {
    id: "INV-2026-030",
    studentId: "stu-65160381",
    roomId: "A-214",
    month: "2026-03",
    rent: 4500,
    water: 260,
    electricity: 1030,
    total: 5790,
    status: "pending",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "INV-2026-020",
    studentId: "stu-65160381",
    roomId: "A-214",
    month: "2026-02",
    rent: 4500,
    water: 240,
    electricity: 880,
    total: 5620,
    status: "paid",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
];

export const payments = [
  {
    id: "PAY-1001",
    invoiceId: "INV-2026-020",
    studentId: "stu-65160381",
    amount: 5620,
    note: "Payment completed",
    slipUrl: "https://example.com/slips/PAY-1001.png",
    submittedAt: "2026-02-03T10:00:00.000Z",
    status: "approved",
    reviewerId: "fin-001",
  },
];

export const meterReadings = [
  {
    id: "MTR-0001",
    roomId: "A-214",
    month: "2026-03",
    waterPrevious: 1190,
    waterCurrent: 1202,
    electricPrevious: 5040,
    electricCurrent: 5168,
    recordedBy: "staff-001",
    recordedAt: "2026-03-02T08:15:00.000Z",
  },
];

function getStudentOutstanding(studentId) {
  return invoices
    .filter((item) => item.studentId === studentId && item.status !== "paid")
    .reduce((sum, item) => sum + item.total, 0);
}

export function findUserByCredential(username, password) {
  return users.find(
    (user) => user.username === username && user.password === password,
  );
}

export function getDashboardByRole(role, user) {
  const outstandingTotal = invoices
    .filter((item) => item.status !== "paid")
    .reduce((sum, item) => sum + item.total, 0);

  const paidThisMonth = payments
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + item.amount, 0);

  const pendingSlips = payments.filter((item) => item.status === "pending").length;

  const common = {
    summary: {
      outstandingTotal,
      paidThisMonth,
      pendingSlips,
      activeRooms: 312,
      totalRooms: 340,
    },
  };

  if (role === "student") {
    const ownInvoices = invoices.filter((item) => item.studentId === user.id);
    const ownPayments = payments.filter((item) => item.studentId === user.id);

    return {
      ...common,
      highlights: {
        roomId: user.roomId,
        outstanding: getStudentOutstanding(user.id),
      },
      rows: ownInvoices.map((item) => ({
        id: item.id,
        period: item.month,
        amount: item.total,
        status: item.status,
        rent: item.rent,
        water: item.water,
        electricity: item.electricity,
      })),
      payments: ownPayments,
    };
  }

  if (role === "finance") {
    return {
      ...common,
      rows: payments.map((item) => ({
        id: item.id,
        invoiceId: item.invoiceId,
        studentId: item.studentId,
        amount: item.amount,
        status: item.status,
        submittedAt: item.submittedAt,
      })),
    };
  }

  if (role === "staff") {
    return {
      ...common,
      rows: meterReadings.map((item) => ({
        id: item.id,
        roomId: item.roomId,
        month: item.month,
        waterUsage: item.waterCurrent - item.waterPrevious,
        electricUsage: item.electricCurrent - item.electricPrevious,
        recordedAt: item.recordedAt,
      })),
    };
  }

  if (role === "manager") {
    const paidRooms = invoices.filter((item) => item.status === "paid").length;
    const pendingRooms = invoices.filter((item) => item.status !== "paid").length;
    const totalRooms = Math.max(paidRooms + pendingRooms, 1);

    return {
      ...common,
      rows: [
        {
          id: "REP-MONTH-03",
          month: "2026-03",
          collectionRate: "82.4%",
          outstandingRooms: pendingRooms,
          paidRooms,
        },
        {
          id: "REP-MONTH-02",
          month: "2026-02",
          collectionRate: "88.1%",
          outstandingRooms: Math.max(pendingRooms - 2, 0),
          paidRooms: Math.min(paidRooms + 2, totalRooms),
        },
        {
          id: "REP-MONTH-01",
          month: "2026-01",
          collectionRate: "90.3%",
          outstandingRooms: Math.max(pendingRooms - 4, 0),
          paidRooms: Math.min(paidRooms + 4, totalRooms),
        },
      ],
    };
  }

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

export function createPaymentSubmission(payload, user) {
  const payment = {
    id: `PAY-${String(payments.length + 1001)}`,
    invoiceId: payload.invoiceId,
    studentId: user.id,
    amount: Number(payload.amount),
    note: payload.note ?? "",
    slipUrl: payload.slipUrl ?? "uploaded",
    submittedAt: new Date().toISOString(),
    status: "pending",
    reviewerId: null,
  };

  payments.unshift(payment);
  return payment;
}

export function listPendingPayments() {
  return payments.filter((item) => item.status === "pending");
}

export function decidePayment(paymentId, status, reviewerId) {
  const target = payments.find((item) => item.id === paymentId);
  if (!target) {
    return null;
  }

  target.status = status;
  target.reviewerId = reviewerId;

  if (status === "approved") {
    const invoice = invoices.find((item) => item.id === target.invoiceId);
    if (invoice) {
      invoice.status = "paid";
    }
  }

  return target;
}

export function saveMeterReading(payload, user) {
  const reading = {
    id: `MTR-${String(meterReadings.length + 1).padStart(4, "0")}`,
    roomId: payload.roomId,
    month: payload.month,
    waterPrevious: Number(payload.waterPrevious),
    waterCurrent: Number(payload.waterCurrent),
    electricPrevious: Number(payload.electricPrevious),
    electricCurrent: Number(payload.electricCurrent),
    recordedBy: user.id,
    recordedAt: new Date().toISOString(),
  };

  meterReadings.unshift(reading);
  return reading;
}

export function generateMonthlyInvoices(month) {
  const studentUsers = users.filter((item) => item.role === "student");
  const created = studentUsers.map((student, index) => {
    const baseWater = 220 + index * 10;
    const baseElectric = 850 + index * 40;
    const invoice = {
      id: `INV-${month.replace("-", "")}-${String(index + 1).padStart(3, "0")}`,
      studentId: student.id,
      roomId: student.roomId ?? `R-${index + 1}`,
      month,
      rent: roomRates.rent,
      water: baseWater,
      electricity: baseElectric,
      total: roomRates.rent + baseWater + baseElectric,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    invoices.unshift(invoice);
    return invoice;
  });

  return created;
}

export function getSummaryReport() {
  const totalIncome = payments
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalOutstanding = invoices
    .filter((item) => item.status !== "paid")
    .reduce((sum, item) => sum + item.total, 0);

  const paidRooms = invoices.filter((item) => item.status === "paid").length;
  const pendingRooms = invoices.filter((item) => item.status !== "paid").length;

  return {
    totalIncome,
    totalOutstanding,
    paidRooms,
    pendingRooms,
    generatedAt: new Date().toISOString(),
  };
}

export function createSessionToken() {
  return randomUUID();
}
