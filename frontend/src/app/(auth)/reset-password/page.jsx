"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose something strong you'll remember.</p>

      <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label>New password</Label>
          <Input type="password" className="bg-muted/40" />
        </div>
        <div className="space-y-1.5">
          <Label>Confirm password</Label>
          <Input type="password" className="bg-muted/40" />
        </div>
        <Button className="w-full" type="submit">Update password</Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Back to{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
