"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/app/theme-toggle";

const demoAccounts = [
  { role: "Student", username: "65160381", password: "pass1234" },
  { role: "Staff", username: "staff01", password: "pass1234" },
  { role: "Finance", username: "finance01", password: "pass1234" },
  { role: "Manager", username: "manager01", password: "pass1234" },
  { role: "Admin", username: "admin01", password: "pass1234" },
];

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();
      router.push(`/portal/${data.user.role}`);
      router.refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4 w-full max-w-md mx-auto">
        <ThemeToggle />
      </div>
      <Card className="mx-auto w-full max-w-md border border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to DormPayment</CardTitle>
          <CardDescription>Use your role account to access your own workspace.</CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="65160381"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="pass1234"
              required
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Demo accounts</p>
          <ul className="space-y-1">
            {demoAccounts.map((account) => (
              <li key={account.role}>
                {account.role}: {account.username} / {account.password}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
