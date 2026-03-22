import { Bell, Building2, CircleAlert, CircleCheckBig, Clock3, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { kpiCards, rolePanels, roleTabs } from "@/lib/dashboard-data";

const toneConfig = {
  danger: {
    badge: "destructive",
    icon: CircleAlert,
  },
  good: {
    badge: "default",
    icon: CircleCheckBig,
  },
  warning: {
    badge: "secondary",
    icon: Clock3,
  },
  neutral: {
    badge: "outline",
    icon: Building2,
  },
};

export default function Home() {
  return (
    <div className="relative flex flex-1 justify-center px-4 py-8 sm:px-8">
      <main className="animate-rise relative w-full max-w-7xl space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card/85 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="animate-pulse-ring rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/15">
                DormPayment Platform
              </Badge>
              <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
                Student Dormitory Billing and Payment Management
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Built from your project requirements: online payment submission, meter tracking,
                invoice flow, role-based dashboards, and overdue analytics.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3 md:max-w-md">
              <Link
                href="/login"
                className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Wallet className="size-4" />
                Login Now
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
              >
                <Bell className="size-4" />
                Open Portal
              </Link>
              <Button variant="outline" className="w-full gap-2">
                <ShieldCheck className="size-4" />
                API Ready
              </Button>
            </div>
          </div>
        </section>

        <section className="animate-rise animate-delayed grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => {
            const tone = toneConfig[card.tone];
            const Icon = tone.icon;

            return (
              <Card key={card.title} className="border border-border/70 bg-card/90">
                <CardHeader className="pb-2">
                  <CardDescription>{card.title}</CardDescription>
                  <CardTitle className="text-2xl">{card.value}</CardTitle>
                </CardHeader>
                <CardFooter className="flex items-center justify-between bg-muted/40">
                  <Badge variant={tone.badge} className="gap-1">
                    <Icon className="size-3.5" />
                    Status
                  </Badge>
                  <span className="text-xs text-muted-foreground">{card.change}</span>
                </CardFooter>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card className="border border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Role Workspace</CardTitle>
              <CardDescription>
                Mapped to SRS and User Stories: student, staff, finance, manager, and admin functions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="student" className="gap-4">
                <TabsList className="w-full justify-start overflow-x-auto">
                  {roleTabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="px-3">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(rolePanels).map(([role, panel]) => (
                  <TabsContent key={role} value={role} className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-heading text-xl font-semibold">{panel.heading}</h3>
                      <p className="text-sm text-muted-foreground">{panel.description}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {panel.highlights.map((item) => (
                        <div key={item.label} className="rounded-xl border border-border/80 bg-muted/25 p-3">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="mt-1 text-sm font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Amount / Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {panel.activity.map((row) => (
                          <TableRow key={`${role}-${row[0]}`}>
                            <TableCell className="font-medium">{row[0]}</TableCell>
                            <TableCell>{row[1]}</TableCell>
                            <TableCell>{row[2]}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{row[3]}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Payment Submission</CardTitle>
              <CardDescription>
                Student flow from User Story 4: upload slip and send for verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" placeholder="6516xxxx" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">Transfer Amount</Label>
                <Input id="amount" type="number" placeholder="5790" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Remark</Label>
                <Textarea id="note" placeholder="Optional note to finance team" />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Verification queue target</span>
                  <span>68%</span>
                </div>
                <Progress value={68} />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 bg-muted/40">
              <Button className="flex-1">Upload Slip</Button>
              <Button variant="outline" className="flex-1">
                Save Draft
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/70 p-4">
          <p className="text-xs text-muted-foreground">
            This landing page is now connected to role-based login and protected API routes for auth,
            invoices, payments, meter readings, and executive summaries.
          </p>
        </section>
      </main>
    </div>
  );
}
