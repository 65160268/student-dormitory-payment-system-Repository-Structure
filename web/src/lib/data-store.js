import { randomUUID } from "crypto";

export const users = [
  {
    id: "stu-65160381",
    username: "65160381",
    password: "pass1234",
    name: "Parinya Triyakun",
    role: "student",
    roomId: "A-214",
    checkInDate: "2026-01-10",
    checkOutDate: null,
    housingHistory: [
      {
        roomId: "A-214",
        checkInDate: "2026-01-10",
        checkOutDate: null,
      },
    ],
  },
  {
    id: "stu-65160268",
    username: "65160268",
    password: "pass1234",
    name: "Sorrawit Srisuk",
    role: "student",
    roomId: "A-101",
    checkInDate: "2026-01-14",
    checkOutDate: null,
    housingHistory: [
      {
        roomId: "A-101",
        checkInDate: "2026-01-14",
        checkOutDate: null,
      },
    ],
  },
  {
    id: "stu-65160255",
    username: "65160255",
    password: "pass1234",
    name: "Nirattisai Klaysuwan",
    role: "student",
    roomId: "A-202",
    checkInDate: "2026-01-16",
    checkOutDate: null,
    housingHistory: [
      {
        roomId: "A-202",
        checkInDate: "2026-01-16",
        checkOutDate: null,
      },
    ],
  },
  {
    id: "stu-65160132",
    username: "65160132",
    password: "pass1234",
    name: "Aumnat Chakamnan",
    role: "student",
    roomId: "A-302",
    checkInDate: "2026-01-20",
    checkOutDate: null,
    housingHistory: [
      {
        roomId: "A-302",
        checkInDate: "2026-01-20",
        checkOutDate: null,
      },
    ],
  },
  {
    id: "stu-65160267",
    username: "65160267",
    password: "pass1234",
    name: "Weerapat Tapaotong",
    role: "student",
    roomId: "A-104",
    checkInDate: "2026-01-18",
    checkOutDate: null,
    housingHistory: [
      {
        roomId: "A-104",
        checkInDate: "2026-01-18",
        checkOutDate: null,
      },
    ],
  },
  {
    id: "stu-65160022",
    username: "65160022",
    password: "pass1234",
    name: "Phoowadon Teekhao",
    role: "student",
    roomId: null,
    checkInDate: null,
    checkOutDate: null,
    housingHistory: [],
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

export const removedStudents = [];

export const USER_ROLE_PREFIX_MAP = {
  student: "stu",
  staff: "staff",
  finance: "fin",
  manager: "mgr",
  admin: "admin",
};

function normalizeUserIdPart(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildUserIdFromRoleAndUsername(role, username, existingIds = []) {
  const normalizedRole = String(role ?? "").trim().toLowerCase();
  const prefix = USER_ROLE_PREFIX_MAP[normalizedRole];

  if (!prefix) {
    throw new Error("invalid role");
  }

  const normalizedUsername = normalizeUserIdPart(username);
  if (!normalizedUsername) {
    throw new Error("username is required for id generation");
  }

  const baseId = `${prefix}-${normalizedUsername}`;
  if (!existingIds.includes(baseId)) {
    return baseId;
  }

  let counter = 2;
  while (existingIds.includes(`${baseId}-${counter}`)) {
    counter += 1;
  }

  return `${baseId}-${counter}`;
}

export const roomRates = {
  rent: 4500,
  waterPerUnit: 22,
  electricPerUnit: 8,
};

export const dormRooms = [
  {
    id: "A-101",
    floor: 1,
    monthlyPrice: 4200,
    amenities: {
      airConditioner: false,
      fan: true,
      bed: true,
      tv: false,
      fridge: false,
      waterHeater: true,
    },
  },
  {
    id: "A-102",
    floor: 1,
    monthlyPrice: 4250,
    amenities: {
      airConditioner: false,
      fan: true,
      bed: true,
      tv: false,
      fridge: true,
      waterHeater: true,
    },
  },
  {
    id: "A-103",
    floor: 1,
    monthlyPrice: 4300,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: false,
      fridge: true,
      waterHeater: true,
    },
  },
  {
    id: "A-104",
    floor: 1,
    monthlyPrice: 4350,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: true,
      fridge: true,
      waterHeater: true,
    },
  },
  {
    id: "A-201",
    floor: 2,
    monthlyPrice: 4400,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: false,
      fridge: true,
      waterHeater: true,
    },
  },
  {
    id: "A-202",
    floor: 2,
    monthlyPrice: 4450,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: true,
      fridge: false,
      waterHeater: true,
    },
  },
  {
    id: "A-214",
    floor: 2,
    monthlyPrice: 4500,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: true,
      fridge: true,
      waterHeater: true,
    },
  },
  {
    id: "A-215",
    floor: 2,
    monthlyPrice: 4550,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: true,
      fridge: true,
      waterHeater: true,
    },
  },
  {
    id: "A-301",
    floor: 3,
    monthlyPrice: 4600,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: false,
      fridge: true,
      waterHeater: true,
    },
  },
  {
    id: "A-302",
    floor: 3,
    monthlyPrice: 4650,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: true,
      fridge: true,
      waterHeater: true,
    },
  },
  {
    id: "A-303",
    floor: 3,
    monthlyPrice: 4700,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: true,
      fridge: true,
      waterHeater: true,
    },
  },
  {
    id: "A-304",
    floor: 3,
    monthlyPrice: 4750,
    amenities: {
      airConditioner: true,
      fan: true,
      bed: true,
      tv: true,
      fridge: true,
      waterHeater: true,
    },
  },
];

