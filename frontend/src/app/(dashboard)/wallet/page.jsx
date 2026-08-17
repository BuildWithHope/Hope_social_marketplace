"use client";

import { useState, useEffect } from "react";
import { CreditCard, Bitcoin, Landmark, Wallet, Plus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { depositWallet, verifyFlutterwavePayment, getUserProfile, getDashboardStats, getTransactions } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected-route";

const methods = [
  { name: "Bank Transfer", desc: "Instant local NGN transfer · 0% fee", icon: Landmark },
  { name: "Flutterwave", desc: "Cards & Mobile Money", icon: CreditCard },
  { name: "Paystack", desc: "Debit Cards & USSD", icon: CreditCard },
  { name: "Crypto (USDT)", desc: "TRC-20 / Binance Pay", icon: Bitcoin },
];

export default function WalletPage() {
  const [amount, setAmount] = useState("10000");
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [realTransactions, setRealTransactions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchWalletData = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        const [uData, sData, txData] = await Promise.all([
          getUserProfile().catch(() => null),
          getDashboardStats().catch(() => null),
          getTransactions().catch(() => []),
        ]);
        setUser(uData);
        setStats(sData);
        setRealTransactions(txData || []);
      }
    } catch (err) {
      // Fallback
    }
  };

  useEffect(() => {
    fetchWalletData();

    // Dynamically inject Flutterwave Checkout script
    if (typeof window !== "undefined" && !window.FlutterwaveCheckout) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const balanceVal = stats?.wallet_balance ?? user?.wallet_balance ?? 0;
  const formattedBalance = `₦${parseFloat(balanceVal || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  const totalSpentVal = parseFloat(stats?.total_spent || 0);
  const formattedSpent = `₦${totalSpentVal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  const totalDepositedVal = parseFloat(balanceVal) + totalSpentVal;
  const formattedDeposited = `₦${totalDepositedVal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const deposits = realTransactions.filter((t) => (t.transaction_type === "Deposit" || t.type === "Deposit")).slice(0, 10);
  const withdrawals = realTransactions.filter((t) => (t.transaction_type === "Withdrawal" || t.type === "Withdrawal")).slice(0, 6);

  const [selectedMethod, setSelectedMethod] = useState("Bank Transfer");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [depositRef, setDepositRef] = useState("");

  const openDepositModal = () => {
    setDepositRef(`DEP-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsDepositModalOpen(true);
  };

  const copyText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "acc") {
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
    toast.info("Copied to clipboard!");
  };

  const handleFlutterwavePayment = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-demo-key";
    const txRef = `FLW-${Date.now()}`;

    if (!window.FlutterwaveCheckout) {
      toast.error("Flutterwave SDK loading. Please try again in a few seconds.");
      return;
    }

    setSubmitting(true);
    try {
      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: txRef,
        amount: val,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        customer: {
          email: user?.email || "customer@hopesocial.com",
          name: user?.username || "Customer",
        },
        customizations: {
          title: "HopeSocial Wallet Top-Up",
          description: `Fund ₦${val.toLocaleString()} to your marketplace wallet`,
          logo: "https://checkout.flutterwave.com/assets/img/flw-logo.png",
        },
        callback: async (response) => {
          try {
            const verifyRes = await verifyFlutterwavePayment({
              transaction_id: response.transaction_id,
              tx_ref: response.tx_ref || txRef,
              amount: val,
            });
            toast.success(verifyRes.message || `Successfully deposited ₦${val.toLocaleString()} via Flutterwave!`);
            setIsDepositModalOpen(false);
            fetchWalletData();
          } catch (err) {
            toast.error(err.message || "Payment verification failed.");
          } finally {
            setSubmitting(false);
          }
        },
        onclose: () => {
          setSubmitting(false);
        },
      });
    } catch (err) {
      setSubmitting(false);
      toast.error("Could not initialize Flutterwave Checkout.");
    }
  };

  const handleDepositSubmit = async (methodName) => {
    const activeMethod = methodName || selectedMethod;
    if (activeMethod === "Flutterwave") {
      handleFlutterwavePayment();
      return;
    }

    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await depositWallet({ amount: val, method: activeMethod });
      toast.success(res.message || `Deposit request of ₦${val.toLocaleString()} via ${activeMethod} submitted! Awaiting admin approval.`);
      setIsDepositModalOpen(false);
      fetchWalletData();
    } catch (err) {
      toast.error(err.message || "Deposit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div>
        <PageHeader
          title="Wallet"
          description="Fund, spend and manage your marketplace balance in Naira (₦)."
          actions={
            <Button size="lg" onClick={openDepositModal} className="font-semibold shadow-md bg-emerald-500 hover:bg-emerald-600 text-black gap-2">
              <Plus className="h-4 w-4" /> Add funds
            </Button>
          }
        />

        {/* Enhanced Payment Gateway Modal */}
        <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                <span>Fund Wallet — Payment Options</span>
              </DialogTitle>
              <DialogDescription>
                Enter amount and transfer to the account details below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Deposit Amount (₦)</label>
                <Input
                  placeholder="Amount in Naira (e.g. 10000)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-muted/40 font-mono text-base font-bold text-emerald-400"
                />
              </div>

              {/* Payment Method Selector Grid */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Select Payment Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  {methods.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedMethod(m.name)}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                        selectedMethod === m.name
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <m.icon className={`h-5 w-5 ${selectedMethod === m.name ? "text-emerald-400" : "text-primary"}`} />
                      <div className="mt-2 text-xs font-bold">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Instructions Box */}
              {selectedMethod === "Flutterwave" ? (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-sky-400 font-semibold uppercase tracking-wider text-[11px]">
                    <span>Flutterwave Gateway</span>
                    <Badge variant="outline" className="border-sky-500/40 text-sky-400 bg-sky-500/20">Instant Auto-Credit</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Pay securely using Debit Card, Bank Transfer, or USSD via Flutterwave. Your wallet will be credited automatically upon payment completion.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
                    <span>Bank Transfer Details</span>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">Manual Approval</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-card p-2.5 border border-border/40">
                      <div className="text-muted-foreground text-[10px]">Bank Name</div>
                      <div className="font-bold text-xs text-foreground mt-0.5">Kuda Bank / GTBank</div>
                    </div>
                    <div className="rounded-lg bg-card p-2.5 border border-border/40">
                      <div className="text-muted-foreground text-[10px]">Account Name</div>
                      <div className="font-bold text-xs text-foreground mt-0.5">HopeSocial Ltd</div>
                    </div>
                  </div>

                  {/* Account Number Box */}
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Account Number</div>
                      <div className="font-bold font-mono text-lg text-emerald-400">2034829102</div>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      className="gap-1 text-xs"
                      onClick={() => copyText("2034829102", "acc")}
                    >
                      <span>{copiedAcc ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>

                  {/* Deposit Reference */}
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Reference Code</div>
                      <div className="font-bold font-mono text-xs text-foreground">{depositRef}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="gap-1 text-xs text-muted-foreground"
                      onClick={() => copyText(depositRef, "ref")}
                    >
                      <span>{copiedRef ? "Copied" : "Copy Ref"}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button
              className={`w-full font-bold py-5 shadow-md gap-2 cursor-pointer ${
                selectedMethod === "Flutterwave"
                  ? "bg-sky-500 hover:bg-sky-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-black"
              }`}
              onClick={() => handleDepositSubmit(selectedMethod)}
              disabled={submitting}
            >
              <span>
                {submitting
                  ? "Processing..."
                  : selectedMethod === "Flutterwave"
                  ? `Pay ₦${parseFloat(amount || 0).toLocaleString()} via Flutterwave`
                  : `I Have Completed Transfer (₦${parseFloat(amount || 0).toLocaleString()})`}
              </span>
            </Button>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Available balance" value={formattedBalance} delta={balanceVal > 0 ? "Active Balance" : "₦0.00 balance"} icon={Wallet} tone="primary" />
          <StatCard label="Total spent" value={formattedSpent} icon={ArrowDownRight} />
          <StatCard label="Total deposited" value={formattedDeposited} icon={ArrowUpRight} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Recent deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deposits.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No deposits recorded yet. Click "Add funds" above to make your first deposit.
                  </div>
                ) : (
                  deposits.map((t) => (
                    <div key={t.id || t.reference} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3 text-sm">
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">{t.reference || t.id} · {t.method || t.payment_method}</div>
                        <div className="font-semibold text-emerald-400">+₦{parseFloat(t.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <StatusBadge status={t.status || "Completed"} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Recent withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {withdrawals.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No withdrawals recorded yet.
                  </div>
                ) : (
                  withdrawals.map((t) => (
                    <div key={t.id || t.reference} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3 text-sm">
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">{t.reference || t.id} · {t.method || t.payment_method}</div>
                        <div className="font-semibold text-rose-400">-₦{parseFloat(t.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <StatusBadge status={t.status || "Completed"} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
