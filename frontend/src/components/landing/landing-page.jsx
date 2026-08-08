"use client";

import Link from "next/link";
import {
  Sparkles, TrendingUp, Users, Wallet, ShieldCheck, Zap, ArrowRight,
  CheckCircle2, Lock, Star, ChevronRight, Headphones, BookOpen,
  Globe, Shield, Smartphone, Landmark, CreditCard, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: TrendingUp,
    title: "SMM Growth Engine",
    desc: "Instant high-retention followers, views, likes, and subscribers for Instagram, TikTok, YouTube, Telegram & X.",
    color: "from-pink-500/20 to-purple-600/20",
    iconColor: "text-pink-400",
  },
  {
    icon: Users,
    title: "Verified Aged Accounts",
    desc: "Pre-aged social media accounts created in USA, UK, Europe, and Nigeria. Includes 100% original email access & zero-ban guarantee.",
    color: "from-cyan-500/20 to-blue-600/20",
    iconColor: "text-cyan-400",
  },
  {
    icon: Zap,
    title: "Direct Supplier API v2",
    desc: "Connect your SMM Reseller Panel directly via standard API v2 for automated order placement and instant fulfillment.",
    color: "from-amber-500/20 to-orange-600/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Wallet,
    title: "Naira Wallet & Instant Funding",
    desc: "Deposit funds seamlessly in Naira (₦) using Bank Transfer, Flutterwave, Paystack, or Crypto USDT with instant wallet credit.",
    color: "from-emerald-500/20 to-teal-600/20",
    iconColor: "text-emerald-400",
  },
];

const sampleAccounts = [
  { platform: "Instagram", followers: "25.5k", age: "24 Months", flag: "🇺🇸", price: "₦45,000", badge: "OG Email" },
  { platform: "TikTok", followers: "50.0k", age: "18 Months", flag: "🇬🇧", price: "₦68,000", badge: "Creator Fund Eligible" },
  { platform: "YouTube", followers: "10.2k", age: "36 Months", flag: "🇨🇦", price: "₦120,000", badge: "Monetized" },
  { platform: "Telegram", followers: "15.0k", age: "12 Months", flag: "🇳🇬", price: "₦35,000", badge: "Aged Member Base" },
];

