"use client";

import { useState, useEffect } from "react";
import { Bell, Menu, Search, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNotifications } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Navbar({ onOpenMobile }) {
  const { user, logout } = useAuth();
  const [userNotifications, setUserNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const notes = await getNotifications();
          setUserNotifications(notes || []);
        } catch (err) {
          setUserNotifications([]);
        }
      }
    };
    fetchNotifications();
  }, [user]);

  const balanceVal = user ? parseFloat(user.wallet_balance || 0) : 0;
  const formattedBalance = `₦${balanceVal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  const initials = user
    ? (user.first_name?.[0] || user.username?.[0] || "U").toUpperCase()
    : "HS";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobile}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search services, accounts, orders…"
          className="pl-9 bg-muted/40 border-border/60"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {user ? (
          <>
            <Link
              href="/wallet"
              className="hidden sm:inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 text-sm hover:bg-muted/50 font-semibold"
            >
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{formattedBalance}</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {userNotifications.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  <Badge variant="secondary">{userNotifications.length}</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userNotifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No new notifications right now.
                  </div>
                ) : (
                  userNotifications.map((n) => (
                    <DropdownMenuItem key={n.id || n.title} className="flex flex-col items-start gap-1 py-2.5">
                      <span className="text-xs font-bold text-foreground">{n.title}</span>
                      <span className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{`@${user.username}`}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wallet">Wallet</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/support">Support</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                  }}
                  className="cursor-pointer text-rose-400 focus:text-rose-400"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild size="sm" className="font-semibold">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="font-bold bg-emerald-500 hover:bg-emerald-600 text-black">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
