"use client";

import { createElement, useMemo, useState } from "react";
import {
  Search, Mail, Phone, CalendarDays, CheckCircle2, XCircle, ShieldCheck,
  ShoppingCart, Plus, Minus, Trash2, CreditCard, ShoppingBag, ArrowRight,
  Copy, Check, Building2, Wallet, Smartphone, LayoutGrid, List, Zap, Lock, Download
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
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter,
} from "@/components/ui/sheet";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { accounts, platforms, platformIcons } from "@/data/mock";
import { toast } from "sonner";
import { placeOrder, getPaymentConfig, getUserProfile } from "@/lib/api";


// Country Flag Emoji Mapping
const countryFlags = {
  "USA": { flag: "🇺🇸", name: "United States" },
  "UK": { flag: "🇬🇧", name: "United Kingdom" },
  "Canada": { flag: "🇨🇦", name: "Canada" },
  "Germany": { flag: "🇩🇪", name: "Germany" },
  "France": { flag: "🇫🇷", name: "France" },
  "Nigeria": { flag: "🇳🇬", name: "Nigeria" },
  "Brazil": { flag: "🇧🇷", name: "Brazil" },
  "Japan": { flag: "🇯🇵", name: "Japan" },
  "Australia": { flag: "🇦🇺", name: "Australia" },
  "UAE": { flag: "🇦🇪", name: "UAE" },
  "India": { flag: "🇮🇳", name: "India" },
  "Global": { flag: "🌐", name: "Global" },
};

// Platform Color System & Branding Styles
const platformStyles = {
  "Instagram": {
    gradient: "from-amber-500/20 via-pink-500/20 to-purple-600/20",
    badgeBg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    iconBg: "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white shadow-pink-500/20",
    activePill: "bg-pink-500 text-white shadow-md shadow-pink-500/25",
  },
  "TikTok": {
    gradient: "from-cyan-500/20 via-slate-900 to-pink-500/20",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    iconBg: "bg-gradient-to-tr from-cyan-500 to-pink-500 text-black font-bold shadow-cyan-500/20",
    activePill: "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/25",
  },
  "YouTube": {
    gradient: "from-red-600/20 via-slate-900 to-red-500/20",
    badgeBg: "bg-red-500/10 text-red-400 border-red-500/20",
    iconBg: "bg-red-600 text-white shadow-red-600/20",
    activePill: "bg-red-600 text-white shadow-md shadow-red-600/25",
  },
  "Twitter/X": {
    gradient: "from-slate-700/20 via-slate-900 to-slate-800/20",
    badgeBg: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    iconBg: "bg-slate-800 text-white border border-slate-700 shadow-slate-900/20",
    activePill: "bg-slate-700 text-white shadow-md",
  },
  "Telegram": {
    gradient: "from-sky-500/20 via-slate-900 to-sky-600/20",
    badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    iconBg: "bg-sky-500 text-white shadow-sky-500/20",
    activePill: "bg-sky-500 text-white shadow-md shadow-sky-500/25",
  },
  "Discord": {
    gradient: "from-indigo-500/20 via-slate-900 to-indigo-600/20",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    iconBg: "bg-indigo-600 text-white shadow-indigo-500/20",
    activePill: "bg-indigo-600 text-white shadow-md shadow-indigo-500/25",
  },
  "LinkedIn": {
    gradient: "from-blue-600/20 via-slate-900 to-blue-500/20",
    badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    iconBg: "bg-blue-600 text-white shadow-blue-600/20",
    activePill: "bg-blue-600 text-white shadow-md shadow-blue-600/25",
  },
  "Snapchat": {
    gradient: "from-amber-400/20 via-slate-900 to-amber-300/20",
    badgeBg: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    iconBg: "bg-amber-400 text-black font-bold shadow-amber-400/20",
    activePill: "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/25",
  },
};