const testimonials = [
  {
    quote: "HopeSocial has completely transformed our agency operations. The direct supplier API processes 500+ orders daily without a hitch.",
    author: "Emeka Okonkwo",
    role: "CEO, Apex Media Nigeria",
    rating: 5,
  },
  {
    quote: "The aged Instagram accounts with OG email access are 100% authentic. Instant delivery right after payment approval!",
    author: "Sarah Adebayo",
    role: "Digital Growth Marketer",
    rating: 5,
  },
  {
    quote: "Instant Naira wallet funding and fast customer support make this the best SMM marketplace in West Africa.",
    author: "David Bello",
    role: "Reseller Panel Owner",
    rating: 5,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-black">
      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-400 font-semibold shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nigeria's #1 Automated SMM Marketplace & Account Hub</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl max-w-4xl mx-auto leading-[1.1]">
            Scale Your Social Presence & Buy <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Aged Accounts</span> Instantly
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            Automated SMM services, high-retention followers, pre-aged social accounts with original email access, and direct supplier API v2 integration for resellers.
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button size="lg" asChild className="w-full sm:w-auto font-bold text-base py-6 px-8 bg-emerald-500 hover:bg-emerald-600 text-black shadow-xl shadow-emerald-500/25 gap-2">
              <Link href="/register">
                <span>Create Free Account</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto font-semibold text-base py-6 px-8 border-border/80 gap-2">
              <Link href="/marketplace">
                <span>Browse Marketplace</span>
              </Link>
            </Button>
          </div>

          {/* Trust Highlights Row */}
          <div className="pt-8 border-t border-border/40 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> 100% OG Email Included
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" /> Instant Auto Delivery
            </div>
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-4 w-4 text-cyan-400" /> 256-Bit SSL Secured
            </div>
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-400" /> Auto Refund Protection
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="services" className="py-16 md:py-24 bg-card/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need To Grow & Resell</h2>
            <p className="text-sm text-muted-foreground">
              Built for digital agencies, SMM panel owners, marketers, and content creators across Africa and worldwide.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Card key={i} className="border-border/60 bg-card/80 backdrop-blur hover:-translate-y-1.5 transition-all duration-300 hover:border-emerald-500/40 shadow-sm flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr ${f.color} ${f.iconColor}`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AGED ACCOUNTS SHOWCASE */}
      <section id="accounts" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400 mb-2">Verified Inventory</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Popular Aged Accounts</h2>
              <p className="text-sm text-muted-foreground mt-1">Pre-aged with activity history and original email access included.</p>
            </div>
            <Button variant="outline" asChild size="sm" className="font-semibold gap-1.5 self-start md:self-auto">
              <Link href="/accounts">View All Accounts ({sampleAccounts.length}+) <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sampleAccounts.map((a, i) => (
              <Card key={i} className="border-border/60 bg-card p-5 space-y-4 hover:border-emerald-500/40 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{a.flag}</span>
                    <span className="font-bold text-base">{a.platform}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {a.badge}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/40">
                  <div>
                    <div className="text-muted-foreground text-[10px]">Followers</div>
                    <div className="font-bold text-sm text-foreground">{a.followers}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px]">Age</div>
                    <div className="font-bold text-sm text-foreground">{a.age}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-bold font-mono text-emerald-400">{a.price}</span>
                  <Button size="xs" asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                    <Link href="/register">Buy Now</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SUPPLIER API INTEGRATION BANNER */}
      <section id="api" className="py-16 bg-gradient-to-r from-emerald-950/40 via-card to-cyan-950/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 md:px-8 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400">Developer & Reseller API</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Connect Your SMM Panel in 60 Seconds</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Standard SMM API v2 endpoint integration. Connect Perfect Panel, RentPanel, or custom reseller code to automate order submission, status tracking, and margin payouts.
            </p>
            <div className="flex gap-3 pt-2">
              <Button asChild className="font-bold bg-emerald-500 hover:bg-emerald-600 text-black">
                <Link href="/api-docs">Explore API Docs</Link>
              </Button>
              <Button variant="outline" asChild className="font-semibold">
                <Link href="/register">Generate API Key</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-slate-950 p-5 font-mono text-xs text-slate-300 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold">POST /api/orders/</span>
              <span className="text-slate-500 text-[10px]">HTTP/1.1 201 Created</span>
            </div>
            <pre className="text-[11px] text-slate-400 leading-relaxed overflow-x-auto">
{`{
  "key": "34fcc00f-7d44-4997-ba9b-27a82ee0e5a1",
  "action": "add",
  "service": 12,
  "link": "https://instagram.com/yourhandle",
  "quantity": 5000
}`}
            </pre>
            <div className="border-t border-slate-800 pt-2 text-[10px] text-emerald-400 flex items-center justify-between">
              <span>Status: Order Auto-Forwarded to Supplier</span>
              <span>Response: 14ms</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Marketers & Resellers</h2>
            <p className="text-sm text-muted-foreground">See why thousands of growth specialists choose HopeSocial Marketplace.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-border/60 bg-card p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                </div>
                <div className="pt-3 border-t border-border/40">
                  <div className="font-bold text-sm text-foreground">{t.author}</div>
                  <div className="text-[11px] text-muted-foreground">{t.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-border/60 bg-card/60 py-12 px-4 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-foreground">HopeSocial Marketplace</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
            <Link href="/register" className="hover:text-foreground">Register Account</Link>
            <Link href="/marketplace" className="hover:text-foreground">Marketplace Services</Link>
            <Link href="/api-docs" className="hover:text-foreground">API Documentation</Link>
            <Link href="/support" className="hover:text-foreground">24/7 Support</Link>
          </div>

          <div>
            © {new Date().getFullYear()} HopeSocial Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
