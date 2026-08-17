"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Sparkles } from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { isAuth, loading } = useAuth();

  if (pathname === "/") {
    if (loading) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30 animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      );
    }
    if (!isAuth) {
      return <>{children}</>;
    }
  }

  return <AppShell>{children}</AppShell>;
}

