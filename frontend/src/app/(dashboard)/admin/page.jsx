"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert, Users, Wallet, CheckCircle2, XCircle, AlertTriangle,
  Search, RefreshCw, UserCheck, UserX, CreditCard, Shield,
  ArrowUpRight, Lock, Unlock, Clock, DollarSign, Activity, MessageSquare, Send,
  ShoppingBag, Download, Plus, Trash2, Edit3, Package
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
  getPaymentConfig, updatePaymentConfig,
  getServices, getAccounts, createService, deleteService,
  createAccountItem, deleteAccountItem,
  getAdminProviders, createAdminProvider
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

  const [bankConfigForm, setBankConfigForm] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
    flutterwave_public_key: "",
    flutterwave_secret_key: "",
  });
  const [savingBankConfig, setSavingBankConfig] = useState(false);

  const [servicesList, setServicesList] = useState([]);
  const [accountsList, setAccountsList] = useState([]);
  const [providersList, setProvidersList] = useState([]);

  const [newServiceForm, setNewServiceForm] = useState({
    platform: "Instagram",
    category: "Followers",
    name: "",
    rate_per_1k: "1500.00",
    badge: "Popular",
    description: "",
  });

  const [newAccountForm, setNewAccountForm] = useState({
    platform: "Instagram",
    category: "Verified Account",
    name: "",
    followers: "10,000",
    year: 2022,
    flag: "USA 🇺🇸",
    price: "25000.00",
    badge: "OG Email Included",
    description: "2FA active with full email login credentials.",
  });

  const [newProviderForm, setNewProviderForm] = useState({
    name: "",
    api_url: "https://provider.com/api/v2",
    api_key: "",
    margin_percentage: "30.00",
    is_active: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile().catch(() => null);
      setCurrentUser(profile);

      if (profile && (profile.is_staff || profile.is_superuser)) {
        const [ov, us, dp, tk, ords, pCfg, svcs, accs, provs] = await Promise.all([
          getAdminOverview().catch(() => null),
          getAdminUsers().catch(() => []),
          getAdminDeposits().catch(() => []),
          getAdminSupportTickets().catch(() => []),
          getAdminOrders().catch(() => []),
          getPaymentConfig().catch(() => null),
          getServices().catch(() => []),
          getAccounts().catch(() => []),
          getAdminProviders().catch(() => []),
        ]);
        setOverview(ov);
        setUsers(us || []);
        setDeposits(dp || []);
        setAdminTickets(tk || []);
        setAdminOrders(ords || []);
        setServicesList(svcs || []);
        setAccountsList(accs || []);
        setProvidersList(provs || []);
        if (pCfg) {
          setBankConfigForm({
            bank_name: pCfg.bank_name || "",
            account_name: pCfg.account_name || "",
            account_number: pCfg.account_number || "",
            flutterwave_public_key: pCfg.flutterwave_public_key || "",
            flutterwave_secret_key: pCfg.flutterwave_secret_key || "",
          });
        }
      }
    } catch (err) {
      toast.error("Failed to load admin telemetry data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    if (!newProviderForm.name.trim() || !newProviderForm.api_key.trim()) {
      toast.error("Provider Name and API Key are required.");
      return;
    }
    try {
      await createAdminProvider(newProviderForm);
      toast.success(`Supplier Provider '${newProviderForm.name}' configured with ${newProviderForm.margin_percentage}% profit margin!`);
      setNewProviderForm({
        name: "",
        api_url: "https://provider.com/api/v2",
        api_key: "",
        margin_percentage: "30.00",
        is_active: true,
      });
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to save supplier provider.");
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newServiceForm.name.trim()) {
      toast.error("Service name is required.");
      return;
    }
    try {
      await createService(newServiceForm);
      toast.success(`Service '${newServiceForm.name}' added successfully!`);
      setNewServiceForm({
        platform: "Instagram",
        category: "Followers",
        name: "",
        rate_per_1k: "1500.00",
        badge: "Popular",
        description: "",
      });
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to create service.");
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!confirm(`Are you sure you want to delete service '${name}'?`)) return;
    try {
      await deleteService(id);
      toast.success(`Service '${name}' deleted successfully.`);
      setServicesList((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast.error(err.message || "Failed to delete service.");
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newAccountForm.name.trim()) {
      toast.error("Account title is required.");
      return;
    }
    try {
      await createAccountItem(newAccountForm);
      toast.success(`Account '${newAccountForm.name}' added to inventory!`);
      setNewAccountForm({
        platform: "Instagram",
        category: "Verified Account",
        name: "",
        followers: "10,000",
        year: 2022,
        flag: "USA 🇺🇸",
        price: "25000.00",
        badge: "OG Email Included",
        description: "2FA active with full email login credentials.",
      });
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to add account item.");
    }
  };

  const handleDeleteAccount = async (id, name) => {
    if (!confirm(`Are you sure you want to delete account listing '${name}'?`)) return;
    try {
      await deleteAccountItem(id);
      toast.success(`Account '${name}' deleted successfully.`);
      setAccountsList((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err.message || "Failed to delete account listing.");
    }
  };

  const handleSaveBankConfig = async (e) => {
    e.preventDefault();
    setSavingBankConfig(true);
    try {
      const res = await updatePaymentConfig(bankConfigForm);
      toast.success(res.message || "Live payment and bank settings updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update payment settings.");
    } finally {
      setSavingBankConfig(false);
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

      {/* PROMINENT LIVE BANK & PAYMENT SETTINGS SECTION */}
      <Card className="border-2 border-emerald-500/50 bg-slate-950/90 shadow-2xl">
        <CardHeader className="border-b border-emerald-500/20 bg-emerald-500/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg font-extrabold text-foreground flex items-center gap-2">
                  <span>Live Bank Account & Payment Gateway Settings</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30 font-mono">
                    LIVE CONFIG
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Set your bank name, account number, and account name below. These details will be displayed to all customers when funding their wallets or making direct bank transfers.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSaveBankConfig} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Bank Name</label>
              <Input
                placeholder="e.g. Moniepoint / GTBank / Kuda"
                value={bankConfigForm.bank_name}
                onChange={(e) => setBankConfigForm({ ...bankConfigForm, bank_name: e.target.value })}
                className="bg-slate-900 border-slate-700 text-xs font-semibold text-foreground focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Account Name</label>
              <Input
                placeholder="e.g. HopeSocial Ltd"
                value={bankConfigForm.account_name}
                onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_name: e.target.value })}
                className="bg-slate-900 border-slate-700 text-xs font-semibold text-foreground focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Account Number</label>
              <Input
                placeholder="e.g. 2034829102"
                value={bankConfigForm.account_number}
                onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_number: e.target.value })}
                className="bg-slate-900 border-slate-700 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500 tracking-wider"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Flutterwave Public Key</label>
              <Input
                placeholder="FLWPUBK_LIVE-..."
                value={bankConfigForm.flutterwave_public_key}
                onChange={(e) => setBankConfigForm({ ...bankConfigForm, flutterwave_public_key: e.target.value })}
                className="bg-slate-900 border-slate-700 text-xs font-mono text-foreground focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Flutterwave Secret Key</label>
              <Input
                type="password"
                placeholder="FLWSECK_LIVE-..."
                value={bankConfigForm.flutterwave_secret_key}
                onChange={(e) => setBankConfigForm({ ...bankConfigForm, flutterwave_secret_key: e.target.value })}
                className="bg-slate-900 border-slate-700 text-xs font-mono text-foreground focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingBankConfig}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold gap-2 text-xs shadow-lg shadow-emerald-500/20 py-2.5 px-5"
              >
                {savingBankConfig ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Save & Publish Live Payment Details</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Admin Portal Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 max-w-full bg-muted/50 p-1 rounded-xl gap-1">
          <TabsTrigger value="overview" className="text-xs font-semibold flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="manage-services" className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" /> Services ({servicesList.length})
          </TabsTrigger>
          <TabsTrigger value="manage-accounts" className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Accounts ({accountsList.length})
          </TabsTrigger>
          <TabsTrigger value="supplier-apis" className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Supplier APIs
          </TabsTrigger>
          <TabsTrigger value="bank-settings" className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5" /> Bank Settings
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs font-semibold flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" /> Orders ({adminOrders.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs font-semibold flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs font-semibold flex items-center gap-1.5 relative">
            <CreditCard className="h-3.5 w-3.5" /> Payments
            {pendingDepositsCount > 0 && (
              <span className="ml-1 rounded-full bg-destructive text-destructive-foreground px-1.5 py-0.2 text-[10px] font-bold">
                {pendingDepositsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tickets" className="text-xs font-semibold flex items-center gap-1.5 relative">
            <MessageSquare className="h-3.5 w-3.5" /> Support
            {openTicketsCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 text-black px-1.5 py-0.2 text-[10px] font-bold">
                {openTicketsCount}
              </span>
            )}
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

            {/* Live Payment & Bank Details Editor Card */}
            <Card className="border-emerald-500/30 bg-card md:col-span-3">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-emerald-400">
                  <CreditCard className="h-5 w-5 text-emerald-400" /> Live Bank Account & Payment Gateway Settings
                </CardTitle>
                <CardDescription>
                  Update your real bank transfer account details and Flutterwave keys here. Changes apply immediately live across the entire marketplace for all users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveBankConfig} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Bank Name</label>
                    <Input
                      placeholder="e.g. Moniepoint / GTBank / Kuda"
                      value={bankConfigForm.bank_name}
                      onChange={(e) => setBankConfigForm({ ...bankConfigForm, bank_name: e.target.value })}
                      className="bg-muted/40 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Account Name</label>
                    <Input
                      placeholder="e.g. HopeSocial Ltd"
                      value={bankConfigForm.account_name}
                      onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_name: e.target.value })}
                      className="bg-muted/40 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Account Number</label>
                    <Input
                      placeholder="e.g. 2034829102"
                      value={bankConfigForm.account_number}
                      onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_number: e.target.value })}
                      className="bg-muted/40 text-xs font-mono font-bold text-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Flutterwave Public Key</label>
                    <Input
                      placeholder="FLWPUBK_LIVE-..."
                      value={bankConfigForm.flutterwave_public_key}
                      onChange={(e) => setBankConfigForm({ ...bankConfigForm, flutterwave_public_key: e.target.value })}
                      className="bg-muted/40 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={savingBankConfig}
                      className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2 text-xs shadow-md"
                    >
                      {savingBankConfig ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>Save & Publish Live Payment Details</span>
                    </Button>
                  </div>
                </form>
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

        {/* MANAGE SMM SERVICES TAB */}
        <TabsContent value="manage-services" className="space-y-6">
          {/* Add New Service Form Card */}
          <Card className="border-emerald-500/40 bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-400">
                <Plus className="h-4 w-4" /> Add New Social Media Service
              </CardTitle>
              <CardDescription className="text-xs">
                Create new automated growth services (Followers, Likes, Views). New services appear immediately in your Social Marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateService} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Platform</label>
                  <select
                    value={newServiceForm.platform}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, platform: e.target.value })}
                    className="w-full rounded-md border border-border bg-slate-900 px-3 py-2 text-xs text-foreground focus:border-emerald-500"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={newServiceForm.category}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, category: e.target.value })}
                    className="w-full rounded-md border border-border bg-slate-900 px-3 py-2 text-xs text-foreground focus:border-emerald-500"
                  >
                    <option value="Followers">Followers</option>
                    <option value="Likes">Likes</option>
                    <option value="Views">Views</option>
                    <option value="Comments">Comments</option>
                    <option value="Subscribers">Subscribers</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Service Name</label>
                  <Input
                    placeholder="e.g. Instagram Followers — High Quality"
                    value={newServiceForm.name}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                    className="bg-slate-900 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Rate Per 1,000 Items (₦)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1500.00"
                    value={newServiceForm.rate_per_1k}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, rate_per_1k: e.target.value })}
                    className="bg-slate-900 text-xs font-mono font-bold text-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Badge Tag</label>
                  <Input
                    placeholder="e.g. Popular, Best, Fast, Instant"
                    value={newServiceForm.badge}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, badge: e.target.value })}
                    className="bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Description</label>
                  <Input
                    placeholder="e.g. High retention profiles, start 0-1h"
                    value={newServiceForm.description}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                    className="bg-slate-900 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs gap-1.5 shadow-md">
                    <Plus className="h-4 w-4" /> Add Service to Marketplace
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Active Services List Table */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Active Services Inventory ({servicesList.length})</CardTitle>
                <CardDescription className="text-xs">Manage or delete services. Deleting an item removes it from user view immediately.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rate / 1k</TableHead>
                      <TableHead>Badge</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicesList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                          No services found in database. Add your first service above!
                        </TableCell>
                      </TableRow>
                    ) : (
                      servicesList.map((svc) => (
                        <TableRow key={svc.id}>
                          <TableCell className="font-bold text-xs">{svc.platform}</TableCell>
                          <TableCell className="font-semibold text-xs text-foreground">{svc.name}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-[10px]">{svc.category}</Badge></TableCell>
                          <TableCell className="font-mono text-xs font-bold text-emerald-400">₦{parseFloat(svc.rate_per_1k || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">{svc.badge || "Standard"}</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="xs"
                              onClick={() => handleDeleteService(svc.id, svc.name)}
                              className="cursor-pointer gap-1 text-[11px]"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
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

        {/* MANAGE AGED ACCOUNTS TAB */}
        <TabsContent value="manage-accounts" className="space-y-6">
          {/* Add New Account Form Card */}
          <Card className="border-cyan-500/40 bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-cyan-400">
                <Plus className="h-4 w-4" /> Add Aged Account to Inventory
              </CardTitle>
              <CardDescription className="text-xs">
                Add verified aged accounts (Instagram, Twitter, TikTok) for instant customer purchase and credential download.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccount} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Platform</label>
                  <select
                    value={newAccountForm.platform}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, platform: e.target.value })}
                    className="w-full rounded-md border border-border bg-slate-900 px-3 py-2 text-xs text-foreground focus:border-cyan-500"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Account Title / Handle</label>
                  <Input
                    placeholder="e.g. Instagram Aged Account (2020)"
                    value={newAccountForm.name}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                    className="bg-slate-900 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Followers Count</label>
                  <Input
                    placeholder="e.g. 12,500 Followers"
                    value={newAccountForm.followers}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, followers: e.target.value })}
                    className="bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Year Created</label>
                  <Input
                    type="number"
                    placeholder="2020"
                    value={newAccountForm.year}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, year: parseInt(e.target.value) || 2022 })}
                    className="bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Country Flag</label>
                  <select
                    value={newAccountForm.flag}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, flag: e.target.value })}
                    className="w-full rounded-md border border-border bg-slate-900 px-3 py-2 text-xs text-foreground focus:border-cyan-500"
                  >
                    <option value="USA 🇺🇸">USA 🇺🇸</option>
                    <option value="UK 🇬🇧">UK 🇬🇧</option>
                    <option value="Nigeria 🇳🇬">Nigeria 🇳🇬</option>
                    <option value="Europe 🇪🇺">Europe 🇪🇺</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Price (₦)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25000.00"
                    value={newAccountForm.price}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, price: e.target.value })}
                    className="bg-slate-900 text-xs font-mono font-bold text-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Badge Tag</label>
                  <Input
                    placeholder="e.g. OG Email Included, Verified, 2FA Attached"
                    value={newAccountForm.badge}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, badge: e.target.value })}
                    className="bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Account Deliverable Specs / Credentials</label>
                  <Input
                    placeholder="e.g. username: ig_pro_2020 | pass: secretPass | email: og@mail.com"
                    value={newAccountForm.description}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, description: e.target.value })}
                    className="bg-slate-900 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
                  <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs gap-1.5 shadow-md">
                    <Plus className="h-4 w-4" /> Add Aged Account to Directory
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Active Aged Accounts List Table */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Aged Accounts Inventory ({accountsList.length})</CardTitle>
                <CardDescription className="text-xs">Manage active account listings. Deleting an account removes it from public sale.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Followers / Year</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                          No aged accounts in inventory. Add your first account item above!
                        </TableCell>
                      </TableRow>
                    ) : (
                      accountsList.map((acc) => (
                        <TableRow key={acc.id}>
                          <TableCell className="font-bold text-xs">{acc.platform}</TableCell>
                          <TableCell className="font-semibold text-xs text-foreground">{acc.name}</TableCell>
                          <TableCell className="text-xs">{acc.followers} · ({acc.year})</TableCell>
                          <TableCell className="text-xs">{acc.flag}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-cyan-400">₦{parseFloat(acc.price || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="xs"
                              onClick={() => handleDeleteAccount(acc.id, acc.name)}
                              className="cursor-pointer gap-1 text-[11px]"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
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

        {/* SUPPLIER APIS & PROFIT MARGINS TAB */}
        <TabsContent value="supplier-apis" className="space-y-6">
          <Card className="border-amber-500/40 bg-card shadow-xl">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-400">
                <RefreshCw className="h-4 w-4" /> Add External Supplier API & Set Profit Margin Markup
              </CardTitle>
              <CardDescription className="text-xs">
                Connect external SMM provider APIs (JAP, Peakerr, Secsers, SMMFollows) and set your automated percentage profit margin markup.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProvider} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Supplier Provider Name</label>
                  <Input
                    placeholder="e.g. JustAnotherPanel / Peakerr"
                    value={newProviderForm.name}
                    onChange={(e) => setNewProviderForm({ ...newProviderForm, name: e.target.value })}
                    className="bg-slate-900 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">API v2 Endpoint URL</label>
                  <Input
                    placeholder="https://provider.com/api/v2"
                    value={newProviderForm.api_url}
                    onChange={(e) => setNewProviderForm({ ...newProviderForm, api_url: e.target.value })}
                    className="bg-slate-900 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">API Key</label>
                  <Input
                    type="password"
                    placeholder="Supplier Secret API Key"
                    value={newProviderForm.api_key}
                    onChange={(e) => setNewProviderForm({ ...newProviderForm, api_key: e.target.value })}
                    className="bg-slate-900 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-400">Profit Margin Markup (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="30.00"
                    value={newProviderForm.margin_percentage}
                    onChange={(e) => setNewProviderForm({ ...newProviderForm, margin_percentage: e.target.value })}
                    className="bg-slate-900 text-xs font-mono font-bold text-amber-400 focus:border-amber-500"
                  />
                  <p className="text-[10px] text-muted-foreground">e.g. 40.00 adds a 40% automated profit margin to supplier prices.</p>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2 border-t border-border/40">
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-1.5 shadow-md">
                    <Plus className="h-4 w-4" /> Save Supplier API & Profit Margin
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Configured Supplier APIs Table */}
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Configured Supplier API Integrations ({providersList.length})</CardTitle>
              <CardDescription className="text-xs">Connected providers available for automated order routing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider Name</TableHead>
                      <TableHead>API Endpoint</TableHead>
                      <TableHead>Automated Profit Markup</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providersList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                          No external supplier APIs connected yet. Connect your first SMM provider above!
                        </TableCell>
                      </TableRow>
                    ) : (
                      providersList.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-bold text-xs">{p.name}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{p.api_url}</TableCell>
                          <TableCell><Badge className="bg-amber-500/20 text-amber-400 font-mono text-xs border-amber-500/30">+{p.margin_percentage}% Profit Margin</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">{p.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BANK & PAYMENT SETTINGS TAB */}
        <TabsContent value="bank-settings" className="space-y-4">
          <Card className="border-emerald-500/40 bg-card/95 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <CreditCard className="h-5 w-5 text-emerald-400" /> Live Bank Account & Payment Gateway Settings
              </CardTitle>
              <CardDescription>
                Fill in your bank account details below. When customers click "Direct Bank Transfer" or "Wallet Top-up", these details will be displayed for them to transfer funds into your bank account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveBankConfig} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Bank Name</label>
                  <Input
                    placeholder="e.g. Moniepoint / GTBank / Kuda"
                    value={bankConfigForm.bank_name}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, bank_name: e.target.value })}
                    className="bg-muted/40 text-sm font-semibold"
                  />
                  <p className="text-[10px] text-muted-foreground">The name of your bank institution.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Account Name</label>
                  <Input
                    placeholder="e.g. HopeSocial Ltd"
                    value={bankConfigForm.account_name}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_name: e.target.value })}
                    className="bg-muted/40 text-sm font-semibold"
                  />
                  <p className="text-[10px] text-muted-foreground">The legal name on your bank account.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Account Number</label>
                  <Input
                    placeholder="e.g. 2034829102"
                    value={bankConfigForm.account_number}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_number: e.target.value })}
                    className="bg-muted/40 text-sm font-mono font-bold text-emerald-400 tracking-wider"
                  />
                  <p className="text-[10px] text-muted-foreground">10-digit account number customers copy.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Flutterwave Public Key</label>
                  <Input
                    placeholder="FLWPUBK_LIVE-..."
                    value={bankConfigForm.flutterwave_public_key}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, flutterwave_public_key: e.target.value })}
                    className="bg-muted/40 text-sm font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">Flutterwave API key for card checkout.</p>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-3 border-t border-border/40">
                  <Button
                    type="submit"
                    disabled={savingBankConfig}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold gap-2 text-sm shadow-lg shadow-emerald-500/20 py-5 px-6"
                  >
                    {savingBankConfig ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span>Save & Publish Live Payment Details</span>
                  </Button>
                </div>
              </form>
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
                            <TableCell className="max-w-[260px]">
                              <div className="flex flex-col min-w-0">
                                <span className="truncate text-xs font-semibold text-foreground">
                                  {o.service_name || o.service || "Social Media Service"}
                                </span>
                                <span className="text-[11px] text-emerald-400 font-mono font-medium">
                                  {isAccount
                                    ? "1x Account Credentials"
                                    : `${(o.quantity || 1000).toLocaleString()} ${
                                        sName.includes("like")
                                          ? "Likes"
                                          : sName.includes("follower")
                                          ? "Followers"
                                          : sName.includes("view")
                                          ? "Views"
                                          : sName.includes("subscriber")
                                          ? "Subscribers"
                                          : sName.includes("member")
                                          ? "Members"
                                          : "Items"
                                      }`}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[160px] font-mono text-[11px] text-muted-foreground truncate">
                              {o.target_link || "N/A"}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-semibold">{(o.quantity || 1).toLocaleString()}</TableCell>
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

        {/* 3. PAYMENT CONFIRMATIONS & GATEWAY SETTINGS TAB */}
        <TabsContent value="payments" className="space-y-4">
          {/* Live Payment & Bank Details Editor Card */}
          <Card className="border-emerald-500/40 bg-card/95 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-emerald-400">
                <CreditCard className="h-5 w-5 text-emerald-400" /> Live Bank Account & Payment Gateway Settings
              </CardTitle>
              <CardDescription>
                Update your real bank transfer account details and Flutterwave keys here. Changes apply immediately live across the entire marketplace for all users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveBankConfig} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Bank Name</label>
                  <Input
                    placeholder="e.g. Moniepoint / GTBank / Kuda"
                    value={bankConfigForm.bank_name}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, bank_name: e.target.value })}
                    className="bg-muted/40 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Account Name</label>
                  <Input
                    placeholder="e.g. HopeSocial Ltd"
                    value={bankConfigForm.account_name}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_name: e.target.value })}
                    className="bg-muted/40 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Account Number</label>
                  <Input
                    placeholder="e.g. 2034829102"
                    value={bankConfigForm.account_number}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_number: e.target.value })}
                    className="bg-muted/40 text-xs font-mono font-bold text-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Flutterwave Public Key</label>
                  <Input
                    placeholder="FLWPUBK_LIVE-..."
                    value={bankConfigForm.flutterwave_public_key}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, flutterwave_public_key: e.target.value })}
                    className="bg-muted/40 text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={savingBankConfig}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2 text-xs shadow-md"
                  >
                    {savingBankConfig ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>Save & Publish Live Payment Details</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

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
