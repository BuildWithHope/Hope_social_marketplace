"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuth, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuth) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [loading, isAuth, router, pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center animate-in fade-in duration-300">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30 animate-pulse">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Verifying authentication…</span>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  if (adminOnly && (!user?.is_staff && !user?.is_superuser)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4 animate-in fade-in duration-300">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-xl">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Admin Control Center is reserved exclusively for staff administrators. Please sign in with Django admin credentials to access this area.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/">Return to Dashboard</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Sign in as Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
