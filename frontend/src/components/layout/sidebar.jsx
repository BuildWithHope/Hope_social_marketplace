"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, TrendingUp, Users, Wallet, Receipt, Gift,
  BookOpen, User, MessageSquare, LogOut, LogIn, Sparkles, ChevronLeft, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

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
  const { user, logout } = useAuth();

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
        "sticky top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight">HopeSocial</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Marketplace</div>
            </div>
          )}
        </Link>
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
                      ? "bg-sidebar-accent text-foreground font-semibold"
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
          <button
            onClick={() => {
              logout();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground cursor-pointer text-left",
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
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
