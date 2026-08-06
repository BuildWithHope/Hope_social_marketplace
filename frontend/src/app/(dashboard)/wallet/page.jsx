"use client";

import { useState } from "react";
import { CreditCard, Bitcoin, Landmark, Wallet, Plus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { transactions as mockTransactions } from "@/data/mock";
import { depositWallet } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const methods = [
  { name: "Bank Transfer", desc: "Instant local NGN transfer · 0% fee", icon: Landmark },
  { name: "Flutterwave", desc: "Cards & Mobile Money", icon: CreditCard },
  { name: "Paystack", desc: "Debit Cards & USSD", icon: CreditCard },
  { name: "Crypto (USDT)", desc: "TRC-20 / Binance Pay", icon: Bitcoin },
];

export default function WalletPage() {
  const [amount, setAmount] = useState("10000");

  const deposits = mockTransactions.filter((t) => t.type === "Deposit").slice(0, 6);
  const withdrawals = mockTransactions.filter((t) => t.type === "Withdrawal").slice(0, 6);

  const handleDeposit = async (methodName) => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }
    try {
      toast.promise(
        depositWallet({ amount: val, method: methodName }),
        {
          loading: `Initiating ₦${val.toLocaleString()} deposit via ${methodName}...`,
          success: (res) => `Successfully deposited ₦${val.toLocaleString()}! New Balance: ₦${parseFloat(res.new_balance).toLocaleString()}`,
          error: (err) => err.message || "Deposit failed",
        }
      );
    } catch (err) {
      toast.success(`Deposit initiated via ${methodName}`, { description: `Amount: ₦${val.toLocaleString()}` });
    }
  };

  return (
    <div>
      <PageHeader
        title="Wallet"
        description="Fund, spend and manage your marketplace balance in Naira (₦)."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg"><Plus className="h-4 w-4" /> Add funds</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add funds to your wallet</DialogTitle>
                <DialogDescription>Enter deposit amount in Naira (₦) and choose payment method.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Deposit Amount (₦)</label>
                  <Input
                    placeholder="Amount in Naira (e.g. 10000)"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {methods.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => handleDeposit(m.name)}
                      className="flex flex-col items-start rounded-xl border border-border/60 p-3 text-left hover:border-primary hover:bg-muted/40 transition"
                    >
                      <m.icon className="h-5 w-5 text-primary" />
                      <div className="mt-2 text-xs font-bold">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value="₦1,284,900.00" delta="+₦120,000 this week" icon={Wallet} tone="primary" />
        <StatCard label="Total spent" value="₦12,350,000.00" icon={ArrowDownRight} />
        <StatCard label="Total deposited" value="₦13,634,900.00" icon={ArrowUpRight} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Recent deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deposits.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3 text-sm">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{t.id} · {t.method}</div>
                    <div className="font-semibold text-emerald-400">+₦{t.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Recent withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawals.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3 text-sm">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{t.id} · {t.method}</div>
                    <div className="font-semibold text-rose-400">-₦{t.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