export default function AccountsPage() {
  const [q, setQ] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Selection & Purchase State
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Dedicated Payment Checkout Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null); // { account, totalAmount, quantity, reference }
  const [paymentTab, setPaymentTab] = useState("bank");
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Card Form State
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "", name: "" });

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Dynamic Payment Config & Deliverables State
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [user, setUser] = useState(null);
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [deliverableOrder, setDeliverableOrder] = useState(null);

  useEffect(() => {
    getUserProfile().then((u) => setUser(u)).catch(() => null);
    getPaymentConfig().then((cfg) => {
      if (cfg) setPaymentConfig(cfg);
    }).catch(() => null);

    if (typeof window !== "undefined" && !window.FlutterwaveCheckout) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const bankName = paymentConfig?.bank_name || process.env.NEXT_PUBLIC_BANK_NAME || "Kuda Bank / GTBank";
  const accountName = paymentConfig?.account_name || process.env.NEXT_PUBLIC_ACCOUNT_NAME || "HopeSocial Marketplace Ltd";
  const accountNumber = paymentConfig?.account_number || process.env.NEXT_PUBLIC_ACCOUNT_NUMBER || "2034829102";
  const flwPublicKey = paymentConfig?.flutterwave_public_key || process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-demo-key";

  const list = useMemo(() => {
    let s = accounts.filter((a) =>
      (selectedPlatform === "all" || a.platform === selectedPlatform) &&
      (countryFilter === "all" || a.country === countryFilter) &&
      (q === "" || `${a.platform} ${a.country} ${a.followers}`.toLowerCase().includes(q.toLowerCase())),
    );
    if (sort === "price-asc") s = [...s].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") s = [...s].sort((a, b) => b.price - a.price);
    if (sort === "followers") s = [...s].sort((a, b) => b.followers - a.followers);
    if (sort === "age") s = [...s].sort((a, b) => b.ageMonths - a.ageMonths);
    return s;
  }, [q, selectedPlatform, countryFilter, sort]);

  const openBuyModal = (account) => {
    setSelectedAccount(account);
    setQuantity(1);
  };

  const handleAddToCart = (account, qty) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.account.id === account.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prev, { account, quantity: qty }];
    });
    toast.success(`Added ${qty}x ${account.platform} Account to cart!`, {
      description: `Total: ₦${(account.price * qty).toLocaleString()}`,
    });
    setSelectedAccount(null);
  };

  // Trigger Dedicated Payment Gateway Modal
  const initiatePaymentModal = (itemDetails) => {
    const refCode = `HS-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    setCheckoutItem({
      ...itemDetails,
      reference: refCode,
    });
    setSelectedAccount(null);
    setIsCartOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handleDirectPayClick = (account, qty) => {
    initiatePaymentModal({
      title: `${qty}x ${account.platform} Aged Account (${account.id})`,
      accountId: account.id || account.name,
      platform: account.platform,
      country: account.country,
      unitPrice: account.price,
      quantity: qty,
      totalAmount: account.price * qty,
    });
  };

  const handleCartCheckoutClick = () => {
    if (cart.length === 0) return;
    const cartTotal = cart.reduce((acc, item) => acc + item.account.price * item.quantity, 0);
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    initiatePaymentModal({
      title: `Cart Checkout (${totalCount} Accounts)`,
      platform: "Multiple",
      country: "Global",
      unitPrice: cartTotal,
      quantity: totalCount,
      totalAmount: cartTotal,
      isCart: true,
    });
  };

  const handleFlutterwaveAccountPay = (item) => {
    const txRef = item.reference || `FLW-${Date.now()}`;

    if (!window.FlutterwaveCheckout) {
      toast.error("Flutterwave SDK loading. Please try again in a few seconds.");
      return;
    }

    try {
      window.FlutterwaveCheckout({
        public_key: flwPublicKey,
        tx_ref: txRef,
        amount: item.totalAmount,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        customer: {
          email: user?.email || "customer@hopesocial.com",
          name: user?.username || "Customer",
        },
        customizations: {
          title: item.title,
          description: `Purchase of ${item.title}`,
          logo: "https://checkout.flutterwave.com/assets/img/flw-logo.png",
        },
        callback: async (response) => {
          try {
            const res = await placeOrder({
              account: item.accountId,
              quantity: item.quantity,
              target_link: `Account Purchase: ${item.title}`,
              payment_method: "Flutterwave Gateway",
            });
            toast.success(`Payment verified! Order completed for '${item.title}'`);
            setIsPaymentModalOpen(false);
            if (item?.isCart) setCart([]);
            setDeliverableOrder(res?.order || {
              id: item.reference,
              service_name: item.title,
              quantity: item.quantity,
              total_amount: item.totalAmount,
              created_at: new Date().toISOString(),
            });
            setIsDeliverableModalOpen(true);
          } catch (err) {
            toast.error(err.message || "Failed to place order after payment.");
          }
        },
        onclose: () => {},
      });
    } catch (err) {
      toast.error("Could not initialize Flutterwave Checkout.");
    }
  };

  const handleCompletePayment = async (methodName) => {
    if (methodName === "Flutterwave Gateway") {
      handleFlutterwaveAccountPay(checkoutItem);
      return;
    }

    try {
      if (checkoutItem) {
        const res = await placeOrder({
          account: checkoutItem.accountId,
          quantity: checkoutItem.quantity,
          target_link: `Account Purchase: ${checkoutItem.title}`,
          payment_method: methodName,
        });
        toast.success(`Order for '${checkoutItem?.title}' placed via ${methodName}!`);
        if (checkoutItem?.isCart) {
          setCart([]);
        }
        setIsPaymentModalOpen(false);
        setDeliverableOrder(res?.order || {
          id: checkoutItem.reference,
          service_name: checkoutItem.title,
          quantity: checkoutItem.quantity,
          total_amount: checkoutItem.totalAmount,
          created_at: new Date().toISOString(),
        });
        setIsDeliverableModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message || "Failed to place order.");
      setIsPaymentModalOpen(false);
    } finally {
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

  const updateCartQty = (accountId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.account.id === accountId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (accountId) => {
    setCart((prev) => prev.filter((item) => item.account.id !== accountId));
    toast.info("Item removed from cart");
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.account.price * item.quantity, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header & Cart Drawer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Accounts Marketplace"
          description="Verified aged social accounts with original email access & instant automated delivery."
        />

        {/* Floating Header Cart Trigger */}
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative gap-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold shadow-sm">
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <Badge className="ml-1 bg-emerald-500 text-black font-bold">
                  {cartItemCount}
                </Badge>
              )}
              {cartTotal > 0 && (
                <span className="ml-1 text-xs text-foreground font-mono">
                  ₦{cartTotal.toLocaleString()}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent className="flex flex-col justify-between sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-400" />
                <span>Your Shopping Cart ({cartItemCount})</span>
              </SheetTitle>
            </SheetHeader>

            {cart.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center gap-3 text-center py-12">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-muted/40 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Browse social accounts below and click "Buy Account" to add items to your cart.
                </p>
              </div>
            ) : (
              <div className="my-4 flex-1 space-y-3 overflow-y-auto pr-1">
                {cart.map(({ account, quantity }) => {
                  const Icon = platformIcons[account.platform];
                  const countryData = countryFlags[account.country] || { flag: "🌐", name: account.country };

                  return (
                    <div
                      key={account.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold">
                          {Icon && createElement(Icon, { className: "h-5 w-5" })}
                        </div>
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-1.5">
                            <span>{account.platform}</span>
                            <span className="text-xs">{countryData.flag}</span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ₦{account.price.toLocaleString()} each
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-border/60 bg-muted/30">
                          <button
                            type="button"
                            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                            onClick={() => updateCartQty(account.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold">{quantity}</span>
                          <button
                            type="button"
                            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                            onClick={() => updateCartQty(account.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-right min-w-[70px]">
                          <div className="text-xs font-bold font-mono">
                            ₦{(account.price * quantity).toLocaleString()}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-400"
                          onClick={() => removeFromCart(account.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {cart.length > 0 && (
              <SheetFooter className="border-t border-border/60 pt-4 flex flex-col gap-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cartItemCount} items)</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-border/40 pt-2 text-foreground">
                    <span>Total Amount</span>
                    <span className="text-emerald-400">₦{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full font-bold py-6 text-base shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-black gap-2"
                  onClick={handleCartCheckoutClick}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed to Pay (₦{cartTotal.toLocaleString()})</span>
                </Button>
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Platform Category Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedPlatform("all")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            selectedPlatform === "all"
              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
              : "bg-card border border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>All Platforms ({accounts.length})</span>
        </button>

        {platforms.map((plat) => {
          const Icon = platformIcons[plat];
          const style = platformStyles[plat];
          const count = accounts.filter((a) => a.platform === plat).length;
          const isSelected = selectedPlatform === plat;

          return (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? style?.activePill || "bg-primary text-primary-foreground"
                  : "bg-card border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {Icon && createElement(Icon, { className: "h-3.5 w-3.5" })}
              <span>{plat}</span>
              <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[10px] opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by platform, country, followers…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 bg-muted/40"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-[160px] bg-muted/40">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {Object.keys(countryFlags).map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="mr-1.5">{countryFlags[c].flag}</span> {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-[160px] bg-muted/40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="followers">Most Followers</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="age">Oldest Accounts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1 self-end md:self-auto">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Listings - Grid or Table Display */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((a) => {
            const Icon = platformIcons[a.platform];
            const style = platformStyles[a.platform] || {
              gradient: "from-primary/20 to-primary/5",
              badgeBg: "bg-primary/10 text-primary",
              iconBg: "bg-primary text-primary-foreground",
            };
            const countryData = countryFlags[a.country] || { flag: "🌐", name: a.country };

            return (
              <Card
                key={a.id}
                className="group relative overflow-hidden border-border/60 bg-card/90 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
              >
                {/* Brand Header Accent Line */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${style.gradient}`} />

                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${style.iconBg} shadow-md transition-transform group-hover:scale-110`}>
                          {Icon && createElement(Icon, { className: "h-6 w-6" })}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold tracking-tight text-foreground">{a.platform}</span>
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">{a.id}</div>
                        </div>
                      </div>

                      <Badge className={a.available ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-muted text-muted-foreground"}>
                        {a.available ? "Available" : "Sold"}
                      </Badge>
                    </div>

                    {/* Country & Age Pill Badges */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
                        <span className="text-base leading-none">{countryData.flag}</span>
                        <span>{countryData.name}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${style.badgeBg}`}>
                        {a.ageMonths >= 12 ? `Aged ${Math.floor(a.ageMonths / 12)}Y` : `${a.ageMonths}M Old`}
                      </Badge>
                    </div>

                    {/* Account Feature Specs */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-border/40 bg-muted/20 p-2.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Followers</div>
                        <div className="mt-0.5 font-bold text-sm text-foreground">
                          {a.followers >= 1000 ? `${(a.followers / 1000).toFixed(1)}k` : a.followers}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/40 bg-muted/20 p-2.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-muted-foreground" /> Age
                        </div>
                        <div className="mt-0.5 font-bold text-sm text-foreground">{a.ageMonths} Months</div>
                      </div>
                      <div className="rounded-xl border border-border/40 bg-muted/20 p-2.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" /> OG Email
                        </div>
                        <div className="mt-0.5 font-semibold text-xs flex items-center gap-1">
                          {a.emailIncluded ? (
                            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Yes</span>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3" /> No</span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/40 bg-muted/20 p-2.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" /> Phone
                        </div>
                        <div className="mt-0.5 font-semibold text-xs flex items-center gap-1">
                          {a.phoneVerified ? (
                            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Yes</span>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3" /> No</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Buy Action Footer */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</div>
                      <div className="text-lg font-bold tracking-tight text-emerald-400 font-mono">
                        ₦{a.price.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="font-semibold shadow-md bg-emerald-500 hover:bg-emerald-600 text-black gap-1.5"
                      disabled={!a.available}
                      onClick={() => openBuyModal(a)}
                    >
                      <span>Buy Account</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Compact List View */
        <Card className="border-border/60 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Platform & ID</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Followers</th>
                  <th className="p-4">Age</th>
                  <th className="p-4">OG Email</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {list.map((a) => {
                  const Icon = platformIcons[a.platform];
                  const countryData = countryFlags[a.country] || { flag: "🌐", name: a.country };

                  return (
                    <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary font-bold">
                            {Icon && createElement(Icon, { className: "h-4 w-4" })}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1">
                              <span>{a.platform}</span>
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">{a.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs">
                          <span>{countryData.flag}</span>
                          <span>{countryData.name}</span>
                        </span>
                      </td>
                      <td className="p-4 font-bold">
                        {a.followers >= 1000 ? `${(a.followers / 1000).toFixed(1)}k` : a.followers}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {a.ageMonths} Months
                      </td>
                      <td className="p-4">
                        {a.emailIncluded ? (
                          <span className="text-emerald-400 font-semibold text-xs">Included</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">No</span>
                        )}
                      </td>
                      <td className="p-4 font-bold font-mono text-emerald-400">
                        ₦{a.price.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                          onClick={() => openBuyModal(a)}
                        >
                          Buy Account
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Account Order / Purchase Confirmation Modal */}
      {selectedAccount && (
        <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <span> Order Details — {selectedAccount.platform} Account</span>
              </DialogTitle>
              <DialogDescription>
                Review details, select quantity, and proceed to payment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {(countryFlags[selectedAccount.country] || {}).flag || "🌐"}
                    </span>
                    <span className="font-bold">{selectedAccount.platform} ({selectedAccount.id})</span>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    {selectedAccount.ageMonths} Months Aged
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-background p-2 border border-border/40">
                    <div className="text-muted-foreground">Followers</div>
                    <div className="font-bold text-sm">
                      {selectedAccount.followers >= 1000 ? `${(selectedAccount.followers / 1000).toFixed(1)}k` : selectedAccount.followers}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background p-2 border border-border/40">
                    <div className="text-muted-foreground">OG Email</div>
                    <div className="font-bold text-emerald-400">
                      {selectedAccount.emailIncluded ? "Yes" : "No"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background p-2 border border-border/40">
                    <div className="text-muted-foreground">Unit Price</div>
                    <div className="font-bold font-mono">₦{selectedAccount.price.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3">
                <div>
                  <div className="font-semibold text-sm">Select Quantity</div>
                  <div className="text-xs text-muted-foreground">How many accounts do you need?</div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold text-base font-mono">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <span className="font-semibold text-foreground">Total Price (₦)</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ₦{(selectedAccount.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full sm:flex-1 gap-2 border-border/60"
                onClick={() => handleAddToCart(selectedAccount, quantity)}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </Button>

              <Button
                className="w-full sm:flex-1 gap-2 font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-md shadow-emerald-500/20"
                onClick={() => handleDirectPayClick(selectedAccount, quantity)}
              >
                <CreditCard className="h-4 w-4" />
                <span>Proceed to Pay</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* DEDICATED PROCEED TO PAY PAYMENT GATEWAY MODAL */}
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
                Select your preferred option to complete payment of <strong>₦{checkoutItem.totalAmount.toLocaleString()}</strong>
              </DialogDescription>
            </DialogHeader>

            {/* Order Brief Summary */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Item</div>
                <div className="font-bold text-sm text-foreground">{checkoutItem.title}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Payable</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  ₦{checkoutItem.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Multi-Tab Payment Options */}
            <Tabs defaultValue="bank" className="w-full mt-2" onValueChange={setPaymentTab}>
              <TabsList className="grid grid-cols-4 w-full bg-muted/50 p-1">
                <TabsTrigger value="bank" className="text-xs gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Transfer</span>
                </TabsTrigger>
                <TabsTrigger value="gateway" className="text-xs gap-1">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Flutterwave</span>
                </TabsTrigger>
                <TabsTrigger value="card" className="text-xs gap-1">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Add Card</span>
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

                  {/* Account Number Box with Copy */}
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

                  {/* Payment Reference Code */}
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
                  <span>I Have Made the Transfer (₦{checkoutItem.totalAmount.toLocaleString()})</span>
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
                  <span>Pay ₦{checkoutItem.totalAmount.toLocaleString()} via Flutterwave</span>
                </Button>
              </TabsContent>

              {/* Option 3: Add Card Details */}
              <TabsContent value="card" className="space-y-3 pt-3">
                <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Cardholder Name</label>
                    <Input
                      placeholder="e.g. Hope Johnson"
                      value={cardForm.name}
                      onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                      className="mt-1 bg-muted/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Card Number</label>
                    <Input
                      placeholder="5399 •••• •••• ••••"
                      value={cardForm.number}
                      onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                      className="mt-1 bg-muted/40 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Expiry Date</label>
                      <Input
                        placeholder="MM/YY"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                        className="mt-1 bg-muted/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">CVV / Security Code</label>
                      <Input
                        placeholder="123"
                        maxLength={4}
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        className="mt-1 bg-muted/40 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full font-bold py-5 bg-emerald-500 hover:bg-emerald-600 text-black shadow-md gap-2"
                  onClick={() => handleCompletePayment("Debit/Credit Card")}
                >
                  <Lock className="h-4 w-4" />
                  <span>Submit & Pay ₦{checkoutItem.totalAmount.toLocaleString()}</span>
                </Button>
              </TabsContent>

              {/* Option 4: Pay with Wallet Balance */}
              <TabsContent value="wallet" className="space-y-4 pt-3">
                <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Available Wallet Balance</div>
                        <div className="text-xl font-bold font-mono text-emerald-400">₦128,490.00</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">Sufficient Funds</Badge>
                  </div>

                  <div className="text-xs text-muted-foreground border-t border-border/40 pt-3 flex justify-between">
                    <span>Deduction after payment:</span>
                    <span className="font-bold font-mono text-foreground">
                      ₦{(128490 - checkoutItem.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full font-bold py-5 bg-emerald-500 hover:bg-emerald-600 text-black shadow-md gap-2"
                  onClick={() => handleCompletePayment("Wallet Balance")}
                >
                  <Zap className="h-5 w-5" />
                  <span>Instant 1-Click Pay (₦{checkoutItem.totalAmount.toLocaleString()})</span>
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* ACCOUNT DELIVERABLE CREDENTIALS MODAL */}
      {isDeliverableModalOpen && deliverableOrder && (
        <Dialog open={isDeliverableModalOpen} onOpenChange={() => setIsDeliverableModalOpen(false)}>
          <DialogContent className="sm:max-w-md border-emerald-500/40 bg-slate-950">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-emerald-400">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <span>Account Credentials Delivered!</span>
              </DialogTitle>
              <DialogDescription>
                Your purchased account credentials & OG email details are ready below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground">Order Reference</span>
                  <span className="font-mono font-bold text-foreground">#{deliverableOrder.id || deliverableOrder.reference}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground">Package</span>
                  <span className="font-bold text-foreground">{deliverableOrder.service_name || deliverableOrder.title || "Aged Social Account"}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-mono font-bold">{deliverableOrder.quantity || 1} Account(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-mono font-bold text-emerald-400">₦{parseFloat(deliverableOrder.total_amount || deliverableOrder.amount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Original Email Access (OG Email)</div>
                <div className="rounded-lg bg-black/60 border border-emerald-500/30 p-2.5 font-mono text-emerald-400 flex items-center justify-between">
                  <span>og_{deliverableOrder.id || "acc"}@hopesocial.com : Pass#2026!Sec</span>
                  <Button variant="ghost" size="xs" onClick={() => copyToClipboard(`og_${deliverableOrder.id || "acc"}@hopesocial.com : Pass#2026!Sec`, "ref")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Account Credentials (Username : Password)</div>
                <div className="rounded-lg bg-black/60 border border-emerald-500/30 p-2.5 font-mono text-emerald-400 flex items-center justify-between">
                  <span>user_{deliverableOrder.id || "acc"} : Auth_PASS2026!</span>
                  <Button variant="ghost" size="xs" onClick={() => copyToClipboard(`user_${deliverableOrder.id || "acc"} : Auth_PASS2026!`, "acc")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                className="w-full sm:flex-1 gap-2"
                onClick={() => setIsDeliverableModalOpen(false)}
              >
                <span>Close Window</span>
              </Button>
              <Button
                className="w-full sm:flex-1 gap-2 font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-md"
                onClick={() => {
                  const printWin = window.open("", "_blank");
                  if (printWin) {
                    printWin.document.write(`
                      <html>
                        <head><title>Credentials Order #${deliverableOrder.id}</title></head>
                        <body style="font-family:sans-serif;padding:30px;background:#0f172a;color:#fff;">
                          <h2>Account Credentials - Order #${deliverableOrder.id}</h2>
                          <p><strong>Package:</strong> ${deliverableOrder.service_name || "Social Account"}</p>
                          <p><strong>OG Email:</strong> og_${deliverableOrder.id}@hopesocial.com : Pass#2026!Sec</p>
                          <p><strong>Account Login:</strong> user_${deliverableOrder.id} : Auth_PASS2026!</p>
                          <br/>
                          <button onclick="window.print()">Print / Save PDF</button>
                        </body>
                      </html>
                    `);
                    printWin.document.close();
                  }
                }}
              >
                <Download className="h-4 w-4" />
                <span>Print / Save PDF</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
