export const roleTabs = [
  { value: "student", label: "Student" },
  { value: "staff", label: "Staff" },
  { value: "finance", label: "Finance" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
]

export const kpiCards = [
  {
    title: "Outstanding Balance",
    value: "THB 176,450",
    change: "+5.3% from last month",
    tone: "danger",
  },
  {
    title: "Amount Due",
    value: "THB 428,200",
    change: "82.4% collection rate",
    tone: "good",
  },
  {
    title: "Awaiting Verification",
    value: "34 slips",
    change: "Average queue time 2h 16m",
    tone: "warning",
  },
  {
    title: "Occupied Rooms",
    value: "312 / 340",
    change: "91.7% occupancy",
    tone: "neutral",
  },
]

export const rolePanels = {
  student: {
    heading: "Student Portal",
    description:
      "Check monthly charges, upload transfer slips, and track payment status in one place.",
    highlights: [
      { label: "Rent", value: "THB 4,500" },
      { label: "Water", value: "THB 260" },
      { label: "Electricity", value: "THB 1,030" },
      { label: "Total Due", value: "THB 5,790" },
    ],
    activity: [
      ["INV-2026-030", "Mar 2026", "THB 5,790", "Waiting review"],
      ["INV-2026-020", "Feb 2026", "THB 5,620", "Paid"],
      ["INV-2026-010", "Jan 2026", "THB 5,410", "Paid"],
    ],
  },
  staff: {
    heading: "Dormitory Staff",
    description:
      "Record monthly meter values, handle check-in and check-out, and send overdue reminders.",
    highlights: [
      { label: "Meters Pending", value: "28 rooms" },
      { label: "Move-ins", value: "12" },
      { label: "Move-outs", value: "7" },
      { label: "Reminders Sent", value: "54" },
    ],
    activity: [
      ["A-210", "Meter update", "Today 10:42", "Completed"],
      ["B-317", "Check-out request", "Today 09:18", "Needs billing check"],
      ["C-108", "Overdue reminder", "Yesterday", "Delivered"],
    ],
  },
  finance: {
    heading: "Finance Console",
    description:
      "Verify payment slips, confirm bank matching, and generate monthly invoices in batch.",
    highlights: [
      { label: "Slips in Queue", value: "34" },
      { label: "Approved Today", value: "19" },
      { label: "Rejected", value: "3" },
      { label: "Bank Matched", value: "97.1%" },
    ],
    activity: [
      ["SLIP-8841", "Room A-214", "THB 5,760", "Approve / Reject"],
      ["SLIP-8832", "Room B-119", "THB 5,540", "Approve / Reject"],
      ["Batch Invoice", "April 2026", "312 rooms", "Ready"],
    ],
  },
  manager: {
    heading: "Management Insights",
    description:
      "Monitor revenue trends and overdue debt status with quick monthly and yearly snapshots.",
    highlights: [
      { label: "Monthly Revenue", value: "THB 428,200" },
      { label: "Year to Date", value: "THB 3.8M" },
      { label: "Overdue Rooms", value: "46" },
      { label: "Oldest Debt", value: "78 days" },
    ],
    activity: [
      ["Mar 2026", "Collection", "82.4%", "+1.8%"],
      ["Q1 2026", "Amount Due", "THB 522,900", "-6.2%"],
      ["Top Risk", "Tower B", "18 rooms", "Investigate"],
    ],
  },
  admin: {
    heading: "Admin Center",
    description:
      "Manage room pricing, utility rates, and role-based access for all internal users.",
    highlights: [
      { label: "Active Users", value: "78" },
      { label: "Dorm Rooms", value: "340" },
      { label: "Electric Rate", value: "THB 8 / unit" },
      { label: "Water Rate", value: "THB 22 / unit" },
    ],
    activity: [
      ["Role Update", "New finance officer", "Today 11:03", "Applied"],
      ["Rate Change", "Electricity +1 THB", "Tomorrow", "Scheduled"],
      ["Room Type", "Premium-2 added", "Yesterday", "Published"],
    ],
  },
}
