"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { requestPasswordReset, confirmPasswordReset } from "@/lib/api";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter code & new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      toast.success(res.message || "6-digit reset code sent to your email!");
      if (res.reset_code) {
        setCode(res.reset_code);
      }
      setStep(2);
    } catch (err) {
      toast.error(err.message || "Failed to send reset code. Verify email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await confirmPasswordReset(email, code, newPassword);
      toast.success(res.message || "Password reset successful!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      toast.error(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {step === 1 ? "Reset your password" : "Enter Verification Code"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {step === 1
          ? "Enter your email address to receive a 6-digit verification code."
          : `We sent a 6-digit code to ${email}. Enter code below to set your new password.`}
      </p>

      {step === 1 ? (
        <form className="mt-8 space-y-4" onSubmit={handleRequestCode}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/40"
            />
          </div>
          <Button className="w-full font-semibold cursor-pointer" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Reset Code...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" /> Send Verification Code
              </>
            )}
          </Button>
        </form>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
          {code && (
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold">Verification Code:</span> <code className="font-mono text-sm font-bold bg-background/60 px-2 py-0.5 rounded ml-1">{code}</code>
              </div>
              <span className="text-[10px] text-emerald-300 font-medium">Ready</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="code">6-Digit Reset Code *</Label>
            <Input
              id="code"
              type="text"
              required
              placeholder="e.g. 482910"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-muted/40 font-mono tracking-widest text-center text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password *</Label>
            <Input
              id="newPassword"
              type="password"
              required
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-muted/40"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-muted/40"
            />
          </div>

          <Button className="w-full font-semibold cursor-pointer" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting Password...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" /> Reset Password & Sign In
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setStep(1)}
          >
            ← Change email address
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

