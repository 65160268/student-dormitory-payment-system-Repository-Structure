"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertTriangle, BarChart3, Building2, ClipboardList, CreditCard, Download, FileSpreadsheet, Settings, Shield, Upload, Users, Wallet, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/app/theme-toggle";

const roleMeta = {
  student: {
    title: "Student Dashboard",
    description: "Track bills due, submit payment slips, and review payment history.",
    icon: Wallet,
    color: "#365E32",
    colorBg: "#365E3218",
  },
  staff: {
    title: "Staff Operations Dashboard",
    description: "Monitor meter activity and keep room utility records up to date.",
    icon: Building2,
    color: "#D2691E",
    colorBg: "#D2691E18",
  },
  finance: {
    title: "Finance Dashboard",
    description: "Approve payment slips and control monthly invoice generation.",
    icon: CreditCard,
    color: "#008080",
    colorBg: "#00808018",
  },
  manager: {
    title: "Management Dashboard",
    description: "Review collection trends, overdue exposure, and high-level financial risk.",
    icon: Activity,
    color: "#2C3E50",
    colorBg: "#2C3E5018",
  },
  admin: {
    title: "Admin Dashboard",
    description: "Oversee platform users, access policy health, and account governance.",
    icon: Shield,
    color: "#6C3483",
    colorBg: "#6C348318",
  },
};

function formatMoney(value) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getStatusMeta(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "approved") {
    return {
      label: "APPROVED",
      className: "border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 rounded-md",
    };
  }

  if (normalized === "pending") {
    return {
      label: "PENDING",
      className: "border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 rounded-md",
    };
  }

  if (normalized === "rejected") {
    return {
      label: "NOT APPROVE",
      className: "border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300 rounded-md",
    };
  }

  return {
    label: String(status || "-").toUpperCase(),
    className: "border border-border/70 bg-muted/20 px-2 py-0.5 text-xs font-semibold text-muted-foreground rounded-md",
  };
}

function getRoomStatusMeta(status) {
  if (status === "vacant") {
    return {
      label: "ว่าง",
      className: "border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 rounded-md",
    };
  }

  return {
    label: "ไม่ว่าง",
    className: "border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300 rounded-md",
  };
}

function getAdminUserStatusMeta(row) {
  if (row.deletedAt) {
    return {
      label: "เก็บเข้าคลังแล้ว",
      className: "border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-md",
    };
  }

  if (row.role !== "student") {
    return {
      label: "ใช้งานอยู่",
      className: "border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-300 rounded-md",
    };
  }

  if (row.roomId) {
    return {
      label: "พักอยู่ในหอ",
      className: "border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 rounded-md",
    };
  }

  if (row.checkOutDate) {
    return {
      label: "ย้ายออกแล้ว",
      className: "border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 rounded-md",
    };
  }

  return {
    label: "รอจัดห้อง",
    className: "border border-border/70 bg-muted/20 px-2 py-0.5 text-xs font-semibold text-muted-foreground rounded-md",
  };
}

