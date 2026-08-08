"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, TrendingUp, Users, Wallet, Receipt, Gift,
  BookOpen, User, MessageSquare, LogOut, LogIn, Sparkles, ChevronLeft, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/lib/api";

const baseNav = [
  { to: "/", label: "Dashboard", icon: Home, authRequired: true },
  { to: "/marketplace", label: "Social Marketplace", icon: TrendingUp },
  { to: "/accounts", label: "Accounts Marketplace", icon: Users },
  { to: "/wallet", label: "Wallet", icon: Wallet, authRequired: true },
  { to: "/transactions", label: "Transactions", icon: Receipt, authRequired: true },
  { to: "/admin", label: "Admin Control", icon: ShieldAlert, adminOnly: true },
  { to: "/referrals", label: "Referrals", icon: Gift, authRequired: true },
  { to: "/api-docs", label: "API Documentation", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User, authRequired: true },
  { to: "/support", label: "Support", icon: MessageSquare },
];

export function AppSidebar({ collapsed, onToggle, onNavigate }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          const profile = await getUserProfile();
          setUser(profile);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const navItems = baseNav.filter((item) => {
    if (item.adminOnly) {
      return Boolean(user && (user.is_staff || user.is_superuser));
    }
    if (item.authRequired && !user) {
      return false;
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <Sparkles className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">HopeSocial</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Marketplace</div>
          </div>
        )}
        <Button
          variant="ghost" size="icon"
          onClick={onToggle}
          className="ml-auto hidden lg:inline-flex text-muted-foreground hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  href={to}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative",
                    active
                      ? "bg-sidebar-accent text-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground",
                  )}
                >
                  {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />}
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {user ? (
          <Link
            href="/login"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("token");
              }
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </Link>
        ) : (
          <Link
            href="/login"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <LogIn className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Sign in</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}
