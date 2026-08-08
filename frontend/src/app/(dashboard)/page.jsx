"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet, ShoppingBag, Loader2, CheckCircle2, XCircle,
  Plus, ArrowRight, TrendingUp, Sparkles, Headphones, Download, FileText
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { recentOrders, monthlySpending as mockMonthlySpending, topServices, platformIcons } from "@/data/mock";
import { getDashboardStats, getUserProfile, getOrders } from "@/lib/api";
import { LandingPage } from "@/components/landing/landing-page";

const topServicesWithColors = [
  { name: "IG Followers", v: 42, color: "#E1306C" },
  { name: "TikTok Views", v: 28, color: "#00F2FE" },
  { name: "YT Subscribers", v: 17, color: "#FF0000" },
  { name: "Telegram Members", v: 13, color: "#0088CC" },
];

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
            .badge { display: inline-block; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
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

export default function RootPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return;
    }

    setIsAuth(true);
    Promise.all([
      getUserProfile().catch(() => null),
      getDashboardStats().catch(() => null),
      getOrders().catch(() => []),
    ]).then(([uData, sData, oData]) => {
      setUser(uData);
      setStats(sData);
      setOrders(oData || []);
    });
  }, []);

  if (!isAuth) {
    return <LandingPage />;
  }

  const balanceVal = stats?.wallet_balance ?? user?.wallet_balance ?? 0;
  const formattedBalance = `₦${parseFloat(balanceVal || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  const displayName = user?.first_name || user?.username || "Guest";

  const totalOrders = stats?.total_orders ?? 0;
  const activeOrders = stats?.active_orders ?? 0;
  const completedOrders = stats?.completed_orders ?? 0;
  const failedOrders = stats?.failed_orders ?? 0;
  const chartData = stats?.monthly_spending?.map((m) => ({ m: m.month, v: m.amount })) || mockMonthlySpending;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Here's what's happening across your marketplace today."
        actions={
          <>
            <Button variant="outline" asChild><Link href="/transactions">View transactions</Link></Button>
            <Button asChild><Link href="/wallet"><Plus className="h-4 w-4" /> Add funds</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Wallet Balance" value={formattedBalance} delta={balanceVal > 0 ? "Active Balance" : "₦0.00 balance"} icon={Wallet} tone="primary" />
        <StatCard label="Total Orders" value={totalOrders.toString()} icon={ShoppingBag} />
        <StatCard label="Active Orders" value={activeOrders.toString()} icon={Loader2} />
        <StatCard label="Completed" value={completedOrders.toString()} icon={CheckCircle2} tone="primary" />
        <StatCard label="Failed" value={failedOrders.toString()} icon={XCircle} tone="danger" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-border/60 bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Monthly spending</CardTitle>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
            <div className="text-sm text-muted-foreground">Total <span className="text-emerald-400 font-bold">₦{parseFloat(stats?.total_spent || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span></div>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                    <stop offset="70%" stopColor="#22c55e" stopOpacity={0.10} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v / 1000}k`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-emerald-500/30 bg-card/95 backdrop-blur p-3 shadow-xl text-xs">
                          <div className="font-semibold text-muted-foreground">{payload[0].payload.m}</div>
                          <div className="text-emerald-400 font-bold text-sm mt-0.5">₦{payload[0].value.toLocaleString()}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={3} fill="url(#monthlyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Most ordered
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServicesWithColors} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md">
                          <span className="font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</span>
                          <span className="ml-2 font-mono font-bold text-foreground">{payload[0].value}% orders</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="v" radius={[0, 6, 6, 0]}>
                  {topServicesWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="border-border/60 bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/transactions">View all <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Item / Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Account Deliverables</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-xs font-medium">
                        No recent orders placed yet. Browse the marketplace to place your first order.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.slice(0, 7).map((o) => {
                      const Icon = platformIcons[o.platform || o.service_platform] || TrendingUp;
                      const sName = (o.service_name || o.service || "").toLowerCase();
                      const tLink = (o.target_link || "").toLowerCase();
                      const isAccount = sName.includes("account") || sName.includes("aged") || tLink.includes("account");

                      return (
                        <TableRow key={o.id || o.order_id} className="border-border/40 hover:bg-muted/30">
                          <TableCell className="font-mono text-xs text-muted-foreground">#{o.id || o.order_id}</TableCell>
                          <TableCell className="max-w-[280px]">
                            <div className="flex items-center gap-2.5">
                              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="truncate text-xs font-medium">{o.service_name || o.service || "Social Service"}</span>
                            </div>
                          </TableCell>
                          <TableCell><StatusBadge status={o.status || "Pending"} /></TableCell>
                          <TableCell className="text-right tabular-nums font-semibold text-xs">₦{parseFloat(o.total_amount || o.amount || o.total_price || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{o.date || o.created_at ? new Date(o.date || o.created_at).toLocaleDateString() : "Recently"}</TableCell>
                          <TableCell className="text-right">
                            {isAccount ? (
                              <Button
                                variant="outline"
                                size="xs"
                                className="h-7 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold gap-1.5 text-[11px]"
                                onClick={() => handleDownloadAccountFile(o)}
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Download</span>
                              </Button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-mono">Completed</span>
                            )}
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
      </div>
    </div>
  );
}