export const invoices = [
  // ─── Parinya (A-214) ────────────────────────────────────────────
  {
    id: "INV-2026-010-381",
    studentId: "stu-65160381",
    roomId: "A-214",
    month: "2026-01",
    rent: 4500,
    water: 220,
    electricity: 800,
    total: 5520,
    status: "paid",
    createdAt: "2026-01-01T09:00:00.000Z",
  },
  {
    id: "INV-2026-020-381",
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
  {
    id: "INV-2026-030-381",
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
  // ─── Sorrawit (A-101) ───────────────────────────────────────────
  {
    id: "INV-2026-020-268",
    studentId: "stu-65160268",
    roomId: "A-101",
    month: "2026-02",
    rent: 4200,
    water: 242,
    electricity: 800,
    total: 5242,
    status: "paid",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "INV-2026-030-268",
    studentId: "stu-65160268",
    roomId: "A-101",
    month: "2026-03",
    rent: 4200,
    water: 264,
    electricity: 880,
    total: 5344,
    status: "pending",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  // ─── Nirattisai (A-202) ─────────────────────────────────────────
  {
    id: "INV-2026-020-255",
    studentId: "stu-65160255",
    roomId: "A-202",
    month: "2026-02",
    rent: 4450,
    water: 220,
    electricity: 760,
    total: 5430,
    status: "paid",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "INV-2026-030-255",
    studentId: "stu-65160255",
    roomId: "A-202",
    month: "2026-03",
    rent: 4450,
    water: 242,
    electricity: 840,
    total: 5532,
    status: "pending",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  // ─── Aumnat (A-302) ─────────────────────────────────────────────
  {
    id: "INV-2026-020-132",
    studentId: "stu-65160132",
    roomId: "A-302",
    month: "2026-02",
    rent: 4650,
    water: 198,
    electricity: 720,
    total: 5568,
    status: "paid",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "INV-2026-030-132",
    studentId: "stu-65160132",
    roomId: "A-302",
    month: "2026-03",
    rent: 4650,
    water: 220,
    electricity: 800,
    total: 5670,
    status: "pending",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  // ─── Weerapat (A-104) ───────────────────────────────────────────
  {
    id: "INV-2026-030-267",
    studentId: "stu-65160267",
    roomId: "A-104",
    month: "2026-03",
    rent: 4350,
    water: 242,
    electricity: 864,
    total: 5456,
    status: "pending",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
];

export const payments = [
  // ─── Parinya ────────────────────────────────────────────────────
  {
    id: "PAY-1001",
    invoiceId: "INV-2026-010-381",
    studentId: "stu-65160381",
    amount: 5520,
    note: "โอนผ่าน KBank",
    slipUrl: "https://example.com/slips/PAY-1001.png",
    slipFileName: "slip_jan_381.png",
    submittedAt: "2026-01-04T10:00:00.000Z",
    status: "approved",
    reviewerId: "fin-001",
    rejectReason: "",
  },
  {
    id: "PAY-1002",
    invoiceId: "INV-2026-020-381",
    studentId: "stu-65160381",
    amount: 5620,
    note: "โอนผ่าน KBank",
    slipUrl: "https://example.com/slips/PAY-1002.png",
    slipFileName: "slip_feb_381.png",
    submittedAt: "2026-02-03T10:00:00.000Z",
    status: "approved",
    reviewerId: "fin-001",
    rejectReason: "",
  },
  // ─── Sorrawit (ยื่นสลิปมาร์ชแล้ว รอ Finance อนุมัติ) ────────────
  {
    id: "PAY-1003",
    invoiceId: "INV-2026-020-268",
    studentId: "stu-65160268",
    amount: 5242,
    note: "จ่ายผ่าน SCB",
    slipUrl: "https://example.com/slips/PAY-1003.png",
    slipFileName: "slip_feb_268.png",
    submittedAt: "2026-02-05T09:30:00.000Z",
    status: "approved",
    reviewerId: "fin-001",
    rejectReason: "",
  },
  {
    id: "PAY-1004",
    invoiceId: "INV-2026-030-268",
    studentId: "stu-65160268",
    amount: 5344,
    note: "จ่ายผ่าน SCB",
    slipUrl: "https://example.com/slips/PAY-1004.png",
    slipFileName: "slip_mar_268.png",
    submittedAt: "2026-03-04T08:45:00.000Z",
    status: "pending",
    reviewerId: null,
    rejectReason: "",
  },
  // ─── Nirattisai (ยื่นสลิปมาร์ชแล้ว รอ Finance อนุมัติ) ─────────
  {
    id: "PAY-1005",
    invoiceId: "INV-2026-020-255",
    studentId: "stu-65160255",
    amount: 5430,
    note: "โอนผ่าน BBL",
    slipUrl: "https://example.com/slips/PAY-1005.png",
    slipFileName: "slip_feb_255.png",
    submittedAt: "2026-02-06T11:00:00.000Z",
    status: "approved",
    reviewerId: "fin-001",
    rejectReason: "",
  },
  {
    id: "PAY-1006",
    invoiceId: "INV-2026-030-255",
    studentId: "stu-65160255",
    amount: 5532,
    note: "โอนผ่าน BBL",
    slipUrl: "https://example.com/slips/PAY-1006.png",
    slipFileName: "slip_mar_255.png",
    submittedAt: "2026-03-05T10:20:00.000Z",
    status: "pending",
    reviewerId: null,
    rejectReason: "",
  },
  // ─── Aumnat (สลิปถูกปฏิเสธ ต้องส่งใหม่) ────────────────────────
  {
    id: "PAY-1007",
    invoiceId: "INV-2026-020-132",
    studentId: "stu-65160132",
    amount: 5568,
    note: "โอนผ่าน KTB",
    slipUrl: "https://example.com/slips/PAY-1007.png",
    slipFileName: "slip_feb_132.png",
    submittedAt: "2026-02-07T09:00:00.000Z",
    status: "approved",
    reviewerId: "fin-001",
    rejectReason: "",
  },
  {
    id: "PAY-1008",
    invoiceId: "INV-2026-030-132",
    studentId: "stu-65160132",
    amount: 5670,
    note: "โอนผ่าน KTB",
    slipUrl: "https://example.com/slips/PAY-1008.png",
    slipFileName: "slip_mar_132.png",
    submittedAt: "2026-03-03T14:00:00.000Z",
    status: "rejected",
    reviewerId: "fin-001",
    rejectReason: "สลิปไม่ชัดเจน ไม่สามารถระบุจำนวนเงินได้ กรุณาส่งใหม่",
  },
  // ─── Weerapat (ยื่นสลิปแล้ว รอ Finance อนุมัติ) ─────────────────
  {
    id: "PAY-1009",
    invoiceId: "INV-2026-030-267",
    studentId: "stu-65160267",
    amount: 5456,
    note: "จ่ายผ่าน Prompt Pay",
    slipUrl: "https://example.com/slips/PAY-1009.png",
    slipFileName: "slip_mar_267.png",
    submittedAt: "2026-03-06T13:30:00.000Z",
    status: "pending",
    reviewerId: null,
    rejectReason: "",
  },
];

export const maintenanceRequests = [
  {
    id: "MNT-001",
    studentId: "stu-65160381",
    roomId: "A-214",
    title: "แอร์ไม่เย็น",
    description: "แอร์ในห้องทำงานได้แต่ไม่เย็นเลย ใช้งานไม่ได้",
    status: "open",
    assignedTo: null,
    createdAt: "2026-03-10T10:00:00.000Z",
    resolvedAt: null,
  },
  {
    id: "MNT-002",
    studentId: "stu-65160268",
    roomId: "A-101",
    title: "ก๊อกน้ำรั่ว",
    description: "ก๊อกน้ำในห้องน้ำหยดตลอดเวลาทำให้น้ำเสีย",
    status: "in_progress",
    assignedTo: "staff-001",
    createdAt: "2026-03-12T08:00:00.000Z",
    resolvedAt: null,
  },
  {
    id: "MNT-003",
    studentId: "stu-65160255",
    roomId: "A-202",
    title: "หลอดไฟห้องน้ำเสีย",
    description: "หลอดไฟในห้องน้ำขาด ไม่สามารถเปิดได้",
    status: "resolved",
    assignedTo: "staff-001",
    createdAt: "2026-03-05T09:00:00.000Z",
    resolvedAt: "2026-03-07T11:00:00.000Z",
  },
  {
    id: "MNT-004",
    studentId: "stu-65160132",
    roomId: "A-302",
    title: "ประตูห้องปิดไม่สนิท",
    description: "ประตูบานหน้าปิดไม่สนิท ลมเข้าตลอดคืน",
    status: "open",
    assignedTo: null,
    createdAt: "2026-03-15T14:00:00.000Z",
    resolvedAt: null,
  },
];

export const auditLogs = [
  { id: "AUD-001", actorId: "fin-001",   action: "approve_payment", targetType: "payment", targetId: "PAY-1001", detail: "อนุมัติการชำระ INV-2026-010-381", createdAt: "2026-01-05T09:00:00.000Z" },
  { id: "AUD-002", actorId: "fin-001",   action: "approve_payment", targetType: "payment", targetId: "PAY-1002", detail: "อนุมัติการชำระ INV-2026-020-381", createdAt: "2026-02-04T09:00:00.000Z" },
  { id: "AUD-003", actorId: "fin-001",   action: "approve_payment", targetType: "payment", targetId: "PAY-1003", detail: "อนุมัติการชำระ INV-2026-020-268", createdAt: "2026-02-06T10:00:00.000Z" },
  { id: "AUD-004", actorId: "fin-001",   action: "approve_payment", targetType: "payment", targetId: "PAY-1005", detail: "อนุมัติการชำระ INV-2026-020-255", createdAt: "2026-02-07T11:00:00.000Z" },
  { id: "AUD-005", actorId: "fin-001",   action: "approve_payment", targetType: "payment", targetId: "PAY-1007", detail: "อนุมัติการชำระ INV-2026-020-132", createdAt: "2026-02-08T09:00:00.000Z" },
  { id: "AUD-006", actorId: "fin-001",   action: "reject_payment",  targetType: "payment", targetId: "PAY-1008", detail: "ปฏิเสธ PAY-1008: สลิปไม่ชัดเจน", createdAt: "2026-03-04T10:00:00.000Z" },
  { id: "AUD-007", actorId: "admin-001", action: "create_user",     targetType: "user",    targetId: "stu-65160268", detail: "สร้างนักศึกษา Sorrawit Srisuk", createdAt: "2026-01-05T08:00:00.000Z" },
  { id: "AUD-008", actorId: "admin-001", action: "assign_room",     targetType: "room",    targetId: "A-214", detail: "Assign stu-65160381 เข้าห้อง A-214", createdAt: "2026-01-10T08:30:00.000Z" },
  { id: "AUD-009", actorId: "admin-001", action: "update_rates",    targetType: "rate",    targetId: "1", detail: "อัปเดตอัตราค่าน้ำ=22, ค่าไฟ=8", createdAt: "2026-01-01T07:00:00.000Z" },
];

export const meterReadings = [
  // ─── A-214 (Parinya) ────────────────────────────────────────────
  {
    id: "MTR-0001",
    roomId: "A-214",
    month: "2026-02",
    waterPrevious: 1180,
    waterCurrent: 1191,
    electricPrevious: 4930,
    electricCurrent: 5040,
    recordedBy: "staff-001",
    recordedAt: "2026-02-02T08:00:00.000Z",
  },
  {
    id: "MTR-0002",
    roomId: "A-214",
    month: "2026-03",
    waterPrevious: 1191,
    waterCurrent: 1203,
    electricPrevious: 5040,
    electricCurrent: 5169,
    recordedBy: "staff-001",
    recordedAt: "2026-03-02T08:15:00.000Z",
  },
  // ─── A-101 (Sorrawit) ───────────────────────────────────────────
  {
    id: "MTR-0003",
    roomId: "A-101",
    month: "2026-02",
    waterPrevious: 820,
    waterCurrent: 831,
    electricPrevious: 3210,
    electricCurrent: 3310,
    recordedBy: "staff-001",
    recordedAt: "2026-02-02T08:30:00.000Z",
  },
  {
    id: "MTR-0004",
    roomId: "A-101",
    month: "2026-03",
    waterPrevious: 831,
    waterCurrent: 843,
    electricPrevious: 3310,
    electricCurrent: 3420,
    recordedBy: "staff-001",
    recordedAt: "2026-03-02T08:30:00.000Z",
  },
  // ─── A-202 (Nirattisai) ─────────────────────────────────────────
  {
    id: "MTR-0005",
    roomId: "A-202",
    month: "2026-02",
    waterPrevious: 640,
    waterCurrent: 650,
    electricPrevious: 2760,
    electricCurrent: 2855,
    recordedBy: "staff-001",
    recordedAt: "2026-02-02T09:00:00.000Z",
  },
  {
    id: "MTR-0006",
    roomId: "A-202",
    month: "2026-03",
    waterPrevious: 650,
    waterCurrent: 661,
    electricPrevious: 2855,
    electricCurrent: 2960,
    recordedBy: "staff-001",
    recordedAt: "2026-03-02T09:00:00.000Z",
  },
  // ─── A-302 (Aumnat) ─────────────────────────────────────────────
  {
    id: "MTR-0007",
    roomId: "A-302",
    month: "2026-02",
    waterPrevious: 510,
    waterCurrent: 519,
    electricPrevious: 1980,
    electricCurrent: 2070,
    recordedBy: "staff-001",
    recordedAt: "2026-02-02T09:30:00.000Z",
  },
  {
    id: "MTR-0008",
    roomId: "A-302",
    month: "2026-03",
    waterPrevious: 519,
    waterCurrent: 529,
    electricPrevious: 2070,
    electricCurrent: 2170,
    recordedBy: "staff-001",
    recordedAt: "2026-03-02T09:30:00.000Z",
  },
  // ─── A-104 (Weerapat) ───────────────────────────────────────────
  {
    id: "MTR-0009",
    roomId: "A-104",
    month: "2026-03",
    waterPrevious: 300,
    waterCurrent: 311,
    electricPrevious: 1450,
    electricCurrent: 1558,
    recordedBy: "staff-001",
    recordedAt: "2026-03-02T10:00:00.000Z",
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
    const currentInvoice =
      ownInvoices.find((item) => item.status !== "paid") ?? ownInvoices[0] ?? null;

    return {
      ...common,
      highlights: {
        roomId: user.roomId,
        outstanding: getStudentOutstanding(user.id),
        currentInvoice: currentInvoice
          ? {
              invoiceId: currentInvoice.id,
              roomId: currentInvoice.roomId,
              month: currentInvoice.month,
              rent: currentInvoice.rent,
              water: currentInvoice.water,
              electricity: currentInvoice.electricity,
              amount: currentInvoice.total,
              status: currentInvoice.status,
            }
          : null,
      },
      rows: ownInvoices.map((item) => ({
        id: item.id,
        period: item.month,
        roomId: item.roomId,
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
      rows: payments.map((item) => {
        const invoice = invoices.find((entry) => entry.id === item.invoiceId);
        const student = users.find((entry) => entry.id === item.studentId);

        return {
          id: item.id,
          invoiceId: item.invoiceId,
          studentId: item.studentId,
          studentName: student?.name ?? "Unknown student",
          roomId: invoice?.roomId ?? student?.roomId ?? "-",
          rent: invoice?.rent ?? 0,
          water: invoice?.water ?? 0,
          electricity: invoice?.electricity ?? 0,
          amount: item.amount,
          status: item.status,
          note: item.note,
          slip: item.slipUrl,
          slipFileName: item.slipFileName ?? "Slip image",
          rejectReason: item.rejectReason ?? "",
          submittedAt: item.submittedAt,
        };
      }),
    };
  }

  if (role === "admin") {
    return {
      ...common,
      rows: users.map((item) => ({
        id: item.id,
        name: item.name,
        username: item.username,
        role: item.role,
        roomId: item.roomId ?? "-",
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
    slipFileName: payload.slipFileName ?? "uploaded-slip",
    submittedAt: new Date().toISOString(),
    status: "pending",
    reviewerId: null,
    rejectReason: "",
  };

  payments.unshift(payment);
  return payment;
}

export function listPendingPayments() {
  return payments.filter((item) => item.status === "pending");
}

export function getInvoiceById(invoiceId) {
  return invoices.find((item) => item.id === invoiceId);
}

export function listUsers() {
  return users.map((item) => ({
    id: item.id,
    name: item.name,
    username: item.username,
    role: item.role,
    roomId: item.roomId ?? null,
    checkInDate: item.checkInDate ?? null,
    checkOutDate: item.checkOutDate ?? null,
    housingHistory: item.housingHistory ?? [],
  }));
}

export function listStudentUsers() {
  return users
    .filter((item) => item.role === "student")
    .map((item) => ({
      id: item.id,
      name: item.name,
      username: item.username,
      roomId: item.roomId ?? null,
      checkInDate: item.checkInDate ?? null,
      checkOutDate: item.checkOutDate ?? null,
      housingHistory: item.housingHistory ?? [],
    }));
}

export function listRemovedStudents() {
  return removedStudents.map((item) => ({
    id: item.id,
    name: item.name,
    username: item.username,
    deletedAt: item.deletedAt,
    checkInDate: item.checkInDate ?? null,
    checkOutDate: item.checkOutDate ?? null,
    housingHistory: item.housingHistory ?? [],
  }));
}

export function listRoomsWithStatus() {
  const studentByRoom = new Map(
    users
      .filter((item) => item.role === "student" && item.roomId)
      .map((item) => [item.roomId, item]),
  );

  return dormRooms.map((room) => {
    const occupant = studentByRoom.get(room.id);
    return {
      ...room,
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

export function createAdminUser({ name, username, password, role }) {
  const normalizedName = String(name ?? "").trim();
  const normalizedUsername = String(username ?? "").trim();
  const normalizedPassword = String(password ?? "").trim();
  const normalizedRole = String(role ?? "").trim().toLowerCase();

  if (!normalizedName || !normalizedUsername || !normalizedPassword || !normalizedRole) {
    throw new Error("name, username, password and role are required");
  }

  if (!users.every((item) => item.username !== normalizedUsername)) {
    throw new Error("username already exists");
  }

  const validRoles = new Set(["student", "staff", "finance", "manager", "admin"]);
  if (!validRoles.has(normalizedRole)) {
    throw new Error("invalid role");
  }

  const nextId = buildUserIdFromRoleAndUsername(
    normalizedRole,
    normalizedUsername,
    [
      ...users.map((item) => item.id),
      ...removedStudents.map((item) => item.id),
    ],
  );

  const user = {
    id: nextId,
    name: normalizedName,
    username: normalizedUsername,
    password: normalizedPassword,
    role: normalizedRole,
    ...(normalizedRole === "student"
      ? { roomId: null, checkInDate: null, checkOutDate: null, housingHistory: [] }
      : {}),
  };

  users.push(user);
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    roomId: user.roomId ?? null,
  };
}

export function assignStudentToRoom(studentId, roomId) {
  const student = users.find((item) => item.id === studentId && item.role === "student");
  if (!student) {
    throw new Error("student not found");
  }

  const room = dormRooms.find((item) => item.id === roomId);
  if (!room) {
    throw new Error("room not found");
  }

  const occupiedBy = users.find(
    (item) => item.role === "student" && item.roomId === roomId && item.id !== student.id,
  );

  if (occupiedBy) {
    throw new Error("room is occupied");
  }

  student.roomId = roomId;
  student.checkInDate = new Date().toISOString().slice(0, 10);
  student.checkOutDate = null;
  const history = student.housingHistory ?? [];
  history.push({
    roomId,
    checkInDate: student.checkInDate,
    checkOutDate: null,
  });
  student.housingHistory = history;

  return {
    studentId: student.id,
    studentName: student.name,
    roomId,
  };
}

export function moveOutStudentFromRoom(studentId) {
  const student = users.find((item) => item.id === studentId && item.role === "student");
  if (!student) {
    throw new Error("student not found");
  }

  if (!student.roomId) {
    throw new Error("student is not assigned to any room");
  }

  const previousRoomId = student.roomId;
  student.roomId = null;
  student.checkOutDate = new Date().toISOString().slice(0, 10);
  const latestOpenHistory = [...(student.housingHistory ?? [])]
    .reverse()
    .find((entry) => entry.roomId === previousRoomId && !entry.checkOutDate);

  if (latestOpenHistory) {
    latestOpenHistory.checkOutDate = student.checkOutDate;
  }

  return {
    studentId: student.id,
    studentName: student.name,
    previousRoomId,
    checkOutDate: student.checkOutDate,
  };
}

export function deleteStudentUser(studentId) {
  const index = users.findIndex((item) => item.id === studentId && item.role === "student");
  if (index < 0) {
    throw new Error("student not found");
  }

  const student = users[index];
  if (student.roomId) {
    throw new Error("student must move out before deletion");
  }

  if (!student.checkOutDate) {
    throw new Error("student must have a move-out date before deletion");
  }

  removedStudents.unshift({
    ...student,
    deletedAt: new Date().toISOString(),
  });
  users.splice(index, 1);

  return {
    id: student.id,
    name: student.name,
    username: student.username,
  };
}

export function restoreStudentUser(studentId) {
  const removedIndex = removedStudents.findIndex((item) => item.id === studentId);
  if (removedIndex < 0) {
    throw new Error("student not found in archive");
  }

  const archivedStudent = removedStudents[removedIndex];
  if (!users.every((item) => item.username !== archivedStudent.username)) {
    throw new Error("username already exists in active users");
  }

  users.push({
    id: archivedStudent.id,
    name: archivedStudent.name,
    username: archivedStudent.username,
    password: archivedStudent.password,
    role: "student",
    roomId: null,
    checkInDate: archivedStudent.checkInDate ?? null,
    checkOutDate: archivedStudent.checkOutDate ?? null,
    housingHistory: archivedStudent.housingHistory ?? [],
  });

  removedStudents.splice(removedIndex, 1);

  return {
    id: archivedStudent.id,
    name: archivedStudent.name,
    username: archivedStudent.username,
  };
}

export function decidePayment(paymentId, status, reviewerId, rejectReason = "") {
  const target = payments.find((item) => item.id === paymentId);
  if (!target) {
    return null;
  }

  target.status = status;
  target.reviewerId = reviewerId;
  target.rejectReason = status === "rejected" ? rejectReason : "";

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

// ─── Maintenance Requests ──────────────────────────────────────────────────

export function listMaintenanceRequests(filterStudentId = null) {
  const list = filterStudentId
    ? maintenanceRequests.filter((item) => item.studentId === filterStudentId)
    : maintenanceRequests;
  return list.map((item) => {
    const student = users.find((u) => u.id === item.studentId);
    const staff = item.assignedTo ? users.find((u) => u.id === item.assignedTo) : null;
    return {
      ...item,
      studentName: student?.name ?? "Unknown",
      assignedToName: staff?.name ?? null,
    };
  });
}

export function createMaintenanceRequest({ studentId, roomId, title, description }) {
  const student = users.find((u) => u.id === studentId);
  if (!student) throw new Error("student not found");
  const req = {
    id: `MNT-${String(maintenanceRequests.length + 1).padStart(3, "0")}`,
    studentId,
    roomId: roomId ?? student.roomId ?? "-",
    title: String(title).trim(),
    description: String(description ?? "").trim(),
    status: "open",
    assignedTo: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  maintenanceRequests.unshift(req);
  return req;
}

export function updateMaintenanceStatus(id, status, staffId = null) {
  const req = maintenanceRequests.find((item) => item.id === id);
  if (!req) throw new Error("maintenance request not found");
  req.status = status;
  if (staffId && status === "in_progress") req.assignedTo = staffId;
  if (status === "resolved") req.resolvedAt = new Date().toISOString();
  return req;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────

export function addAuditLog(actorId, action, targetType, targetId, detail) {
  const log = {
    id: `AUD-${String(auditLogs.length + 1).padStart(3, "0")}`,
    actorId,
    action,
    targetType,
    targetId,
    detail,
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(log);
  return log;
}

export function listAuditLogs(limit = 50) {
  return auditLogs.slice(0, limit).map((log) => {
    const actor = users.find((u) => u.id === log.actorId);
    return { ...log, actorName: actor?.name ?? log.actorId };
  });
}

// ─── Room Rates ───────────────────────────────────────────────────────────

export function getRoomRates() {
  return { ...roomRates };
}

export function updateRoomRates(waterPerUnit, electricPerUnit) {
  roomRates.waterPerUnit = Number(waterPerUnit);
  roomRates.electricPerUnit = Number(electricPerUnit);
  return { ...roomRates };
}

// ─── Overdue ──────────────────────────────────────────────────────────────

export function markOverdueInvoices() {
  const today = new Date();
  let count = 0;
  invoices.forEach((item) => {
    if (item.status === "pending") {
      const invoiceMonth = new Date(item.month + "-28"); // end of month approx
      if (invoiceMonth < today) {
        item.status = "overdue";
        count++;
      }
    }
  });
  return { marked: count };
}

export function listOverdueInvoices() {
  return invoices
    .filter((item) => item.status === "overdue" || item.status === "pending")
    .map((item) => {
      const student = users.find((u) => u.id === item.studentId);
      return { ...item, studentName: student?.name ?? "Unknown" };
    });
}

// ─── Change Password ──────────────────────────────────────────────────────

export function changeUserPassword(userId, currentPassword, newPassword) {
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("user not found");
  if (user.password !== currentPassword) throw new Error("รหัสผ่านปัจจุบันไม่ถูกต้อง");
  user.password = newPassword;
  return { success: true };
}

