"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyEmail() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
      <p className="mt-1 text-sm text-muted-foreground">We sent a 6-digit code to your email address.</p>

      <form className="mt-8" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-center">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="mt-6 w-full" type="submit">Verify</Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Didn't receive a code?{" "}
        <button type="button" className="font-medium text-primary hover:underline">Resend</button>
      </p>
    </div>
  );
}
