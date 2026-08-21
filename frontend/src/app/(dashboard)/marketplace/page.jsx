"use client";

import { useMemo, useState, useEffect, createElement } from "react";
import {
  Search, Filter, Sparkles, Zap, ShieldCheck, CheckCircle2, CreditCard,
  Building2, Smartphone, Wallet, Lock, Copy, Check, ShoppingBag, ArrowRight,
  Minus, Plus, ExternalLink
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { services as mockServices, platforms, platformIcons } from "@/data/mock";
import { placeOrder, getPaymentConfig, getUserProfile, getServices } from "@/lib/api";
import { toast } from "sonner";


// Platform Color System & Branding Styles
const platformStyles = {
  "Instagram": {
    badgeBg: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    iconBg: "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white shadow-pink-500/20",
    activePill: "bg-pink-500 text-white shadow-md shadow-pink-500/25",
  },
  "TikTok": {
    badgeBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    iconBg: "bg-gradient-to-tr from-cyan-500 to-pink-500 text-black font-bold shadow-cyan-500/20",
    activePill: "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/25",
  },
  "YouTube": {
    badgeBg: "bg-red-500/15 text-red-400 border-red-500/30",
    iconBg: "bg-red-600 text-white shadow-red-600/20",
    activePill: "bg-red-600 text-white shadow-md shadow-red-600/25",
  },
  "Twitter/X": {
    badgeBg: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    iconBg: "bg-slate-800 text-white border border-slate-700 shadow-slate-900/20",
    activePill: "bg-slate-700 text-white shadow-md",
  },
  "Telegram": {
    badgeBg: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    iconBg: "bg-sky-500 text-white shadow-sky-500/20",
    activePill: "bg-sky-500 text-white shadow-md shadow-sky-500/25",
  },
  "Discord": {
    badgeBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    iconBg: "bg-indigo-600 text-white shadow-indigo-500/20",
    activePill: "bg-indigo-600 text-white shadow-md shadow-indigo-500/25",
  },
  "LinkedIn": {
    badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    iconBg: "bg-blue-600 text-white shadow-blue-600/20",
    activePill: "bg-blue-600 text-white shadow-md shadow-blue-600/25",
  },
  "Snapchat": {
    badgeBg: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    iconBg: "bg-amber-400 text-black font-bold shadow-amber-400/20",
    activePill: "bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/25",
  },
  "Pinterest": {
    badgeBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    iconBg: "bg-rose-600 text-white shadow-rose-600/20",
    activePill: "bg-rose-600 text-white shadow-md shadow-rose-600/25",
  },
  "Facebook": {
    badgeBg: "bg-blue-600/15 text-blue-400 border-blue-600/30",
    iconBg: "bg-blue-600 text-white shadow-blue-600/20",
    activePill: "bg-blue-600 text-white shadow-md shadow-blue-600/25",
  },
};

export default function Marketplace() {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const perPage = 12;

  // Selected Order Modal State
  const [selectedService, setSelectedService] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1000);
  const [targetLink, setTargetLink] = useState("");

  // Payment Gateway Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Card Form State
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "", name: "" });

  const [paymentConfig, setPaymentConfig] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [dbServices, setDbServices] = useState(null);

  useEffect(() => {
    getPaymentConfig().then((cfg) => {
      if (cfg) setPaymentConfig(cfg);
    }).catch(() => null);

    getUserProfile().then((u) => {
      if (u) setUserProfile(u);
    }).catch(() => null);

    getServices().then((data) => {
      const list = Array.isArray(data) ? data : (data?.results || []);
      setDbServices(list);
    }).catch(() => {
      setDbServices(null);
    });
  }, []);

  const bankName = paymentConfig?.bank_name || process.env.NEXT_PUBLIC_BANK_NAME || "Moniepoint / GTBank";
  const accountName = paymentConfig?.account_name || process.env.NEXT_PUBLIC_ACCOUNT_NAME || "HopeSocial Ltd";
  const accountNumber = paymentConfig?.account_number || process.env.NEXT_PUBLIC_ACCOUNT_NUMBER || "2034829102";
  const flwPublicKey = paymentConfig?.flutterwave_public_key || process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-demo-key";

  const activeServices = dbServices !== null ? dbServices : mockServices;

  const filtered = useMemo(() => {
    let s = activeServices.filter((x) => {
      const matchPlatform = platform === "all" ||
        (x.platform && x.platform.toLowerCase() === platform.toLowerCase()) ||
        (x.category && x.category.toLowerCase().includes(platform.toLowerCase()));
      const matchQuery = q === "" ||
        x.name.toLowerCase().includes(q.toLowerCase()) ||
        (x.category && x.category.toLowerCase().includes(q.toLowerCase()));
      return matchPlatform && matchQuery;
    });
    const getRate = (item) => parseFloat(item.rate_per_1k || item.price || item.rate || 0);
    if (sort === "price-asc") s = [...s].sort((a, b) => getRate(a) - getRate(b));
    if (sort === "price-desc") s = [...s].sort((a, b) => getRate(b) - getRate(a));
    return s;
  }, [activeServices, q, platform, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openOrderModal = (service) => {
    const isAvailable = service.is_active !== false && service.inStock !== false && service.in_stock !== false;
    if (!isAvailable) {
      toast.error(`'${service.name}' is currently out of stock.`);
      return;
    }
    const defaultQty = service.min_order || service.min || 1000;
    setSelectedService(service);
    setOrderQuantity(defaultQty);
    setTargetLink(`https://${service.platform.toLowerCase()}.com/your_profile`);
  };

  const handleProceedToPayment = () => {
    if (!targetLink.trim()) {
      toast.error("Please enter your target profile or post link");
      return;
    }
    const rate = parseFloat(selectedService.rate_per_1k || selectedService.price || 1500);
    const totalAmount = (orderQuantity / 1000) * rate;
    const refCode = `HS-SVC-${Math.floor(100000 + Math.random() * 900000)}`;

    setCheckoutItem({
      title: selectedService.name,
      serviceId: selectedService.id || selectedService.name,
      platform: selectedService.platform,
      quantity: orderQuantity,
      targetLink: targetLink,
      unitRate: rate,
      totalAmount: totalAmount,
      reference: refCode,
    });

    setSelectedService(null);
    setIsPaymentModalOpen(true);
  };

  const handleCompletePayment = async (methodName) => {
    try {
      if (checkoutItem) {
        await placeOrder({
          service: checkoutItem.serviceId,
          quantity: checkoutItem.quantity,
          target_link: checkoutItem.targetLink,
          payment_method: methodName,
        });
      }
      toast.success(`Order for '${checkoutItem?.title}' placed via ${methodName}!`, {
        description: `Reference #${checkoutItem?.reference} · View order progress under Dashboard & Transactions.`,
      });
    } catch (err) {
      toast.error(err.message || "Failed to place order.");
    } finally {
      setIsPaymentModalOpen(false);
      setCheckoutItem(null);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "ref") {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
    toast.info("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Marketplace"
        description="Explore 100+ high-retention automated growth services across major social platforms."
      />

      {/* Platform Logo Quick-Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => { setPlatform("all"); setPage(1); }}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            platform === "all"
              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
              : "border border-border/60 bg-card/80 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>All Platforms</span>
          <span className="ml-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px]">{activeServices.length}</span>
        </button>

        {platforms.map((p) => {
          const Icon = platformIcons[p] || Sparkles;
          const style = platformStyles[p];
          const isSelected = platform === p;
          const count = activeServices.filter((s) =>
            (s.platform && s.platform.toLowerCase() === p.toLowerCase()) ||
            (s.category && s.category.toLowerCase().includes(p.toLowerCase()))
          ).length;

          return (
            <button
              key={p}
              onClick={() => { setPlatform(p); setPage(1); }}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? style?.activePill || "bg-primary text-primary-foreground shadow-md"
                  : "border border-border/60 bg-card/80 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {createElement(Icon, { className: "h-3.5 w-3.5" })}
              <span>{p}</span>
              <span className="ml-1 rounded-full bg-muted/40 px-1.5 py-0.5 text-[10px] opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Sorting Toolbar */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by service name, category, platform…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              className="pl-9 bg-muted/40"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-[180px] bg-muted/40">
              <SelectValue placeholder="Sort services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most popular</SelectItem>
              <SelectItem value="price-asc">Rate: low to high</SelectItem>
              <SelectItem value="price-desc">Rate: high to low</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Services Grid with Brand Logos */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {paged.map((s) => {
          const Icon = platformIcons[s.platform] || Sparkles;
          const style = platformStyles[s.platform] || {
            badgeBg: "bg-primary/15 text-primary border-primary/30",
            iconBg: "bg-primary text-primary-foreground",
          };
          const rate = parseFloat(s.rate_per_1k || s.price || 1500);
          const isAvailable = s.is_active !== false && s.inStock !== false && s.in_stock !== false;

          return (
            <Card
              key={s.id}
              className={`group relative overflow-hidden border-border/60 bg-card transition-all duration-200 flex flex-col justify-between ${
                isAvailable
                  ? "hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
                  : "opacity-60 grayscale-[25%] cursor-not-allowed bg-muted/20"
              }`}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  {/* Top Header: Platform Logo & In Stock Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${style.iconBg} shadow-md transition-transform group-hover:scale-105`}>
                        {createElement(Icon, { className: "h-6 w-6" })}
                      </div>
                      <div>
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${style.badgeBg}`}>
                          {s.platform}
                        </Badge>
                        <div className="mt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{s.category}</div>
                      </div>
                    </div>

                    <Badge className={isAvailable ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-destructive/15 text-red-400 border-destructive/30"}>
                      {isAvailable ? "In stock" : "Out of stock"}
                    </Badge>
                  </div>

                  {/* Service Title & Description */}
                  <h3 className="mt-4 text-base font-bold tracking-tight text-foreground line-clamp-1">{s.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{s.description}</p>

                  {/* Specs Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-border/40 bg-muted/20 p-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3 text-emerald-400" /> Delivery
                      </div>
                      <div className="mt-0.5 font-bold text-foreground">{s.delivery || "0–1 hour"}</div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-muted/20 p-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Min – Max
                      </div>
                      <div className="mt-0.5 font-bold text-foreground font-mono">
                        {(s.min_order || s.min || 10).toLocaleString()} – {(s.max_order || s.max || 100000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer: Rate & Order Action */}
                <div className="mt-5 flex items-end justify-between border-t border-border/40 pt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rate per 1,000</div>
                    <div className="text-xl font-extrabold text-emerald-400 font-mono">
                      ₦{rate.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!isAvailable}
                    className={`font-bold shadow-md gap-1.5 ${
                      isAvailable
                        ? "bg-emerald-500 hover:bg-emerald-600 text-black cursor-pointer"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                    onClick={() => isAvailable && openOrderModal(s)}
                  >
                    <span>{isAvailable ? "Order now" : "Out of stock"}</span>
                    {isAvailable && <ArrowRight className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} />
            </PaginationItem>
            {Array.from({ length: pages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(pages, p + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* ORDER CONFIGURATION MODAL */}
      {selectedService && (
        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl border-b border-border/40 pb-3">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span>Configure Order — {selectedService.name}</span>
              </DialogTitle>
              <DialogDescription>
                Set your target link and quantity before proceeding to payment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Target Link Input */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-400" /> Target Profile / Post URL
                </label>
                <Input
                  placeholder={`e.g. https://${selectedService.platform.toLowerCase()}.com/username`}
                  value={targetLink}
                  onChange={(e) => setTargetLink(e.target.value)}
                  className="mt-1 bg-muted/40 font-mono text-xs"
                />
              </div>

              {/* Quantity Selector */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-1">
                  <span>Select Quantity</span>
                  <span className="text-foreground font-mono">
                    Min: {(selectedService.min_order || selectedService.min || 100).toLocaleString()} · Max: {(selectedService.max_order || selectedService.max || 100000).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setOrderQuantity((q) => Math.max(selectedService.min_order || selectedService.min || 100, q - 500))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <Input
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(10, parseInt(e.target.value) || 0))}
                    className="text-center font-bold text-base font-mono bg-muted/30"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setOrderQuantity((q) => Math.min(selectedService.max_order || selectedService.max || 100000, q + 500))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <div>
                  <div className="text-xs text-muted-foreground">Total Price Calculation</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    ({orderQuantity.toLocaleString()} items @ ₦{parseFloat(selectedService.rate_per_1k || selectedService.price || 1500).toLocaleString()}/1k)
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  ₦{((orderQuantity / 1000) * parseFloat(selectedService.rate_per_1k || selectedService.price || 1500)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full sm:flex-1 border-border/60"
                onClick={() => setSelectedService(null)}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:flex-1 gap-2 font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-md shadow-emerald-500/20"
                onClick={handleProceedToPayment}
              >
                <CreditCard className="h-4 w-4" />
                <span>Proceed to Pay</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MULTI-OPTION PAYMENT GATEWAY MODAL */}
      {isPaymentModalOpen && checkoutItem && (
        <Dialog open={isPaymentModalOpen} onOpenChange={() => setIsPaymentModalOpen(false)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-xl border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  <span>Checkout — Choose Payment Method</span>
                </div>
              </DialogTitle>
              <DialogDescription>
                Select your preferred option to complete payment of <strong>₦{checkoutItem.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>
              </DialogDescription>
            </DialogHeader>

            {/* Order Brief Summary */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Service Order</div>
                <div className="font-bold text-sm text-foreground">{checkoutItem.title} ({checkoutItem.quantity.toLocaleString()} items)</div>
                <div className="text-xs font-mono text-muted-foreground truncate max-w-xs">{checkoutItem.targetLink}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Payable</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  ₦{checkoutItem.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Multi-Tab Payment Options */}
            <Tabs defaultValue="bank" className="w-full mt-2">
              <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1">
                <TabsTrigger value="bank" className="text-xs gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Transfer</span>
                </TabsTrigger>
                <TabsTrigger value="gateway" className="text-xs gap-1">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Flutterwave</span>
                </TabsTrigger>
                <TabsTrigger value="wallet" className="text-xs gap-1">
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Wallet</span>
                </TabsTrigger>
              </TabsList>

              {/* Option 1: Direct Bank Transfer (Transfer to Me) */}
              <TabsContent value="bank" className="space-y-4 pt-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    <span>Direct Bank Transfer Details</span>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">Instant Verification</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-card p-3 border border-border/40">
                      <div className="text-muted-foreground">Bank Name</div>
                      <div className="font-bold text-sm text-foreground mt-0.5">{bankName}</div>
                    </div>
                    <div className="rounded-lg bg-card p-3 border border-border/40">
                      <div className="text-muted-foreground">Account Name</div>
                      <div className="font-bold text-sm text-foreground mt-0.5">{accountName}</div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-card p-3 border border-border/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Account Number</div>
                      <div className="font-bold font-mono text-xl text-emerald-400">{accountNumber}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs font-semibold"
                      onClick={() => copyToClipboard(accountNumber, "acc")}
                    >
                      {copiedAccount ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedAccount ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>

                  <div className="rounded-lg bg-card p-3 border border-border/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Payment Reference (Attach in description)</div>
                      <div className="font-bold font-mono text-sm text-foreground">{checkoutItem.reference}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => copyToClipboard(checkoutItem.reference, "ref")}
                    >
                      {copiedRef ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedRef ? "Copied" : "Copy Ref"}</span>
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full font-bold py-5 bg-emerald-500 hover:bg-emerald-600 text-black shadow-md gap-2"
                  onClick={() => handleCompletePayment("Direct Bank Transfer")}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>I Have Made the Transfer (₦{checkoutItem.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })})</span>
                </Button>
              </TabsContent>

              {/* Option 2: Third Party Gateway (Flutterwave) */}
              <TabsContent value="gateway" className="space-y-4 pt-3">
                <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Flutterwave Online Checkout</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                      Pay securely with Debit/Credit Cards, USSD, Bank Transfer, or Mobile Money via Flutterwave API.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    <Lock className="h-3 w-3" />
                    <span>256-Bit SSL Encrypted Payment</span>
                  </div>
                </div>

                <Button
                  className="w-full font-bold py-5 bg-cyan-500 hover:bg-cyan-600 text-black shadow-md gap-2"
                  onClick={() => handleCompletePayment("Flutterwave Gateway")}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Pay ₦{checkoutItem.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} via Flutterwave</span>
                </Button>
              </TabsContent>



              {/* Option 4: Pay with Wallet Balance */}
              <TabsContent value="wallet" className="space-y-4 pt-3">
                {(() => {
                  const walletBalance = userProfile?.wallet_balance ? parseFloat(userProfile.wallet_balance) : 0;
                  const isSufficient = walletBalance >= (checkoutItem?.totalAmount || 0);

                  return (
                    <>
                      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
                              <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Available Wallet Balance</div>
                              <div className="text-xl font-bold font-mono text-emerald-400">
                                ₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={isSufficient ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-destructive/40 text-red-400 bg-destructive/10"}
                          >
                            {isSufficient ? "Sufficient Funds" : "Insufficient Balance"}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        disabled={!isSufficient}
                        className={`w-full font-bold py-5 shadow-md gap-2 ${
                          isSufficient
                            ? "bg-emerald-500 hover:bg-emerald-600 text-black cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                        onClick={() => isSufficient && handleCompletePayment("Wallet Balance")}
                      >
                        <Zap className="h-5 w-5" />
                        <span>Instant 1-Click Pay (₦{checkoutItem.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })})</span>
                      </Button>
                    </>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