function getAmenityList(amenities = {}) {
  const labelMap = [
    ["airConditioner", "แอร์"],
    ["fan", "พัดลม"],
    ["bed", "เตียง"],
    ["tv", "ทีวี"],
    ["fridge", "ตู้เย็น"],
    ["waterHeater", "เครื่องทำน้ำอุ่น"],
  ];

  return labelMap
    .filter(([key]) => Boolean(amenities[key]))
    .map(([, label]) => label);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export function PortalClient({ user, dashboardData }) {
  const router = useRouter();
  const [data, setData] = useState(dashboardData);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const currentDateValue = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const [invoiceId, setInvoiceId] = useState("INV-2026-030");
  const [amount, setAmount] = useState("5790");
  const [note, setNote] = useState("");
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState("");
  const [slipFileName, setSlipFileName] = useState("");
  const slipInputRef = useRef(null);

  const [month, setMonth] = useState("2026-04");
  const [roomId, setRoomId] = useState("A-214");
  const [waterPrevious, setWaterPrevious] = useState("1202");
  const [waterCurrent, setWaterCurrent] = useState("1218");
  const [electricPrevious, setElectricPrevious] = useState("5168");
  const [electricCurrent, setElectricCurrent] = useState("5280");
  const [adminName, setAdminName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRole, setAdminRole] = useState("student");
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStudents, setAdminStudents] = useState([]);
  const [adminRemovedStudents, setAdminRemovedStudents] = useState([]);
  const [adminRooms, setAdminRooms] = useState([]);
  const [adminUserRoleFilter, setAdminUserRoleFilter] = useState("all");
  const [adminRoomFloorFilter, setAdminRoomFloorFilter] = useState("all");
  const [adminRoomSearch, setAdminRoomSearch] = useState("");
  const [selectedAdminRoomId, setSelectedAdminRoomId] = useState("");
  const [selectedAdminStudentId, setSelectedAdminStudentId] = useState("");
  const [adminAssignStudentId, setAdminAssignStudentId] = useState("");
  const [adminAssignRoomId, setAdminAssignRoomId] = useState("");
  const [adminRestoreStudentId, setAdminRestoreStudentId] = useState("");
  const [selectedFinancePaymentId, setSelectedFinancePaymentId] = useState("");
  const [financeRejectReason, setFinanceRejectReason] = useState("");
  const [expandedSlipUrl, setExpandedSlipUrl] = useState("");
  const adminRoomBoardRef = useRef(null);

  // ─── DB Status ─────────────────────────────────────────────────
  const [dbStatus, setDbStatus] = useState(null);

  // ─── Maintenance ───────────────────────────────────────────────
  const [maintenance, setMaintenance] = useState([]);
  const [maintTitle, setMaintTitle] = useState("");
  const [maintDesc, setMaintDesc] = useState("");
  const [selectedMaintId, setSelectedMaintId] = useState("");

  // ─── Change Password ───────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // ─── Finance extra ─────────────────────────────────────────────
  const [overdueList, setOverdueList] = useState([]);
  const [exportMonth, setExportMonth] = useState("2026-03");

  // ─── Admin extra ───────────────────────────────────────────────
  const [rateWater, setRateWater] = useState("22");
  const [rateElectric, setRateElectric] = useState("8");
  const [adminAuditLogs, setAdminAuditLogs] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    details: [],
    onConfirm: null,
  });

  function askConfirm(title, description, onConfirm, details = []) {
    setConfirmDialog({ open: true, title, description, details, onConfirm });
  }

  function closeConfirmDialog() {
    setConfirmDialog((prev) => ({ ...prev, open: false, details: [], onConfirm: null }));
  }

  function showSuccess(messageText) {
    setMessage(messageText);
    setError("");
    toast.success(messageText);
  }

  function showError(messageText) {
    setError(messageText);
    setMessage("");
    toast.error(messageText);
  }

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const meta = roleMeta[user.role];
  const RoleIcon = meta.icon;
  const staffRoomOptions = useMemo(() => {
    if (user.role !== "staff") {
      return [];
    }

    const roomSet = new Set([roomId, "A-214", "A-101", "B-203", "C-305"]);
    rows.forEach((item) => {
      if (item?.roomId) {
        roomSet.add(item.roomId);
      }
    });

    return Array.from(roomSet).sort();
  }, [roomId, rows, user.role]);
  const currentStudentInvoice = useMemo(() => {
    if (user.role !== "student") {
      return null;
    }

    return (
      rows.find((item) => item.id === invoiceId) ??
      data?.highlights?.currentInvoice ??
      rows.find((item) => item.status !== "paid") ??
      rows[0] ??
      null
    );
  }, [data, invoiceId, rows, user.role]);
  const financeRows = useMemo(() => {
    if (user.role !== "finance") {
      return [];
    }

    return [...rows].sort((a, b) => {
      const statusScore = { pending: 0, rejected: 1, approved: 2 };
      const left = statusScore[a.status] ?? 99;
      const right = statusScore[b.status] ?? 99;
      if (left !== right) {
        return left - right;
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [rows, user.role]);
  const selectedFinancePayment = useMemo(() => {
    if (user.role !== "finance") {
      return null;
    }

    return (
      financeRows.find((item) => item.id === selectedFinancePaymentId) ??
      financeRows[0] ??
      null
    );
  }, [financeRows, selectedFinancePaymentId, user.role]);
  const assignableStudents = useMemo(
    () => adminStudents.filter((item) => !item.roomId),
    [adminStudents],
  );
  const assignableRooms = useMemo(
    () => adminRooms.filter((item) => item.status === "vacant"),
    [adminRooms],
  );
  const adminTableRows = useMemo(() => {
    if (user.role !== "admin") {
      return rows;
    }

    const sourceRows = adminUsers.length ? adminUsers : rows;

    if (adminUserRoleFilter === "all") {
      return sourceRows;
    }

    return sourceRows.filter((item) => item.role === adminUserRoleFilter);
  }, [adminUserRoleFilter, adminUsers, rows, user.role]);
  const adminRoomFloors = useMemo(
    () => Array.from(new Set(adminRooms.map((room) => room.floor))).sort((a, b) => a - b),
    [adminRooms],
  );
  const adminFilteredRooms = useMemo(() => {
    const floorFiltered = adminRoomFloorFilter === "all"
      ? adminRooms
      : adminRooms.filter((room) => String(room.floor) === adminRoomFloorFilter);

    const search = adminRoomSearch.trim().toLowerCase();
    if (!search) {
      return floorFiltered;
    }

    return floorFiltered.filter((room) => room.id.toLowerCase().includes(search));
  }, [adminRoomFloorFilter, adminRoomSearch, adminRooms]);
  const selectedRemovedStudent = useMemo(
    () => adminRemovedStudents.find((student) => student.id === adminRestoreStudentId) ?? null,
    [adminRemovedStudents, adminRestoreStudentId],
  );
  const selectedAdminStudent = useMemo(
    () => adminStudents.find((student) => student.id === selectedAdminStudentId) ?? null,
    [adminStudents, selectedAdminStudentId],
  );
  const selectedAdminStudentRoom = useMemo(
    () => adminRooms.find((room) => room.id === selectedAdminStudent?.roomId) ?? null,
    [adminRooms, selectedAdminStudent?.roomId],
  );
  const selectedAdminRoom = useMemo(
    () => adminRooms.find((room) => room.id === selectedAdminRoomId) ?? null,
    [adminRooms, selectedAdminRoomId],
  );
  const selectedAdminRoomStudent = useMemo(() => {
    if (!selectedAdminRoom?.occupant?.id) {
      return null;
    }

    return adminStudents.find((student) => student.id === selectedAdminRoom.occupant.id) ?? null;
  }, [adminStudents, selectedAdminRoom]);

  useEffect(() => {
    if (user.role !== "student") {
      return;
    }

    const nextInvoiceId = currentStudentInvoice?.id ?? currentStudentInvoice?.invoiceId;
    if (nextInvoiceId && nextInvoiceId !== invoiceId) {
      setInvoiceId(nextInvoiceId);
    }
  }, [currentStudentInvoice, invoiceId, user.role]);

  useEffect(() => {
    if (user.role !== "student") {
      return;
    }

    if (currentStudentInvoice?.amount != null) {
      setAmount(String(currentStudentInvoice.amount));
    }
  }, [currentStudentInvoice, user.role]);

  useEffect(() => {
    if (user.role !== "finance") {
      return;
    }

    if (!financeRows.length) {
      setSelectedFinancePaymentId("");
      return;
    }

    const hasSelected = financeRows.some((item) => item.id === selectedFinancePaymentId);
    if (!hasSelected) {
      setSelectedFinancePaymentId(financeRows[0].id);
    }
  }, [financeRows, selectedFinancePaymentId, user.role]);

  useEffect(() => {
    if (user.role !== "admin") {
      return;
    }

    const studentRows = adminUsers.filter((item) => item.role === "student");
    if (!studentRows.length) {
      setSelectedAdminStudentId("");
      return;
    }

    if (!studentRows.some((item) => item.id === selectedAdminStudentId)) {
      setSelectedAdminStudentId(studentRows[0].id);
    }
  }, [adminUsers, selectedAdminStudentId, user.role]);

  useEffect(() => {
    if (user.role !== "admin") {
      return;
    }

    if (!assignableStudents.length) {
      setAdminAssignStudentId("");
    } else if (!assignableStudents.some((item) => item.id === adminAssignStudentId)) {
      setAdminAssignStudentId(assignableStudents[0].id);
    }

    if (!assignableRooms.length) {
      setAdminAssignRoomId("");
    } else if (!assignableRooms.some((item) => item.id === adminAssignRoomId)) {
      setAdminAssignRoomId(assignableRooms[0].id);
    }
  }, [adminAssignRoomId, adminAssignStudentId, assignableRooms, assignableStudents, user.role]);

  useEffect(() => {
    if (user.role !== "admin") {
      return;
    }

    if (!adminRemovedStudents.length) {
      setAdminRestoreStudentId("");
      return;
    }

    if (!adminRemovedStudents.some((item) => item.id === adminRestoreStudentId)) {
      setAdminRestoreStudentId(adminRemovedStudents[0].id);
    }
  }, [adminRemovedStudents, adminRestoreStudentId, user.role]);

  useEffect(() => {
    if (user.role !== "admin") {
      return;
    }

    if (!adminFilteredRooms.length) {
      setSelectedAdminRoomId("");
      return;
    }

    if (!adminFilteredRooms.some((room) => room.id === selectedAdminRoomId)) {
      setSelectedAdminRoomId(adminFilteredRooms[0].id);
    }
  }, [adminFilteredRooms, selectedAdminRoomId, user.role]);

  // ─── DB Status check ───────────────────────────────────────────
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setDbStatus(d))
      .catch(() => setDbStatus({ status: "offline", latency: null }));
  }, []);

  // ─── Load maintenance list (student / staff / admin) ───────────
  useEffect(() => {
    if (!["student", "staff", "admin"].includes(user.role)) return;
    fetch("/api/maintenance")
      .then((r) => r.json())
      .then((d) => setMaintenance(d.maintenance ?? []))
      .catch(() => {});
  }, [user.role]);

  // ─── Load audit logs (admin) ───────────────────────────────────
  useEffect(() => {
    if (user.role !== "admin") return;
    fetch("/api/admin/audit-logs")
      .then((r) => r.json())
      .then((d) => setAdminAuditLogs(d.logs ?? []))
      .catch(() => {});
  }, [user.role]);

  // ─── Load room rates (admin) ────────────────────────────────────
  useEffect(() => {
    if (user.role !== "admin") return;
    fetch("/api/admin/rates")
      .then((r) => r.json())
      .then((d) => {
        if (d.rates) {
          setRateWater(String(d.rates.waterPerUnit));
          setRateElectric(String(d.rates.electricPerUnit));
        }
      })
      .catch(() => {});
  }, [user.role]);

  // ─── Load overdue list (finance + staff) ─────────────────────────
  useEffect(() => {
    if (!["finance", "staff"].includes(user.role)) return;
    fetch("/api/finance/overdue")
      .then((r) => r.json())
      .then((d) => setOverdueList(d.invoices ?? []))
      .catch(() => {});
  }, [user.role]);

  const roleKpis = useMemo(() => {
    if (user.role === "student") {
      return [
        {
          label: "My Room",
          value: data?.highlights?.roomId || "-",
          hint: "Assigned dorm room",
          icon: Building2,
        },
        {
          label: "Amount Due",
          value: formatMoney(data?.highlights?.outstanding || 0),
          hint: "Current unpaid balance",
          icon: Wallet,
        },
        {
          label: "Invoices",
          value: rows.length,
          hint: "All billing records",
          icon: FileSpreadsheet,
        },
      ];
    }

    if (user.role === "staff") {
      return [
        {
          label: "Readings Logged",
          value: rows.length,
          hint: "Meter records tracked",
          icon: Activity,
        },
        {
          label: "Active Rooms",
          value: data.summary.activeRooms,
          hint: "Occupied and monitored",
          icon: Building2,
        },
        {
          label: "Pending Slips",
          value: data.summary.pendingSlips,
          hint: "Need finance verification",
          icon: CreditCard,
        },
      ];
    }

    if (user.role === "finance") {
      const approvedCount = rows.filter((item) => item.status === "approved").length;
      const pendingCount = rows.filter((item) => item.status === "pending").length;

      return [
        {
          label: "Approved Slips",
          value: approvedCount,
          hint: "Confirmed and posted",
          icon: CreditCard,
        },
        {
          label: "Pending Slips",
          value: pendingCount,
          hint: "Waiting decision",
          icon: Activity,
        },
        {
          label: "Collected",
          value: formatMoney(data.summary.paidThisMonth),
          hint: "This period income",
          icon: Wallet,
        },
      ];
    }

    if (user.role === "manager") {
      return [
        {
          label: "Collection",
          value: `${Math.round((data.summary.paidThisMonth / (data.summary.paidThisMonth + data.summary.outstandingTotal || 1)) * 100)}%`,
          hint: "Current period ratio",
          icon: Activity,
        },
        {
          label: "Amount Due",
          value: formatMoney(data.summary.outstandingTotal),
          hint: "Unpaid liability",
          icon: Wallet,
        },
        {
          label: "Paid This Month",
          value: formatMoney(data.summary.paidThisMonth),
          hint: "Revenue tracked",
          icon: CreditCard,
        },
      ];
    }

    if (user.role === "admin") {
      const studentCount = rows.filter((item) => item.role === "student").length;
      const staffCount = rows.filter((item) => item.role === "staff").length;
      const financeCount = rows.filter((item) => item.role === "finance").length;

      return [
        {
          label: "Total Users",
          value: rows.length,
          hint: "All registered accounts",
          icon: Users,
        },
        {
          label: "Students",
          value: studentCount,
          hint: `Staff ${staffCount} | Finance ${financeCount}`,
          icon: Building2,
        },
        {
          label: "Available Rooms",
          value: adminRooms.filter((room) => room.status === "vacant").length,
          hint: `Occupied ${adminRooms.filter((room) => room.status === "occupied").length}`,
          icon: Shield,
        },
      ];
    }

    return [
      {
        label: "Managed Users",
        value: rows.length,
        hint: "Registered accounts",
        icon: Users,
      },
      {
        label: "Amount Due",
        value: formatMoney(data.summary.outstandingTotal),
        hint: "Platform-wide due",
        icon: Wallet,
      },
      {
        label: "Pending Slips",
        value: data.summary.pendingSlips,
        hint: "Operational queue",
        icon: Activity,
      },
    ];
  }, [adminRooms, data, rows, user.role]);

  const headerSummaryCards = useMemo(() => {
    if (user.role === "student") {
      const studentPayments = data?.payments ?? [];
      const paidThisMonth = studentPayments
        .filter((item) => item.status === "approved")
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      const pendingSlips = studentPayments.filter((item) => item.status === "pending").length;

      return [
        {
          label: "Amount Due",
          value: formatMoney(data?.highlights?.outstanding || 0),
        },
        {
          label: "Paid This Month",
          value: formatMoney(paidThisMonth),
        },
        {
          label: "Pending Slips",
          value: pendingSlips,
        },
        {
          label: "My Room",
          value: data?.highlights?.roomId || "-",
        },
      ];
    }

    return [
      {
        label: "Amount Due",
        value: formatMoney(data.summary.outstandingTotal),
      },
      {
        label: "Paid This Month",
        value: formatMoney(data.summary.paidThisMonth),
      },
      {
        label: "Pending Slips",
        value: data.summary.pendingSlips,
      },
      {
        label: "Active Rooms",
        value: `${data.summary.activeRooms}/${data.summary.totalRooms}`,
      },
    ];
  }, [data, user.role]);

  const tableMeta = useMemo(() => {
    if (user.role === "student") {
      return {
        title: "My Invoices",
        description: "Monthly bills with rent and utility breakdown.",
        columns: ["period", "roomId", "rent", "water", "electricity", "amount", "status"],
      };
    }

    if (user.role === "staff") {
      return {
        title: "Meter Operations",
        description: "Recorded utility usage by room and month.",
        columns: ["roomId", "month", "waterUsage", "electricUsage", "recordedAt"],
      };
    }

    if (user.role === "finance") {
      return {
        title: "Slip Verification Queue",
        description: "Payment transactions awaiting or completed verification.",
        columns: ["invoiceId", "studentName", "roomId", "amount", "status", "submittedAt", "slip"],
      };
    }

    if (user.role === "manager") {
      return {
        title: "Collection Trend",
        description: "Last periods collection and overdue status.",
        columns: ["month", "collectionRate", "paidRooms", "outstandingRooms"],
      };
    }

    if (user.role === "admin") {
      return {
        title: "Admin Dashboard",
        description: "Directory of user accounts with role-based filtering.",
        columns: ["id", "name", "username", "role", "roomId", "status", "actions"],
      };
    }

    return {
      title: "User Access Matrix",
      description: "Current users and role assignment in platform.",
      columns: ["id", "name", "username", "role"],
    };
  }, [user.role]);

  async function toDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read slip image"));
      reader.readAsDataURL(file);
    });
  }

  async function onSlipChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setSlipFile(null);
      setSlipPreview("");
      setSlipFileName("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file only.");
      event.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("Slip image must be less than 4 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSlipFile(file);
    setSlipFileName(file.name);
    const preview = await toDataUrl(file);
    setSlipPreview(preview);
  }

  function clearSlipSelection() {
    setSlipFile(null);
    setSlipFileName("");
    setSlipPreview("");
    setError("");

    if (slipInputRef.current) {
      slipInputRef.current.value = "";
    }
  }

  async function refreshDashboard() {
    const response = await fetch(`/api/dashboard?role=${user.role}`, { cache: "no-store" });
    const payload = await parseApiResponse(response);
    setData(payload.data);
  }

  async function refreshAdminManagementData() {
    if (user.role !== "admin") {
      return;
    }

    const [usersResponse, roomsResponse] = await Promise.all([
      fetch("/api/admin/users", { cache: "no-store" }),
      fetch("/api/admin/rooms", { cache: "no-store" }),
    ]);

    const usersPayload = await parseApiResponse(usersResponse);
    const roomsPayload = await parseApiResponse(roomsResponse);

    setAdminUsers(usersPayload.users ?? []);
    setAdminRemovedStudents(usersPayload.removedStudents ?? []);
    setAdminStudents(roomsPayload.students ?? []);
    setAdminRooms(roomsPayload.rooms ?? []);
  }

  async function runAction(action) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await action();
      await refreshDashboard();
      await refreshAdminManagementData();
    } catch (requestError) {
      showError(requestError.message || "Request failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refreshAdminManagementData().catch((requestError) => {
      showError(requestError.message || "Unable to load admin management data.");
    });
  }, [user.role]);

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function submitPayment() {
    await runAction(async () => {
      if (!currentStudentInvoice) {
        throw new Error("No invoice found for this account.");
      }

      if (!slipFile || !slipPreview) {
        throw new Error("Please upload a payment slip image before submitting.");
      }

      const uploadResponse = await fetch("/api/uploads/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataUrl: slipPreview,
          fileName: slipFileName,
        }),
      });
      const uploadPayload = await parseApiResponse(uploadResponse);

      const response = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: currentStudentInvoice.id ?? currentStudentInvoice.invoiceId,
          amount: Number(currentStudentInvoice.amount ?? amount),
          note,
          slipUrl: uploadPayload.slipUrl,
          slipFileName: uploadPayload.slipFileName ?? slipFileName,
        }),
      });
      await parseApiResponse(response);
      setSlipFile(null);
      setSlipPreview("");
      setSlipFileName("");
      setMessage("Payment slip submitted successfully.");
    });
  }

  async function saveReading() {
    await runAction(async () => {
      const response = await fetch("/api/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          month: currentDateValue,
          waterPrevious: Number(waterPrevious),
          waterCurrent: Number(waterCurrent),
          electricPrevious: Number(electricPrevious),
          electricCurrent: Number(electricCurrent),
        }),
      });
      await parseApiResponse(response);
      setMessage("Meter reading recorded.");
    });
  }

  async function generateInvoices() {
    await runAction(async () => {
      const response = await fetch("/api/invoices/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      const payload = await parseApiResponse(response);
      setMessage(`Generated ${payload.count} invoices for ${month}.`);
    });
  }

  async function approveFirstPending() {
    await runAction(async () => {
      const pendingResponse = await fetch("/api/payments/pending");
      const pendingPayload = await parseApiResponse(pendingResponse);
      const firstItem = pendingPayload.items[0];

      if (!firstItem) {
        setMessage("No pending slips found.");
        return;
      }

      const decisionResponse = await fetch(
        `/api/payments/${firstItem.id}/decision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        },
      );
      await parseApiResponse(decisionResponse);
      setMessage(`Approved payment ${firstItem.id}.`);
    });
  }

  async function decideFinanceSlip(status) {
    if (!selectedFinancePayment) {
      setError("Please select a slip from the list first.");
      return;
    }

    const rejectReason = financeRejectReason.trim();
    if (status === "rejected" && !rejectReason) {
      setError("Please provide a reason before rejecting this slip.");
      return;
    }

    const isApprove = status === "approved";
    askConfirm(
      isApprove ? "ยืนยันการอนุมัติ" : "ยืนยันการปฏิเสธ",
      isApprove
        ? `ยืนยันว่าคุณต้องการอนุมัติรายการชำระเงิน ${selectedFinancePayment.id}?`
        : `ยืนยันว่าคุณต้องการปฏิเสธรายการชำระเงิน ${selectedFinancePayment.id}?`,
      async () => {
        await runAction(async () => {
          const response = await fetch(
            `/api/payments/${selectedFinancePayment.id}/decision`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status,
                rejectReason: status === "rejected" ? rejectReason : "",
              }),
            },
          );
          await parseApiResponse(response);
          if (status === "approved") {
            setMessage(`Approved payment ${selectedFinancePayment.id}.`);
          } else {
            setMessage(`Rejected payment ${selectedFinancePayment.id}.`);
          }
          setFinanceRejectReason("");
        });
      },
    );
  }

  async function loadSummary() {
    await runAction(async () => {
      const response = await fetch("/api/reports/summary");
      const payload = await parseApiResponse(response);
      setMessage(
        `Income ${formatMoney(payload.report.totalIncome)} | Amount Due ${formatMoney(payload.report.totalOutstanding)}`,
      );
    });
  }

  async function createAdminUserAccount() {
    await runAction(async () => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminName,
          username: adminUsername,
          password: adminPassword,
          role: adminRole,
        }),
      });

      await parseApiResponse(response);
      showSuccess(`Created user ${adminUsername} (${adminRole}).`);
      setAdminName("");
      setAdminUsername("");
      setAdminPassword("");
      setAdminRole("student");
    });
  }

  async function assignStudentRoomByAdmin() {
    await runAction(async () => {
      if (!adminAssignStudentId || !adminAssignRoomId) {
        throw new Error("Please select both student and room.");
      }

      const response = await fetch("/api/admin/rooms/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: adminAssignStudentId,
          roomId: adminAssignRoomId,
        }),
      });

      const payload = await parseApiResponse(response);
      showSuccess(`Assigned ${payload.assignment.studentName} to room ${payload.assignment.roomId}.`);
    });
  }

  async function moveOutSelectedStudentByAdmin() {
    if (!selectedAdminStudent) {
      showError("Please select a student first.");
      return;
    }

    if (!selectedAdminStudent.roomId) {
      showError("This student is not currently assigned to any room.");
      return;
    }

    askConfirm(
      "ยืนยันการย้ายออก",
      `ยืนยันว่า ${selectedAdminStudent.name} ย้ายออกจากห้อง ${selectedAdminStudent.roomId}?`,
      async () => {
        await runAction(async () => {
          const response = await fetch("/api/admin/students/move-out", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: selectedAdminStudent.id }),
          });
          const payload = await parseApiResponse(response);
          showSuccess(
            `${payload.movedOut.studentName} moved out from room ${payload.movedOut.previousRoomId}.`,
          );
        });
      },
    );
  }

  async function deleteSelectedStudentByAdmin(studentOverride = null) {
    const student = studentOverride ?? selectedAdminStudent;

    if (!student) {
      showError("Please select a student first.");
      return;
    }

    if (student.roomId) {
      showError("Student must move out before deletion.");
      return;
    }

    if (!student.checkOutDate) {
      showError("Move-out date is required before deleting student.");
      return;
    }

    askConfirm(
      "ยืนยันการลบนักศึกษา",
      `ลบ ${student.name} ออกจากระบบ? การกระทำนี้ไม่สามารถยกเลิกได้`,
      async () => {
        await runAction(async () => {
          const response = await fetch("/api/admin/users", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: student.id }),
          });
          const payload = await parseApiResponse(response);
          showSuccess(`Deleted student ${payload.deleted.name}.`);
        });
      },
      [
        { label: "ID", value: student.id },
        { label: "Username", value: student.username },
        { label: "สถานะ", value: getAdminUserStatusMeta(student).label },
        { label: "ห้องล่าสุด", value: student.roomId ?? "-" },
        { label: "วันที่ย้ายออก", value: formatDate(student.checkOutDate) },
      ],
    );
  }

  async function submitMaintenanceRequest() {
    if (!maintTitle.trim()) {
      setError("กรุณากรอกหัวข้อแจ้งซ่อม");
      return;
    }
    await runAction(async () => {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: maintTitle, description: maintDesc }),
      });
      const d = await parseApiResponse(res);
      setMaintenance((prev) => [d.maintenance, ...prev]);
      setMaintTitle("");
      setMaintDesc("");
      setMessage("แจ้งซ่อมเรียบร้อยแล้ว");
    });
  }

  async function updateMaintStatus(id, status) {
    await runAction(async () => {
      const res = await fetch("/api/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const d = await parseApiResponse(res);
      setMaintenance((prev) => prev.map((item) => item.id === id ? { ...item, ...d.maintenance } : item));
      setMessage(`อัปเดตสถานะ ${id} → ${status}`);
    });
  }

  async function changePassword() {
    if (!currentPassword || !newPassword) {
      setError("กรุณากรอกรหัสผ่านให้ครบ");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    await runAction(async () => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      await parseApiResponse(res);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setMessage("เปลี่ยนรหัสผ่านสำเร็จ");
    });
  }

  async function markOverdue() {
    await runAction(async () => {
      const res = await fetch("/api/finance/overdue", { method: "POST" });
      const d = await parseApiResponse(res);
      const updated = await fetch("/api/finance/overdue").then((r) => r.json());
      setOverdueList(updated.invoices ?? []);
      setMessage(`ทำเครื่องหมาย overdue ${d.marked} รายการ`);
    });
  }

  function exportCsv() {
    const url = exportMonth
      ? `/api/finance/export?month=${exportMonth}`
      : "/api/finance/export";
    window.location.href = url;
  }

  async function saveRates() {
    if (!rateWater || !rateElectric) {
      showError("กรุณากรอกอัตราค่าน้ำและค่าไฟ");
      return;
    }
    await runAction(async () => {
      const res = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waterPerUnit: Number(rateWater),
          electricPerUnit: Number(rateElectric),
        }),
      });
      await parseApiResponse(res);
      const updated = await fetch("/api/admin/audit-logs", { cache: "no-store" }).then((r) => r.json());
      setAdminAuditLogs(updated.logs ?? []);
      showSuccess("บันทึกอัตราค่าน้ำ/ไฟเรียบร้อย");
    });
  }

  async function restoreRemovedStudentByAdmin(studentOverride = null) {
    const student = studentOverride ?? selectedRemovedStudent;

    if (!student) {
      showError("Please select a deleted student from archive.");
      return;
    }

    askConfirm(
      "ยืนยันการกู้คืนนักศึกษา",
      `กู้คืน ${student.name} กลับสู่ระบบผู้ใช้งาน?`,
      async () => {
        await runAction(async () => {
          const response = await fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: student.id }),
          });
          const payload = await parseApiResponse(response);
          showSuccess(`Restored student ${payload.restored.name}.`);
        });
      },
    );
  }

  function focusAdminStudentManagement(studentRow) {
    if (!studentRow || studentRow.role !== "student") {
      return;
    }

    setSelectedAdminStudentId(studentRow.id);
    setAdminRoomSearch("");

    const targetRoomId = studentRow.roomId && studentRow.roomId !== "-" ? studentRow.roomId : "";
    if (targetRoomId) {
      const targetRoom = adminRooms.find((room) => room.id === targetRoomId);
      if (targetRoom) {
        setAdminRoomFloorFilter(String(targetRoom.floor));
      } else {
        setAdminRoomFloorFilter("all");
      }
      setSelectedAdminRoomId(targetRoomId);
    } else {
      setAdminRoomFloorFilter("all");
      setSelectedAdminRoomId("");
      showError("นักศึกษาคนนี้ยังไม่ได้จัดห้อง");
    }

    setTimeout(() => {
      adminRoomBoardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="space-y-5">
      <Card
        className="border border-border/70 bg-card/90 border-t-4"
        style={{ borderTopColor: meta.color }}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <RoleIcon className="size-6" style={{ color: meta.color }} />
              <span style={{ color: meta.color }}>{meta.title}</span>
            </CardTitle>
            <CardDescription>
              Signed in as {user.name} ({user.username})
            </CardDescription>
            <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              style={{
                backgroundColor: meta.colorBg,
                color: meta.color,
                borderColor: meta.color + "55",
                fontWeight: 600,
              }}
            >
              Role: {user.role}
            </Badge>
            <ThemeToggle />
            <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium">
              <span
                className={`size-2 rounded-full ${
                  dbStatus?.status === "online" ? "bg-emerald-500 animate-pulse" : dbStatus ? "bg-red-500" : "bg-yellow-400"
                }`}
              />
              <span>Database</span>
              <span className="text-muted-foreground">
                {dbStatus ? (dbStatus.status === "online" ? `Online · ${dbStatus.latency} ms` : "Offline") : "Checking…"}
              </span>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {headerSummaryCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-border/80 bg-muted/25 p-3">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-lg font-semibold">{card.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {roleKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className="border border-border/70 bg-card/90"
              style={{ borderLeftColor: meta.color, borderLeftWidth: "3px" }}
            >
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-xl font-semibold" style={{ color: meta.color }}>{kpi.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{ backgroundColor: meta.colorBg }}
                  >
                    <Icon className="size-5" style={{ color: meta.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(message || error) && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${error ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-emerald-300/40 bg-emerald-500/10 text-emerald-700"}`}
        >
          {error || message}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.8fr_1fr]">
        <Card className="border border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>{tableMeta.title}</CardTitle>
            <CardDescription>{tableMeta.description}</CardDescription>
            {user.role === "admin" ? (
              <div className="mt-2 max-w-xs space-y-1.5">
                <Label htmlFor="adminRoleFilter">กรองตาม Role</Label>
                <Select value={adminUserRoleFilter} onValueChange={setAdminUserRoleFilter}>
                  <SelectTrigger id="adminRoleFilter" className="w-full">
                    <SelectValue placeholder="เลือก role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="student">student</SelectItem>
                    <SelectItem value="staff">staff</SelectItem>
                    <SelectItem value="finance">finance</SelectItem>
                    <SelectItem value="manager">manager</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {tableMeta.columns.map((key) => <TableHead key={key}>{key}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(user.role === "admin" ? adminTableRows : rows).length ? (
                  (user.role === "admin" ? adminTableRows : rows).map((row) => (
                    <TableRow
                      key={row.id || JSON.stringify(row)}
                      className={
                        user.role === "admin" && row.id === selectedAdminStudentId
                          ? "bg-muted/25"
                          : ""
                      }
                    >
                      {tableMeta.columns.map((key) => (
                        <TableCell key={`${row.id}-${key}`}>
                          {key === "actions" && user.role === "admin"
                            ? (
                              <div className="flex flex-wrap items-center gap-2">
                                {row.role === "student" ? (
                                  <>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="cursor-pointer"
                                      onClick={() => focusAdminStudentManagement(row)}
                                    >
                                      จัดการ
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="cursor-pointer"
                                      disabled={busy || Boolean(row.roomId) || !row.checkOutDate}
                                      onClick={() => {
                                        setSelectedAdminStudentId(row.id);
                                        setSelectedAdminRoomId(row.roomId ?? "");
                                        deleteSelectedStudentByAdmin(row);
                                      }}
                                    >
                                      ลบผู้ใช้
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </div>
                            )
                            : [
                            "amount",
                            "rent",
                            "water",
                            "electricity",
                          ].includes(key)
                            ? formatMoney(row[key])
                            : user.role === "admin" && key === "status"
                              ? (
                                <span className={getAdminUserStatusMeta(row).className}>
                                  {getAdminUserStatusMeta(row).label}
                                </span>
                              )
                            : key === "status"
                              ? (
                                <span className={getStatusMeta(row[key]).className}>
                                  {getStatusMeta(row[key]).label}
                                </span>
                              )
                            : user.role === "admin" && key === "name" && row.role === "student"
                              ? (
                                <button
                                  type="button"
                                  onClick={() => focusAdminStudentManagement(row)}
                                  className="cursor-pointer font-medium text-primary underline-offset-2 hover:underline"
                                >
                                  {row[key]}
                                </button>
                              )
                            : key === "slip" && row[key]
                              ? (
                                <a
                                  href={row[key]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary underline"
                                >
                                  {row.slipFileName ?? "View slip"}
                                </a>
                              )
                              : String(row[key] ?? "-")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={tableMeta.columns.length}>No records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {user.role === "admin" ? (
              <div ref={adminRoomBoardRef} className="mt-5 space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                <p className="text-sm font-semibold" style={{ color: meta.color }}>
                  Room Status Board
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span className="size-2.5 rounded-full bg-emerald-500" />
                    ว่าง
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="size-2.5 rounded-full bg-red-500" />
                    ไม่ว่าง
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={adminRoomFloorFilter === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setAdminRoomFloorFilter("all")}
                  >
                    ห้องทั้งหมด
                  </Button>
                  {adminRoomFloors.map((floor) => (
                    <Button
                      key={floor}
                      type="button"
                      variant={adminRoomFloorFilter === String(floor) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setAdminRoomFloorFilter(String(floor))}
                    >
                      ชั้น {floor}
                    </Button>
                  ))}
                </div>

                <div className="max-w-xs space-y-1.5">
                  <Label htmlFor="adminRoomSearch">ค้นหาห้อง</Label>
                  <Input
                    id="adminRoomSearch"
                    value={adminRoomSearch}
                    onChange={(event) => setAdminRoomSearch(event.target.value)}
                    placeholder="เช่น A-214"
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {adminFilteredRooms.map((room) => {
                    const roomStatus = getRoomStatusMeta(room.status);
                    const isSelected = room.id === selectedAdminRoomId;

                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setSelectedAdminRoomId(room.id);
                          setSelectedAdminStudentId(room.occupant?.id ?? "");
                        }}
                        className="rounded-md border-2 bg-background/80 p-2 text-left text-sm cursor-pointer"
                        style={{
                          borderColor: room.status === "vacant" ? "#22c55e" : "#ef4444",
                          boxShadow: isSelected ? `0 0 0 2px ${meta.color}55` : undefined,
                        }}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="font-semibold">ห้อง {room.id} (ชั้น {room.floor})</p>
                          <span className={roomStatus.className}>{roomStatus.label}</span>
                        </div>
                        <p>ราคาห้อง: <span className="font-semibold">{formatMoney(room.monthlyPrice)}</span></p>
                        <p>
                          ผู้พักปัจจุบัน: {" "}
                          <span className="font-semibold">
                            {room.occupant ? `${room.occupant.name} (${room.occupant.username})` : "-"}
                          </span>
                        </p>
                      </button>
                    );
                  })}
                  {!adminFilteredRooms.length ? (
                    <div className="rounded-md border border-border/70 bg-background/80 p-2 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                      ไม่พบห้องในชั้นที่เลือก
                    </div>
                  ) : null}
                </div>

                {selectedAdminRoom ? (
                  <div className="rounded-md border border-border/70 bg-background/80 p-3 text-sm">
                    <p className="font-semibold">
                      รายละเอียดห้อง {selectedAdminRoom.id} (ชั้น {selectedAdminRoom.floor})
                    </p>
                    <p className="mt-1">
                      สถานะห้อง: <span className={getRoomStatusMeta(selectedAdminRoom.status).className}>{getRoomStatusMeta(selectedAdminRoom.status).label}</span>
                    </p>
                    <p className="mt-1">ราคาห้อง: <span className="font-semibold">{formatMoney(selectedAdminRoom.monthlyPrice)}</span></p>
                    <p className="mt-1">
                      อุปกรณ์ในห้อง: <span className="font-semibold">{getAmenityList(selectedAdminRoom.amenities).join(", ") || "-"}</span>
                    </p>

                    <div className="mt-2 rounded-md border border-border/70 bg-muted/20 p-2">
                      <p className="font-semibold">Student Status (ห้องนี้)</p>
                      {selectedAdminRoomStudent ? (
                        <div className="mt-1 space-y-1.5">
                          <p>ชื่อ: <span className="font-semibold">{selectedAdminRoomStudent.name}</span></p>
                          <p>Username: <span className="font-semibold">{selectedAdminRoomStudent.username}</span></p>
                          <p>วันที่เริ่มเข้าอยู่: <span className="font-semibold">{formatDate(selectedAdminRoomStudent.checkInDate)}</span></p>
                          <p>วันที่ออก: <span className="font-semibold">{formatDate(selectedAdminRoomStudent.checkOutDate)}</span></p>
                          <div className="space-y-1">
                            <p className="font-semibold">ประวัติการเข้าพัก</p>
                            {(selectedAdminRoomStudent.housingHistory ?? []).length ? (
                              <div className="max-h-28 space-y-1 overflow-auto rounded-md border border-border/70 bg-background/70 p-2">
                                {[...(selectedAdminRoomStudent.housingHistory ?? [])]
                                  .slice()
                                  .reverse()
                                  .map((history, index) => (
                                    <p key={`${history.roomId}-${history.checkInDate}-${index}`} className="text-xs">
                                      ห้อง {history.roomId} | เข้า {formatDate(history.checkInDate)} | ออก {formatDate(history.checkOutDate)}
                                    </p>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">ยังไม่มีประวัติการเข้าพัก</p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <Button
                              type="button"
                              variant="secondary"
                              className="cursor-pointer"
                              disabled={busy || !selectedAdminRoomStudent.roomId}
                              onClick={moveOutSelectedStudentByAdmin}
                            >
                              บันทึกย้ายออก
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              className="cursor-pointer"
                              disabled={busy || Boolean(selectedAdminRoomStudent.roomId) || !selectedAdminRoomStudent.checkOutDate}
                              onClick={deleteSelectedStudentByAdmin}
                            >
                              ลบนักศึกษา
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-muted-foreground">ห้องนี้ยังไม่มีนักศึกษาเข้าพัก</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card
          className="border border-border/70 bg-card/90"
          style={{ borderTopColor: meta.color, borderTopWidth: "3px" }}
        >
          <CardHeader>
            <CardTitle style={{ color: meta.color }}>Role Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.role === "student" && (
              <>
                <div
                  className="rounded-lg border p-3"
                  style={{ borderColor: meta.color + "55", backgroundColor: meta.colorBg }}
                >
                  <p className="text-sm font-semibold" style={{ color: meta.color }}>
                    Current Bill Summary
                  </p>
                  <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    <p>
                      Room: <span className="font-semibold">{currentStudentInvoice?.roomId ?? data?.highlights?.roomId ?? "-"}</span>
                    </p>
                    <p>
                      Invoice: <span className="font-semibold">{currentStudentInvoice?.id ?? currentStudentInvoice?.invoiceId ?? "-"}</span>
                    </p>
                    <p>
                      Rent: <span className="font-semibold">{formatMoney(currentStudentInvoice?.rent)}</span>
                    </p>
                    <p>
                      Water: <span className="font-semibold">{formatMoney(currentStudentInvoice?.water)}</span>
                    </p>
                    <p>
                      Electricity: <span className="font-semibold">{formatMoney(currentStudentInvoice?.electricity)}</span>
                    </p>
                    <p>
                      Total: <span className="font-semibold">{formatMoney(currentStudentInvoice?.amount)}</span>
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoiceId">Invoice ID</Label>
                  <Input id="invoiceId" value={invoiceId} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" value={amount} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Transfer via mobile banking"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slipImage">Upload Slip Image</Label>
                  <Input
                    id="slipImage"
                    type="file"
                    accept="image/*"
                    onChange={onSlipChange}
                    className="sr-only"
                    ref={slipInputRef}
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="slipImage"
                      className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
                    >
                      <Upload className="size-4" />
                      Choose File
                    </label>
                    <div className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                      <span className="block truncate">{slipFileName || "No file selected"}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={clearSlipSelection}
                      disabled={!slipFileName}
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Accepted: PNG, JPG, WEBP, GIF (max 4 MB)</p>
                </div>
                {slipPreview ? (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Slip Preview</p>
                    <img
                      src={slipPreview}
                      alt="Payment slip preview"
                      className="max-h-56 w-full rounded-md border border-border object-contain bg-background"
                    />
                  </div>
                ) : null}
                <Button
                  className="w-full cursor-pointer text-white"
                  style={{ backgroundColor: meta.color }}
                  disabled={busy}
                  onClick={submitPayment}
                >
                  Submit Payment Slip
                </Button>

                {/* ── แจ้งซ่อม ──────────────────────────────────────────────── */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                    <Wrench className="size-4" />แจ้งซ่อมห้องพัก
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="maintTitle">หัวข้อปัญหา</Label>
                    <input
                      id="maintTitle"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={maintTitle}
                      onChange={(e) => setMaintTitle(e.target.value)}
                      placeholder="เช่น แอร์ไม่เย็น"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maintDesc">รายละเอียดเพิ่มเติม</Label>
                    <textarea
                      id="maintDesc"
                      rows={2}
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={maintDesc}
                      onChange={(e) => setMaintDesc(e.target.value)}
                      placeholder="อธิบายปัญหาและสถานที่"
                    />
                  </div>
                  <Button className="w-full cursor-pointer text-white" style={{ backgroundColor: meta.color }} disabled={busy} onClick={submitMaintenanceRequest}>
                    ส่งคำขอแจ้งซ่อม
                  </Button>
                  {maintenance.length ? (
                    <div className="mt-1 max-h-40 space-y-1 overflow-auto">
                      {maintenance.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-md border border-border/70 bg-background/70 px-2 py-1.5 text-xs">
                          <span className="font-medium truncate max-w-[55%]">{item.title}</span>
                          <span className={{"open":"text-amber-600","in_progress":"text-blue-600","resolved":"text-emerald-600","closed":"text-muted-foreground"}[item.status] ?? ""}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* ── เปลี่ยนรหัสผ่าน ──────────────────────────────────────── */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                    <Settings className="size-4" />เปลี่ยนรหัสผ่าน
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="curPw">รหัสผ่านปัจจุบัน</Label>
                    <Input id="curPw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPw">รหัสผ่านใหม่</Label>
                    <Input id="newPw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confPw">ยืนยันรหัสผ่านใหม่</Label>
                    <Input id="confPw" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                  </div>
                  <Button className="w-full cursor-pointer" variant="secondary" disabled={busy} onClick={changePassword}>
                    บันทึกรหัสผ่านใหม่
                  </Button>
                </div>
              </>
            )}

            {user.role === "staff" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="roomId">เลือกห้อง</Label>
                  <Select value={roomId} onValueChange={setRoomId}>
                    <SelectTrigger id="roomId" className="w-full">
                      <SelectValue placeholder="เลือกห้อง" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffRoomOptions.map((optionRoomId) => (
                        <SelectItem key={optionRoomId} value={optionRoomId}>
                          {optionRoomId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="month">วันที่บันทึก (YYYY-MM-DD)</Label>
                  <Input id="month" value={currentDateValue} readOnly />
                </div>
                <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  ไฟ หน่วยละ 5 บาท | น้ำ หน่วยละ 25 บาท
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="electricPrevious">หน่วยไฟเดือนที่แล้ว</Label>
                    <Input
                      id="electricPrevious"
                      type="number"
                      value={electricPrevious}
                      onChange={(event) => setElectricPrevious(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="electricCurrent">หน่วยไฟเดือนนี้</Label>
                    <Input
                      id="electricCurrent"
                      type="number"
                      value={electricCurrent}
                      onChange={(event) => setElectricCurrent(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="waterPrevious">หน่วยน้ำเดือนที่แล้ว</Label>
                    <Input
                      id="waterPrevious"
                      type="number"
                      value={waterPrevious}
                      onChange={(event) => setWaterPrevious(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="waterCurrent">หน่วยน้ำเดือนนี้</Label>
                    <Input
                      id="waterCurrent"
                      type="number"
                      value={waterCurrent}
                      onChange={(event) => setWaterCurrent(event.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full cursor-pointer text-white"
                  style={{ backgroundColor: meta.color }}
                  disabled={busy}
                  onClick={saveReading}
                >
                  Save Meter Reading
                </Button>

                {/* ── คิวงานซ่อม ──────────────────────────────────────────── */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                    <ClipboardList className="size-4" />คิวงานซ่อม
                  </p>
                  {maintenance.length ? (
                    <div className="max-h-48 space-y-1.5 overflow-auto">
                      {maintenance.map((item) => (
                        <div key={item.id} className="rounded-md border border-border/70 bg-background/80 p-2 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{item.title}</span>
                            <span className={{"open":"text-amber-600 font-medium","in_progress":"text-blue-600 font-medium","resolved":"text-emerald-600 font-medium","closed":"text-muted-foreground"}[item.status] ?? ""}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-muted-foreground">ห้อง {item.roomId}</p>
                          {item.status === "open" ? (
                            <Button type="button" variant="outline" className="cursor-pointer h-6 text-xs px-2" disabled={busy} onClick={() => updateMaintStatus(item.id, "in_progress")}>
                              รับงาน
                            </Button>
                          ) : item.status === "in_progress" ? (
                            <Button type="button" className="cursor-pointer h-6 text-xs px-2 text-white" style={{ backgroundColor: meta.color }} disabled={busy} onClick={() => updateMaintStatus(item.id, "resolved")}>
                              เสร็จแล้ว
                            </Button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">ยังไม่มีคำร้องซ่อม</p>
                  )}
                </div>

                {/* ── รายการค้างชำระ (staff view) ─────────────────────────── */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                    <AlertTriangle className="size-4" />รายการ Pending/Overdue
                  </p>
                  {overdueList.length ? (
                    <div className="max-h-36 space-y-1 overflow-auto">
                      {overdueList.slice(0, 10).map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded border border-border/70 bg-background/80 px-2 py-1 text-xs">
                          <span>{item.studentName ?? item.studentId}</span>
                          <span className="font-semibold">{item.month}</span>
                          <span className={getStatusMeta(item.status).className}>{getStatusMeta(item.status).label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">ไม่มีรายการค้างชำระ</p>
                  )}
                </div>
              </>
            )}

            {user.role === "finance" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="financeSlipList">เลือกสลิปจากลิสต์</Label>
                  <Select
                    value={selectedFinancePayment?.id ?? ""}
                    onValueChange={setSelectedFinancePaymentId}
                  >
                    <SelectTrigger id="financeSlipList" className="w-full">
                      <SelectValue placeholder="เลือกสลิปที่ต้องการตรวจ" />
                    </SelectTrigger>
                    <SelectContent>
                      {financeRows.length ? (
                        financeRows.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.invoiceId} | {item.studentName} | {item.status}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No slips found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFinancePayment ? (
                  <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                    <p className="text-sm font-semibold" style={{ color: meta.color }}>
                      Slip Review Card
                    </p>

                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <p>นักศึกษา: <span className="font-semibold">{selectedFinancePayment.studentName}</span></p>
                      <p>ห้อง: <span className="font-semibold">{selectedFinancePayment.roomId}</span></p>
                      <p>ค่าห้อง: <span className="font-semibold">{formatMoney(selectedFinancePayment.rent)}</span></p>
                      <p>ค่าน้ำ: <span className="font-semibold">{formatMoney(selectedFinancePayment.water)}</span></p>
                      <p>ค่าไฟ: <span className="font-semibold">{formatMoney(selectedFinancePayment.electricity)}</span></p>
                      <p>ยอดรวม: <span className="font-semibold">{formatMoney(selectedFinancePayment.amount)}</span></p>
                      <p>
                        สถานะ: {" "}
                        <span className={getStatusMeta(selectedFinancePayment.status).className}>
                          {getStatusMeta(selectedFinancePayment.status).label}
                        </span>
                      </p>
                      <p>ส่งเมื่อ: <span className="font-semibold">{new Date(selectedFinancePayment.submittedAt).toLocaleString("th-TH")}</span></p>
                    </div>

                    {selectedFinancePayment.note ? (
                      <div className="rounded-md border border-border/70 bg-background/60 p-2 text-sm">
                        หมายเหตุจากนักศึกษา: {selectedFinancePayment.note}
                      </div>
                    ) : null}

                    {selectedFinancePayment.rejectReason ? (
                      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
                        เหตุผลที่ไม่ผ่านล่าสุด: {selectedFinancePayment.rejectReason}
                      </div>
                    ) : null}

                    {selectedFinancePayment.slip ? (
                      <div className="space-y-2">
                        <img
                          src={selectedFinancePayment.slip}
                          alt={`Slip ${selectedFinancePayment.invoiceId}`}
                          className="max-h-56 w-full cursor-zoom-in rounded-md border border-border object-contain bg-background"
                          onClick={() => setExpandedSlipUrl(selectedFinancePayment.slip)}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setExpandedSlipUrl(selectedFinancePayment.slip)}
                          >
                            ขยายภาพสลิป
                          </Button>
                          <a
                            href={selectedFinancePayment.slip}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
                          >
                            เปิดในแท็บใหม่
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">ไม่มีไฟล์สลิปในรายการนี้</p>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="financeRejectReason">เหตุผลที่ไม่ผ่านอนุมัติ (บังคับเมื่อกดไม่ผ่าน)</Label>
                      <Textarea
                        id="financeRejectReason"
                        value={financeRejectReason}
                        onChange={(event) => setFinanceRejectReason(event.target.value)}
                        placeholder="เช่น สลิปไม่ชัดเจน ยอดเงินไม่ตรงกับใบแจ้งหนี้"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="cursor-pointer text-white"
                        style={{ backgroundColor: meta.color }}
                        disabled={busy || selectedFinancePayment.status === "approved"}
                        onClick={() => decideFinanceSlip("approved")}
                      >
                        อนุมัติ
                      </Button>
                      <Button
                        className="cursor-pointer"
                        variant="destructive"
                        disabled={busy || selectedFinancePayment.status === "rejected"}
                        onClick={() => decideFinanceSlip("rejected")}
                      >
                        ไม่ผ่านอนุมัติ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                    ยังไม่มีสลิปให้นำมาตรวจ
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="monthFinance">Invoice Month (YYYY-MM)</Label>
                  <Input id="monthFinance" value={month} onChange={(event) => setMonth(event.target.value)} />
                </div>
                <Button
                  className="w-full cursor-pointer text-white"
                  style={{ backgroundColor: meta.color }}
                  disabled={busy}
                  onClick={generateInvoices}
                >
                  Generate Monthly Invoices
                </Button>

                {/* ── Export CSV ─────────────────────────────────────────── */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                    <Download className="size-4" />Export รายงาน CSV
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="exportMonth">เดือน (YYYY-MM) — ว่างเพื่อ Export ทั้งหมด</Label>
                    <Input id="exportMonth" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} placeholder="2026-03" />
                  </div>
                  <Button className="w-full cursor-pointer" variant="outline" onClick={exportCsv}>
                    <Download className="size-4 mr-1.5" />ดาวน์โหลด CSV
                  </Button>
                </div>

                {/* ── Mark Overdue ───────────────────────────────────────── */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                    <AlertTriangle className="size-4" />รายการ Pending/Overdue ({overdueList.length})
                  </p>
                  {overdueList.length ? (
                    <div className="max-h-36 space-y-1 overflow-auto">
                      {overdueList.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded border border-border/70 bg-background/80 px-2 py-1 text-xs">
                          <span className="font-medium">{item.studentName ?? item.studentId}</span>
                          <span>{item.month}</span>
                          <span className={getStatusMeta(item.status).className}>{getStatusMeta(item.status).label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <Button className="w-full cursor-pointer" variant="secondary" disabled={busy} onClick={markOverdue}>
                    ทำเครื่องหมาย Overdue
                  </Button>
                </div>
              </>
            )}

            {user.role === "admin" && (
              <>
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold" style={{ color: meta.color }}>
                    เพิ่มผู้ใช้งานใหม่
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="adminName">ชื่อผู้ใช้</Label>
                    <Input
                      id="adminName"
                      value={adminName}
                      onChange={(event) => setAdminName(event.target.value)}
                      placeholder="เช่น Somchai Srisuk"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="adminUsername">Username</Label>
                    <Input
                      id="adminUsername"
                      value={adminUsername}
                      onChange={(event) => setAdminUsername(event.target.value)}
                      placeholder="เช่น student02"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(event) => setAdminPassword(event.target.value)}
                      placeholder="กำหนดรหัสผ่าน"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="adminRole">Role</Label>
                    <Select value={adminRole} onValueChange={setAdminRole}>
                      <SelectTrigger id="adminRole" className="w-full">
                        <SelectValue placeholder="เลือก role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">student</SelectItem>
                        <SelectItem value="staff">staff</SelectItem>
                        <SelectItem value="finance">finance</SelectItem>
                        <SelectItem value="manager">manager</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full cursor-pointer text-white"
                    style={{ backgroundColor: meta.color }}
                    disabled={busy}
                    onClick={createAdminUserAccount}
                  >
                    เพิ่มผู้ใช้
                  </Button>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold" style={{ color: meta.color }}>
                    จัดนักศึกษาเข้าห้องพัก
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="assignStudent">เลือกนักศึกษา</Label>
                    <Select value={adminAssignStudentId || "none"} onValueChange={setAdminAssignStudentId}>
                      <SelectTrigger id="assignStudent" className="w-full">
                        <SelectValue placeholder="เลือกนักศึกษาที่จะจัดเข้าห้อง" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableStudents.length ? (
                          assignableStudents.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} ({student.username})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            ไม่มีนักศึกษาว่างสำหรับจัดห้อง
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="assignRoom">เลือกห้อง</Label>
                    <Select value={adminAssignRoomId || "none"} onValueChange={setAdminAssignRoomId}>
                      <SelectTrigger id="assignRoom" className="w-full">
                        <SelectValue placeholder="เลือกห้องว่าง" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRooms.length ? (
                          assignableRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.id} | ชั้น {room.floor} | {formatMoney(room.monthlyPrice)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            ไม่มีห้องว่าง
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full cursor-pointer"
                    variant="secondary"
                    disabled={busy || !assignableStudents.length || !assignableRooms.length}
                    onClick={assignStudentRoomByAdmin}
                  >
                    ยืนยันจัดเข้าห้อง
                  </Button>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-sm font-semibold" style={{ color: meta.color }}>
                    ผู้ใช้ทั้งหมดในระบบ: {adminUsers.length}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    นักศึกษาที่ถูกลบ (Archive): {adminRemovedStudents.length}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    แนะนำ: กด &quot;ลบผู้ใช้&quot; จากตารางด้านซ้ายได้เลย หลังนักศึกษาย้ายออกและมีวันที่ย้ายออกแล้ว
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold" style={{ color: meta.color }}>
                    Restore นักศึกษาที่ถูกลบ
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="restoreStudent">เลือกจาก Archive</Label>
                    <Select value={adminRestoreStudentId || "none"} onValueChange={setAdminRestoreStudentId}>
                      <SelectTrigger id="restoreStudent" className="w-full">
                        <SelectValue placeholder="เลือกนักศึกษาที่ต้องการกู้คืน" />
                      </SelectTrigger>
                      <SelectContent>
                        {adminRemovedStudents.length ? (
                          adminRemovedStudents.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} ({student.username})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            ไม่มีข้อมูลใน archive
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedRemovedStudent ? (
                    <p className="text-xs text-muted-foreground">
                      ลบเมื่อ: {new Date(selectedRemovedStudent.deletedAt).toLocaleString("th-TH")}
                    </p>
                  ) : null}
                  <Button
                    className="w-full cursor-pointer"
                    variant="outline"
                    disabled={busy || !selectedRemovedStudent}
                    onClick={restoreRemovedStudentByAdmin}
                  >
                    Restore นักศึกษา
                  </Button>
                  {adminRemovedStudents.length ? (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-muted-foreground">รายการในคลังผู้ใช้</p>
                      <div className="max-h-60 overflow-auto rounded-md border border-border/70 bg-background/70">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>id</TableHead>
                              <TableHead>name</TableHead>
                              <TableHead>username</TableHead>
                              <TableHead>status</TableHead>
                              <TableHead>deletedAt</TableHead>
                              <TableHead>actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adminRemovedStudents.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell>{student.id}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.username}</TableCell>
                                <TableCell>
                                  <span className={getAdminUserStatusMeta(student).className}>
                                    {getAdminUserStatusMeta(student).label}
                                  </span>
                                </TableCell>
                                <TableCell>{formatDate(student.deletedAt)}</TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    disabled={busy}
                                    onClick={() => {
                                      setAdminRestoreStudentId(student.id);
                                      restoreRemovedStudentByAdmin(student);
                                    }}
                                  >
                                    กู้คืน
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* ── ตั้งค่าอัตราค่าน้ำ/ไฟ ────────────────────────────── */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                    <Settings className="size-4" />ตั้งค่าอัตราค่าน้ำ/ไฟ
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="rateWater">ค่าน้ำ (บาท/หน่วย)</Label>
                      <Input id="rateWater" type="number" value={rateWater} onChange={(e) => setRateWater(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rateElectric">ค่าไฟ (บาท/หน่วย)</Label>
                      <Input id="rateElectric" type="number" value={rateElectric} onChange={(e) => setRateElectric(e.target.value)} />
                    </div>
                  </div>
                  <Button className="w-full cursor-pointer text-white" style={{ backgroundColor: meta.color }} disabled={busy} onClick={saveRates}>
                    บันทึกอัตราใหม่
                  </Button>
                </div>

                {/* ── Audit Log ─────────────────────────────────────────── */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                    <ClipboardList className="size-4" />Audit Log
                  </p>
                  {adminAuditLogs.length ? (
                    <div className="max-h-52 space-y-1 overflow-auto">
                      {adminAuditLogs.map((log) => (
                        <div key={log.id} className="rounded border border-border/70 bg-background/80 px-2 py-1.5 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold" style={{ color: meta.color }}>{log.action}</span>
                            <span className="text-muted-foreground">{new Date(log.createdAt).toLocaleDateString("th-TH")}</span>
                          </div>
                          <p className="text-muted-foreground truncate">{log.actorName ?? log.actorId} → {log.detail}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">ยังไม่มีบันทึก</p>
                  )}
                </div>
              </>
            )}

            {user.role === "manager" && (
              <>
                {/* ── Occupancy Rate ────────────────────────────────────── */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                    <Building2 className="size-4" />อัตราการเข้าพัก (Occupancy Rate)
                  </p>
                  {(() => {
                    const active = data.summary.activeRooms ?? 0;
                    const total  = data.summary.totalRooms ?? 1;
                    const pct    = total > 0 ? Math.round((active / total) * 100) : 0;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>ห้องที่มีผู้เช่า <span className="font-semibold">{active}</span></span>
                          <span>ทั้งหมด <span className="font-semibold">{total}</span></span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted/50">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                        </div>
                        <p className="text-right text-sm font-semibold" style={{ color: meta.color }}>{pct}%</p>
                      </div>
                    );
                  })()}
                </div>

                {/* ── Monthly Trend ─────────────────────────────────────── */}
                {rows.length ? (
                  <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: meta.color }}>
                      <BarChart3 className="size-4" />แนวโน้มรายเดือน (Collection Rate)
                    </p>
                    <div className="space-y-2">
                      {rows.map((r) => {
                        const rate = parseFloat(r.collectionRate ?? "0");
                        return (
                          <div key={r.id ?? r.month} className="space-y-0.5">
                            <div className="flex justify-between text-xs">
                              <span>เดือน {r.month}</span>
                              <span className="font-semibold">{r.collectionRate}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                              <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: meta.color + "bb" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <Button
                  className="w-full cursor-pointer text-white"
                  style={{ backgroundColor: meta.color }}
                  disabled={busy}
                  onClick={loadSummary}
                >
                  Load Financial Summary
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {expandedSlipUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl rounded-lg bg-background p-3">
            <div className="mb-2 flex justify-end">
              <Button variant="outline" className="cursor-pointer" onClick={() => setExpandedSlipUrl("")}>
                ปิด
              </Button>
            </div>
            <img
              src={expandedSlipUrl}
              alt="Expanded payment slip"
              className="max-h-[80vh] w-full rounded-md object-contain"
            />
          </div>
        </div>
      ) : null}

      {/* ── Confirm Dialog ─────────────────────────────────────── */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => { if (!open) closeConfirmDialog(); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          {confirmDialog.details?.length ? (
            <div className="rounded-md border border-border/70 bg-muted/20 p-3 text-sm">
              <div className="space-y-2">
                {confirmDialog.details.map((detail) => (
                  <div key={detail.label} className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">{detail.label}</span>
                    <span className="text-right font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={closeConfirmDialog}
            >
              ยกเลิก
            </Button>
            <Button
              className="cursor-pointer"
              style={{ backgroundColor: meta.color }}
              onClick={async () => {
                closeConfirmDialog();
                if (confirmDialog.onConfirm) await confirmDialog.onConfirm();
              }}
            >
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
