"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter your email — we'll send a reset link.</p>

      <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input placeholder="you@company.com" className="bg-muted/40" />
        </div>
        <Button className="w-full" type="submit">Send reset link</Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
