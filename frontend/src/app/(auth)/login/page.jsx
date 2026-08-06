"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GoogleButton } from "@/components/auth/google-button";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter both username/email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ username, password });
      toast.success("Logged in successfully!");
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user?.is_staff || data.user?.is_superuser) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in to HopeSocial</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back. Enter your details to access your workspace.</p>

      <div className="mt-8 space-y-6">
        <GoogleButton text="Sign in with Google" />

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
          </div>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

        <div className="space-y-1.5">
          <Label htmlFor="username">Username or Email</Label>
          <Input
            id="username"
            type="text"
            required
            placeholder="you@company.com or username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-muted/40"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-muted/40"
          />
        </div>

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

