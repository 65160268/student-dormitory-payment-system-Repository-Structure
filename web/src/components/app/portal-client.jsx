"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Building2, CreditCard, FileSpreadsheet, Shield, Users, Wallet } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { roleLabels } from "@/lib/role-config";

const roleMeta = {
  student: {
    title: "Student Dashboard",
    description: "Track outstanding bills, submit payment slips, and review payment history.",
    icon: Wallet,
  },
  staff: {
    title: "Staff Operations Dashboard",
    description: "Monitor meter activity and keep room utility records up to date.",
    icon: Building2,
  },
  finance: {
    title: "Finance Dashboard",
    description: "Approve payment slips and control monthly invoice generation.",
    icon: CreditCard,
  },
  manager: {
    title: "Management Dashboard",
    description: "Review collection trends, overdue exposure, and high-level financial risk.",
    icon: Activity,
  },
  admin: {
    title: "Admin Dashboard",
    description: "Oversee platform users, access policy health, and account governance.",
    icon: Shield,
  },
};

function formatMoney(value) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

async function parseApiResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export function PortalClient({ user, dashboardData }) {
  const router = useRouter();
  const [data, setData] = useState(dashboardData);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [invoiceId, setInvoiceId] = useState("INV-2026-030");
  const [amount, setAmount] = useState("5790");
  const [note, setNote] = useState("Transfer via mobile banking");

  const [month, setMonth] = useState("2026-04");
  const [roomId, setRoomId] = useState("A-214");
  const [waterPrevious, setWaterPrevious] = useState("1202");
  const [waterCurrent, setWaterCurrent] = useState("1218");
  const [electricPrevious, setElectricPrevious] = useState("5168");
  const [electricCurrent, setElectricCurrent] = useState("5280");

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const meta = roleMeta[user.role];
  const RoleIcon = meta.icon;

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
          label: "My Outstanding",
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
          label: "Outstanding",
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

    return [
      {
        label: "Managed Users",
        value: rows.length,
        hint: "Registered accounts",
        icon: Users,
      },
      {
        label: "Outstanding",
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
  }, [data, rows, user.role]);

  const tableMeta = useMemo(() => {
    if (user.role === "student") {
      return {
        title: "My Invoices",
        description: "Monthly bills with rent and utility breakdown.",
        columns: ["period", "rent", "water", "electricity", "amount", "status"],
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
        columns: ["invoiceId", "studentId", "amount", "status", "submittedAt"],
      };
    }

    if (user.role === "manager") {
      return {
        title: "Collection Trend",
        description: "Last periods collection and overdue status.",
        columns: ["month", "collectionRate", "paidRooms", "outstandingRooms"],
      };
    }

    return {
      title: "User Access Matrix",
      description: "Current users and role assignment in platform.",
      columns: ["id", "name", "username", "role"],
    };
  }, [user.role]);

  async function refreshDashboard() {
    const response = await fetch(`/api/dashboard?role=${user.role}`);
    const payload = await parseApiResponse(response);
    setData(payload.data);
  }

  async function runAction(action) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await action();
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function submitPayment() {
    await runAction(async () => {
      const response = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          amount: Number(amount),
          note,
          slipUrl: "uploaded-by-student",
        }),
      });
      await parseApiResponse(response);
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
          month,
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

  async function loadSummary() {
    await runAction(async () => {
      const response = await fetch("/api/reports/summary");
      const payload = await parseApiResponse(response);
      setMessage(
        `Income ${formatMoney(payload.report.totalIncome)} | Outstanding ${formatMoney(payload.report.totalOutstanding)}`,
      );
    });
  }

  return (
    <div className="space-y-5">
      <Card className="border border-border/70 bg-card/90">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <RoleIcon className="size-5" />
              {meta.title}
            </CardTitle>
            <CardDescription>
              Signed in as {user.name} ({user.username})
            </CardDescription>
            <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Role: {user.role}</Badge>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-muted/25 p-3">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-lg font-semibold">{formatMoney(data.summary.outstandingTotal)}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/25 p-3">
            <p className="text-xs text-muted-foreground">Paid This Month</p>
            <p className="text-lg font-semibold">{formatMoney(data.summary.paidThisMonth)}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/25 p-3">
            <p className="text-xs text-muted-foreground">Pending Slips</p>
            <p className="text-lg font-semibold">{data.summary.pendingSlips}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/25 p-3">
            <p className="text-xs text-muted-foreground">Active Rooms</p>
            <p className="text-lg font-semibold">
              {data.summary.activeRooms}/{data.summary.totalRooms}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {roleKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border border-border/70 bg-card/90">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-xl font-semibold">{kpi.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
                  </div>
                  <Icon className="size-5 text-primary" />
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {tableMeta.columns.map((key) => <TableHead key={key}>{key}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((row) => (
                    <TableRow key={row.id || JSON.stringify(row)}>
                      {tableMeta.columns.map((key) => (
                        <TableCell key={`${row.id}-${key}`}>
                          {key === "amount" ? formatMoney(row[key]) : String(row[key] ?? "-")}
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
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Role Actions</CardTitle>
            <CardDescription>Action panel calls protected API endpoints.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.role === "student" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="invoiceId">Invoice ID</Label>
                  <Input id="invoiceId" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="note">Note</Label>
                  <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
                </div>
                <Button className="w-full" disabled={busy} onClick={submitPayment}>
                  Submit Payment Slip
                </Button>
              </>
            )}

            {user.role === "staff" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="roomId">Room</Label>
                  <Input id="roomId" value={roomId} onChange={(event) => setRoomId(event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="month">Month (YYYY-MM)</Label>
                  <Input id="month" value={month} onChange={(event) => setMonth(event.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={waterPrevious} onChange={(event) => setWaterPrevious(event.target.value)} placeholder="Water Prev" />
                  <Input value={waterCurrent} onChange={(event) => setWaterCurrent(event.target.value)} placeholder="Water Current" />
                  <Input value={electricPrevious} onChange={(event) => setElectricPrevious(event.target.value)} placeholder="Elec Prev" />
                  <Input value={electricCurrent} onChange={(event) => setElectricCurrent(event.target.value)} placeholder="Elec Current" />
                </div>
                <Button className="w-full" disabled={busy} onClick={saveReading}>
                  Save Meter Reading
                </Button>
              </>
            )}

            {user.role === "finance" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="monthFinance">Invoice Month (YYYY-MM)</Label>
                  <Input id="monthFinance" value={month} onChange={(event) => setMonth(event.target.value)} />
                </div>
                <Button className="w-full" disabled={busy} onClick={generateInvoices}>
                  Generate Monthly Invoices
                </Button>
                <Button className="w-full" variant="secondary" disabled={busy} onClick={approveFirstPending}>
                  Approve First Pending Slip
                </Button>
              </>
            )}

            {(user.role === "manager" || user.role === "admin") && (
              <Button className="w-full" disabled={busy} onClick={loadSummary}>
                Load Financial Summary
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
