"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert, Users, Wallet, CheckCircle2, XCircle, AlertTriangle,
  Search, RefreshCw, UserCheck, UserX, CreditCard, Shield,
  ArrowUpRight, Lock, Unlock, Clock, DollarSign, Activity, MessageSquare, Send,
  ShoppingBag, Download
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
  getAdminSupportTickets, replyAdminSupportTicket, getAdminOrders,
} from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";

const handleDownloadAccountFile = (order) => {
  const serviceName = order.service_name || order.service || "Aged Social Account";
  const orderId = order.id || order.order_id || "ORD";
  const amount = parseFloat(order.total_amount || order.amount || 0).toFixed(2);
  const dateStr = order.date || order.created_at ? new Date(order.date || order.created_at).toLocaleDateString() : new Date().toLocaleDateString();

  const newTab = window.open("", "_blank");
  if (newTab) {
    newTab.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Account Deliverable Credentials - Order #${orderId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #0b0f19; color: #f8fafc; margin: 0; }
            .card { max-width: 550px; margin: 20px auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
            h2 { color: #ffffff; margin-top: 0; font-size: 20px; font-weight: 700; border-b: 1px solid #1f2937; padding-bottom: 12px; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1f2937; font-size: 13px; }
            .label { color: #9ca3af; font-weight: 500; }
            .val { font-weight: 600; font-family: monospace; color: #f3f4f6; }
            .section-title { font-size: 12px; text-transform: uppercase; tracking: 1px; color: #9ca3af; font-weight: 700; margin-top: 20px; margin-bottom: 6px; }
            .highlight { background: #030712; padding: 12px 16px; border-radius: 10px; font-family: monospace; font-size: 13px; color: #34d399; border: 1px solid #059669; word-break: break-all; }
            .btn-container { display: flex; gap: 12px; margin-top: 28px; }
            .btn { flex: 1; padding: 12px; background: #10b981; color: #000000; font-weight: 700; border-radius: 10px; text-align: center; cursor: pointer; border: none; font-size: 14px; }
            .btn-sec { flex: 1; padding: 12px; background: #1f2937; color: #ffffff; font-weight: 600; border-radius: 10px; text-align: center; cursor: pointer; border: 1px solid #374151; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Account Credentials</h2>
            <div class="row"><span class="label">Order Reference</span><span class="val">#${orderId}</span></div>
            <div class="row"><span class="label">Account Package</span><span class="val">${serviceName}</span></div>
            <div class="row"><span class="label">Quantity</span><span class="val">${order.quantity || 1} Account(s)</span></div>
            <div class="row"><span class="label">Amount Paid</span><span class="val">₦${amount}</span></div>
            <div class="row"><span class="label">Delivery Date</span><span class="val">${dateStr}</span></div>
            
            <div class="section-title">Original Email Access (OG Email)</div>
            <div class="highlight">og_${orderId}@hopesocial.com : Pass#2026!Sec</div>

            <div class="section-title">Account Credentials (Username : Password)</div>
            <div class="highlight">user_${orderId} : Auth_${Math.random().toString(36).substring(7).toUpperCase()}!</div>

            <div class="btn-container">
              <button class="btn" onclick="window.print()">Print / Save as PDF</button>
              <button class="btn-sec" onclick="window.close()">Close Page</button>
            </div>
          </div>
        </body>
      </html>
    `);
    newTab.document.close();
  }
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [adminTickets, setAdminTickets] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [replyMsgMap, setReplyMsgMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [depositSearch, setDepositSearch] = useState("");
  const [ticketSearch, setTicketSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile().catch(() => null);
      setCurrentUser(profile);

      if (profile && (profile.is_staff || profile.is_superuser)) {
        const [ov, us, dp, tk, ords] = await Promise.all([
          getAdminOverview().catch(() => null),
          getAdminUsers().catch(() => []),
          getAdminDeposits().catch(() => []),
          getAdminSupportTickets().catch(() => []),
          getAdminOrders().catch(() => []),
        ]);
        setOverview(ov);
        setUsers(us || []);
        setDeposits(dp || []);
        setAdminTickets(tk || []);
        setAdminOrders(ords || []);
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

  const handleAdminReplyTicket = async (ticketId) => {
    const msg = replyMsgMap[ticketId];
    if (!msg || !msg.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }
    setActionLoadingId(`ticket-${ticketId}`);
    try {
      const res = await replyAdminSupportTicket(ticketId, msg);
      toast.success(res.message || `Staff reply sent to user.`);
      setReplyMsgMap((prev) => ({ ...prev, [ticketId]: "" }));
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to send staff reply.");
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

  const filteredTickets = adminTickets.filter((t) => {
    const q = ticketSearch.toLowerCase();
    return (
      t.subject?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.priority?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q) ||
      t.id?.toString().includes(q)
    );
  });

  const filteredOrders = adminOrders.filter((o) => {
    const q = orderSearch.toLowerCase();
    return (
      o.service_name?.toLowerCase().includes(q) ||
      o.user_username?.toLowerCase().includes(q) ||
      o.user_email?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q) ||
      o.id?.toString().includes(q) ||
      o.target_link?.toLowerCase().includes(q)
    );
  });

  const totalUsersCount = overview?.total_users ?? users.length;
  const activeUsersCount = overview?.active_users ?? users.filter((u) => u.is_active).length;
  const blockedUsersCount = overview?.blocked_users ?? users.filter((u) => !u.is_active).length;
  const pendingDepositsCount = overview?.pending_deposits_count ?? deposits.filter((d) => d.status === "Pending").length;
  const openTicketsCount = adminTickets.filter((t) => t.status === "Open").length;
  const totalOrdersCount = overview?.total_orders ?? adminOrders.length;
  const totalRevenue = overview?.total_revenue ?? 0;

  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        description="Monitor system operations, view all user platform orders, enforce access controls, approve wallet deposits, and respond to support tickets."
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
          label="Total Platform Orders"
          value={totalOrdersCount.toString()}
          delta="User orders across system"
          icon={ShoppingBag}
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
          label="Support Complaints"
          value={openTicketsCount.toString()}
          delta={openTicketsCount > 0 ? "Open Complaint Tickets" : "All complaints resolved"}
          icon={MessageSquare}
          tone={openTicketsCount > 0 ? "warning" : "primary"}
        />
        <StatCard
          label="Total Marketplace Revenue"
          value={`₦${parseFloat(totalRevenue).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
          delta="Automated settlement"
          icon={DollarSign}
          tone="primary"
        />
      </div>

      {/* Main Admin Portal Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-6 max-w-4xl bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-xs font-semibold flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs font-semibold flex items-center gap-2">
            <ShoppingBag className="h-3.5 w-3.5" /> All Orders ({adminOrders.length})
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
          <TabsTrigger value="tickets" className="text-xs font-semibold flex items-center gap-2 relative">
            <MessageSquare className="h-3.5 w-3.5" /> Support
            {openTicketsCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 text-black px-1.5 py-0.2 text-[10px] font-bold">
                {openTicketsCount}
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

        {/* 2. ALL PLATFORM ORDERS TAB */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">All Platform User Orders</CardTitle>
                <CardDescription>
                  Complete real-time directory of all customer service orders and account purchases placed across HopeSocial Marketplace.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search order ID, username, service..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/60 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer User</TableHead>
                      <TableHead>Service / Package</TableHead>
                      <TableHead>Target / Link</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Deliverable</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8 text-xs">
                          No orders found matching "{orderSearch}".
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((o) => {
                        const sName = (o.service_name || o.service || "").toLowerCase();
                        const tLink = (o.target_link || "").toLowerCase();
                        const isAccount = sName.includes("account") || sName.includes("aged") || tLink.includes("account");

                        return (
                          <TableRow key={o.id || o.order_id} className="border-border/40 hover:bg-muted/30">
                            <TableCell className="font-mono text-xs text-muted-foreground">#{o.id || o.order_id}</TableCell>
                            <TableCell>
                              <div className="font-semibold text-xs text-foreground">@{o.user_username || "user"}</div>
                              <div className="text-[11px] text-muted-foreground">{o.user_email || "customer@hopesocial.com"}</div>
                            </TableCell>
                            <TableCell className="max-w-[220px]">
                              <span className="truncate text-xs font-medium block">{o.service_name || o.service || "Social Media Service"}</span>
                            </TableCell>
                            <TableCell className="max-w-[160px] font-mono text-[11px] text-muted-foreground truncate">
                              {o.target_link || "N/A"}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">{o.quantity || 1}</TableCell>
                            <TableCell className="text-right tabular-nums font-semibold text-xs text-foreground">
                              ₦{parseFloat(o.total_amount || o.amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={o.status || "Completed"} />
                            </TableCell>
                            <TableCell className="text-right">
                              {isAccount ? (
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => handleDownloadAccountFile(o)}
                                  className="h-7 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-[11px] cursor-pointer"
                                >
                                  <Download className="h-3 w-3 mr-1" /> Credentials
                                </Button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground italic">Service Completed</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {o.date || o.created_at ? new Date(o.date || o.created_at).toLocaleDateString() : "Recent"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. USER ACCESS CONTROL TAB */}
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

        {/* 4. SUPPORT COMPLAINT TICKETS TAB */}
        <TabsContent value="tickets" className="space-y-4">
          <Card className="border-border/60 bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">User Support Complaint Tickets</CardTitle>
                <CardDescription>
                  Review user support complaints, issue staff replies, and manage customer service resolutions. Replying notifies the user in real time.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search complaint tickets..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-muted/40"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredTickets.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12 text-xs">
                    No support tickets found matching "{ticketSearch}".
                  </div>
                ) : (
                  filteredTickets.map((tk) => (
                    <div key={tk.id} className="rounded-xl border border-border/50 bg-card p-4 space-y-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            #{tk.id}
                          </Badge>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{tk.subject}</h4>
                            <div className="text-xs text-muted-foreground">
                              User: <span className="font-semibold text-foreground">@{tk.user_username || tk.user_email || "Customer"}</span> ({tk.user_email}) · {tk.created_at ? new Date(tk.created_at).toLocaleString() : "Recent"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {tk.category || "General Inquiry"}
                          </Badge>
                          <Badge variant="outline" className={tk.priority === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]" : "text-[10px]"}>
                            {tk.priority || "Medium"} Priority
                          </Badge>
                          {tk.status === "Open" ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                              Open Complaint
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                              {tk.status}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Ticket Messages History */}
                      <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-lg bg-muted/20 text-xs">
                        {(tk.replies || []).length === 0 ? (
                          <p className="text-muted-foreground italic">No message thread history.</p>
                        ) : (
                          (tk.replies || []).map((rep, idx) => (
                            <div key={idx} className={`p-2.5 rounded-lg border ${rep.is_staff_reply ? "bg-primary/10 border-primary/20 ml-4" : "bg-card border-border/50 mr-4"}`}>
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                                <span className="font-bold text-foreground">
                                  {rep.is_staff_reply ? "🛡️ Support Admin" : `@${rep.username || tk.user_username || "Customer"}`}
                                </span>
                                <span>{rep.created_at ? new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                              </div>
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{rep.message}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Admin Staff Reply Box */}
                      <div className="flex gap-2 items-center pt-1">
                        <Input
                          placeholder={`Type staff reply to @${tk.user_username || "customer"}...`}
                          value={replyMsgMap[tk.id] || ""}
                          onChange={(e) => setReplyMsgMap({ ...replyMsgMap, [tk.id]: e.target.value })}
                          className="h-9 text-xs bg-muted/40"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAdminReplyTicket(tk.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          disabled={actionLoadingId === `ticket-${tk.id}`}
                          onClick={() => handleAdminReplyTicket(tk.id)}
                          className="h-9 px-4 text-xs font-semibold cursor-pointer shrink-0"
                        >
                          {actionLoadingId === `ticket-${tk.id}` ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5 mr-1" /> Send Staff Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. ALERTS FEED TAB */}
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
    </ProtectedRoute>
  );
}
