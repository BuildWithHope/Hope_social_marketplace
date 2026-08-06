"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert, Users, Wallet, CheckCircle2, XCircle, AlertTriangle,
  Search, RefreshCw, UserCheck, UserX, CreditCard, Shield,
  ArrowUpRight, Lock, Unlock, Clock, DollarSign, Activity,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getAdminOverview, getAdminUsers, toggleUserBlock,
  getAdminDeposits, confirmAdminDeposit, getUserProfile,
} from "@/lib/api";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [depositSearch, setDepositSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile().catch(() => null);
      setCurrentUser(profile);

      if (profile && (profile.is_staff || profile.is_superuser)) {
        const [ov, us, dp] = await Promise.all([
          getAdminOverview().catch(() => null),
          getAdminUsers().catch(() => []),
          getAdminDeposits().catch(() => []),
        ]);
        setOverview(ov);
        setUsers(us || []);
        setDeposits(dp || []);
      }
    } catch (err) {
      toast.error("Failed to load admin telemetry data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!loading && (!currentUser || (!currentUser.is_staff && !currentUser.is_superuser))) {
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

  const handleToggleBlock = async (userObj) => {
    setActionLoadingId(`user-${userObj.id}`);
    try {
      const res = await toggleUserBlock(userObj.id);
      toast.success(res.message || `Updated access status for @${userObj.username}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userObj.id ? { ...u, is_active: !u.is_active } : u))
      );
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to change user access status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDeposit = async (depositObj, action = "approve") => {
    setActionLoadingId(`dep-${depositObj.id}`);
    try {
      const res = await confirmAdminDeposit(depositObj.id, action);
      toast.success(res.message || `Deposit #${depositObj.reference} processed successfully.`);
      setDeposits((prev) =>
        prev.map((d) => (d.id === depositObj.id ? { ...d, status: action === "approve" ? "Completed" : "Failed" } : d))
      );
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to process deposit approval.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q)
    );
  });

  const filteredDeposits = deposits.filter((d) => {
    const q = depositSearch.toLowerCase();
    return (
      d.reference?.toLowerCase().includes(q) ||
      d.user_name?.toLowerCase().includes(q) ||
      d.user_email?.toLowerCase().includes(q) ||
      d.method?.toLowerCase().includes(q)
    );
  });

  const totalUsersCount = overview?.total_users ?? users.length;
  const activeUsersCount = overview?.active_users ?? users.filter((u) => u.is_active).length;
  const blockedUsersCount = overview?.blocked_users ?? users.filter((u) => !u.is_active).length;
  const pendingDepositsCount = overview?.pending_deposits_count ?? deposits.filter((d) => d.status === "Pending").length;
  const totalRevenue = overview?.total_revenue ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        description="Monitor system operations, enforce user access controls, approve wallet deposits, and track real-time security alerts."
        actions={
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Control Center
          </Button>
        }
      />

      {/* Top Telemetry Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Registered Users"
          value={totalUsersCount.toString()}
          delta={`${activeUsersCount} active · ${blockedUsersCount} blocked`}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Pending Payment Approvals"
          value={pendingDepositsCount.toString()}
          delta={pendingDepositsCount > 0 ? "Requires Admin Action" : "All payments verified"}
          icon={CreditCard}
          tone={pendingDepositsCount > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Total Marketplace Revenue"
          value={`₦${parseFloat(totalRevenue).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
          delta="Automated settlement"
          icon={DollarSign}
          tone="primary"
        />
        <StatCard
          label="Access Enforcement"
          value={`${blockedUsersCount} Blocked`}
          delta="User restriction engine"
          icon={ShieldAlert}
          tone={blockedUsersCount > 0 ? "danger" : "default"}
        />
      </div>

      {/* Main Admin Portal Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-xl bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-xs font-semibold flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs font-semibold flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs font-semibold flex items-center gap-2 relative">
            <CreditCard className="h-3.5 w-3.5" /> Payments
            {pendingDepositsCount > 0 && (
              <span className="ml-1 rounded-full bg-destructive text-destructive-foreground px-1.5 py-0.2 text-[10px] font-bold">
                {pendingDepositsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5" /> Alerts Feed
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Quick Actions Card */}
            <Card className="border-border/60 bg-card md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Admin Control Actions
                </CardTitle>
                <CardDescription>
                  Instant administrative functions for user accounts, transaction approvals, and platform governance.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <UserX className="h-4 w-4 text-amber-400" /> Access Enforcement
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Block or restore user account access instantly. Blocked users are immediately prevented from placing orders or logging in.
                  </p>
                  <Button variant="secondary" size="xs" onClick={() => setActiveTab("users")}>
                    Manage Users & Access
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Deposit Approvals
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Confirm incoming bank transfers and manual payment deposits. Approving a deposit instantly credits the user's wallet balance.
                  </p>
                  <Button variant="secondary" size="xs" onClick={() => setActiveTab("payments")}>
                    Review Pending Payments ({pendingDepositsCount})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status Alert Card */}
            <Card className="border-border/60 bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" /> System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 text-xs">
                  <span className="text-muted-foreground font-medium">Django API Server</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 text-xs">
                  <span className="text-muted-foreground font-medium">Database Connection</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">SQLite Sync OK</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 text-xs">
                  <span className="text-muted-foreground font-medium">Supplier API Gateway</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active v2</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 text-xs">
                  <span className="text-muted-foreground font-medium">Authentication Engine</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Token & OAuth</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts Feed Preview */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Active System Alerts</CardTitle>
                <CardDescription>Live notifications regarding pending transactions, user flags, and supplier telemetry.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("alerts")}>
                View All Alerts
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(overview?.alerts || []).map((alt) => (
                <div
                  key={alt.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ${
                    alt.level === "warning"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : alt.level === "danger"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                      : "border-border/40 bg-muted/20 text-foreground"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{alt.title}</div>
                    <p className="text-xs opacity-90 mt-0.5">{alt.message}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {alt.time}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. USER ACCESS CONTROL TAB */}
        <TabsContent value="users" className="space-y-4">
          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">User Access Control Directory</CardTitle>
                <CardDescription>View all registered marketplace users, monitor wallet balances, and enforce account blocks.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search username, email, name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/60"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>User ID</TableHead>
                      <TableHead>Account / Name</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Wallet Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Action Enforcement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8 text-xs">
                          No users found matching "{userSearch}".
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u.id} className="border-border/40 hover:bg-muted/30">
                          <TableCell className="font-mono text-xs text-muted-foreground">#{u.id}</TableCell>
                          <TableCell>
                            <div className="font-semibold text-xs text-foreground">@{u.username}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : "Standard User"}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">{u.email}</TableCell>
                          <TableCell className="text-xs font-semibold tabular-nums text-foreground">
                            ₦{parseFloat(u.wallet_balance || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {u.is_active ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px]">
                                <UserCheck className="h-3 w-3 mr-1" /> Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[11px]">
                                <UserX className="h-3 w-3 mr-1" /> Blocked
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px]">
                              {u.is_staff ? "Administrator" : "Customer"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={u.is_active ? "destructive" : "default"}
                              size="xs"
                              disabled={actionLoadingId === `user-${u.id}`}
                              onClick={() => handleToggleBlock(u)}
                              className="cursor-pointer"
                            >
                              {actionLoadingId === `user-${u.id}` ? (
                                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                              ) : u.is_active ? (
                                <>
                                  <Lock className="h-3 w-3 mr-1" /> Block Access
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-3 w-3 mr-1" /> Unblock Access
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PAYMENT CONFIRMATIONS TAB */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Payment Deposit Confirmations</CardTitle>
                <CardDescription>
                  Review manual payment transfers and confirm deposits. Approving a deposit instantly credits the user's wallet in real time.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reference, user, method..."
                  value={depositSearch}
                  onChange={(e) => setDepositSearch(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/60"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Reference</TableHead>
                      <TableHead>User Account</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Deposit Amount</TableHead>
                      <TableHead>Date / Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Approval Decision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeposits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8 text-xs">
                          No deposit transactions found matching "{depositSearch}".
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeposits.map((d) => (
                        <TableRow key={d.id} className="border-border/40 hover:bg-muted/30">
                          <TableCell className="font-mono text-xs text-primary font-semibold">
                            #{d.reference}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-xs text-foreground">@{d.user_name}</div>
                            <div className="text-[11px] text-muted-foreground">{d.user_email}</div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{d.method}</TableCell>
                          <TableCell className="text-xs font-bold text-emerald-400 tabular-nums">
                            +₦{parseFloat(d.amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(d.date).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={d.status} />
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {d.status === "Completed" ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px]">
                                Verified & Credited
                              </Badge>
                            ) : d.status === "Failed" ? (
                              <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[11px]">
                                Declined
                              </Badge>
                            ) : (
                              <>
                                <Button
                                  variant="default"
                                  size="xs"
                                  disabled={actionLoadingId === `dep-${d.id}`}
                                  onClick={() => handleConfirmDeposit(d, "approve")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                >
                                  {actionLoadingId === `dep-${d.id}` ? (
                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-3 w-3 mr-1" /> Approve & Credit Wallet
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  disabled={actionLoadingId === `dep-${d.id}`}
                                  onClick={() => handleConfirmDeposit(d, "decline")}
                                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                                >
                                  <XCircle className="h-3 w-3 mr-1" /> Decline
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. ALERTS FEED TAB */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" /> Platform Security & Audit Alerts
              </CardTitle>
              <CardDescription>
                Automated system telemetry monitoring payment verifications, flagged accounts, and operational logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(overview?.alerts || []).map((alt) => (
                <div
                  key={alt.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-muted/20"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{alt.title}</h4>
                      <Badge variant="outline" className="text-xs">{alt.time}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alt.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
