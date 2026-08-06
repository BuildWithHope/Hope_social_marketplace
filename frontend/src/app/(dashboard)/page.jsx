"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet, ShoppingBag, Loader2, CheckCircle2, XCircle,
  Plus, ArrowRight, TrendingUp, Sparkles, Headphones,
} from "lucide-react";
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
import { getDashboardStats, getUserProfile } from "@/lib/api";

const topServicesWithColors = [
  { name: "IG Followers", v: 42, color: "#E1306C" },
  { name: "TikTok Views", v: 28, color: "#00F2FE" },
  { name: "YT Subscribers", v: 17, color: "#FF0000" },
  { name: "Telegram Members", v: 13, color: "#0088CC" },
];

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          const [uData, sData] = await Promise.all([
            getUserProfile().catch(() => null),
            getDashboardStats().catch(() => null),
          ]);
          setUser(uData);
          setStats(sData);
        }
      } catch (err) {
        // Fallback
      }
    };
    loadData();
  }, []);

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

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-border/60 bg-card">
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
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.slice(0, 7).map((o) => {
                    const Icon = platformIcons[o.platform] || Sparkles;
                    return (
                      <TableRow key={o.id} className="border-border/40 hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">{o.id}</TableCell>
                        <TableCell className="max-w-[280px]">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate text-xs font-medium">{o.service}</span>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={o.status} /></TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-xs">₦{o.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{new Date(o.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card flex flex-col justify-between p-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Direct Supplier API Enabled
            </div>
            <h3 className="text-xl font-bold tracking-tight">Need a custom SMM reseller key?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect your SMM Panel directly via standard API v2 to automate reseller order fulfillment and profit margin payouts.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild><Link href="/api-docs">Explore API Docs</Link></Button>
            <Button variant="outline" asChild><Link href="/support"><Headphones className="h-4 w-4 mr-1.5" /> Support</Link></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
