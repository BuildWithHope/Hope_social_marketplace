"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, ShoppingBag, ShieldCheck, ArrowRight, CheckCircle2,
  Zap, Smartphone, Wallet, Download, X, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/context/auth-context";

export function HowToOrderGuide({ onDismiss }) {
  const { isAuth } = useAuth();
  const [guideMode, setGuideMode] = useState("social"); // 'social' | 'accounts'
  const [activeStep, setActiveStep] = useState(1);

  const targetPath = guideMode === "social" ? "/marketplace" : "/accounts";
  const targetHref = isAuth ? targetPath : "/login";

  const socialSteps = [
    {
      step: 1,
      title: "Choose Social Service & Platform",
      desc: "Select Instagram, TikTok, YouTube, or Telegram. Pick Followers, Likes, or Views with instant delivery pacing.",
      tag: "Platform Selection",
      screen: {
        header: "Instagram Followers — Premium",
        rate: "₦1,500.00 / 1k",
        subtext: "High retention · Instant 0-1h start",
        status: "In Stock",
      },
    },
    {
      step: 2,
      title: "Input Quantity & Target Link",
      desc: "Enter your desired order quantity (e.g. 5,000) and paste your profile or post link.",
      tag: "Order Details",
      screen: {
        header: "Configure Order",
        qty: "5,000 Items",
        link: "instagram.com/your_profile",
        total: "₦7,500.00",
      },
    },
    {
      step: 3,
      title: "Instant 1-Click Pay",
      desc: "Pay via Wallet Balance or Flutterwave. Social orders are processed immediately without admin delays.",
      tag: "Auto-Approval",
      screen: {
        header: "Payment Confirmed!",
        method: "Wallet Balance",
        status: "Completed ✓",
        ref: "HS-ORD-48219",
      },
    },
  ];

  const accountsSteps = [
    {
      step: 1,
      title: "Filter Aged Accounts",
      desc: "Filter accounts by platform (Instagram, Twitter, TikTok), creation year (2018-2023), and country (USA 🇺🇸, UK 🇬🇧, Nigeria 🇳🇬).",
      tag: "Account Directory",
      screen: {
        header: "Instagram Aged Account (2020)",
        country: "USA 🇺🇸",
        followers: "12,500 Followers",
        price: "₦25,000.00",
      },
    },
    {
      step: 2,
      title: "Verify Security Specs",
      desc: "Check verification details — OG Email access included, phone verified status, and 2FA backup codes.",
      tag: "Security Check",
      screen: {
        header: "Security Specs Verified",
        ogEmail: "Included ✓",
        phoneVerified: "Verified ✓",
        backupCodes: "2FA Attached",
      },
    },
    {
      step: 3,
      title: "Instant Credentials Download",
      desc: "Pay via Wallet or Card and immediately download your account username, password, email login, and security codes.",
      tag: "Instant Delivery",
      screen: {
        header: "Credentials Delivered!",
        user: "ig_pro_2020",
        file: "acc_credentials_HS902.txt",
        status: "Ready for Download ✓",
      },
    },
  ];

  const currentSteps = guideMode === "social" ? socialSteps : accountsSteps;
  const currentStepData = currentSteps.find((s) => s.step === activeStep) || currentSteps[0];

  return (
    <Card className="relative overflow-hidden border border-emerald-500/30 bg-[#090d16] text-foreground shadow-2xl">
      {/* Glow Effects */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      <CardContent className="p-5 md:p-7">
        {/* Header Bar: Brand Name & Dismiss */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-foreground tracking-tight flex items-center gap-2">
                <span>HopeSocial Marketplace</span>
                <span className="text-muted-foreground font-normal text-xs">— Quick Order Guide</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Learn how to place orders for SMM growth services & buy verified aged accounts in 3 easy steps.
              </p>
            </div>
          </div>

          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={onDismiss}
            >
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex rounded-xl bg-muted/40 p-1 border border-border/60">
            <button
              onClick={() => { setGuideMode("social"); setActiveStep(1); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                guideMode === "social"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Social Growth Services</span>
            </button>
            <button
              onClick={() => { setGuideMode("accounts"); setActiveStep(1); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                guideMode === "accounts"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Aged Accounts Marketplace</span>
            </button>
          </div>

          {/* Step Pill Indicators */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Steps:</span>
            {currentSteps.map((s) => (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-mono font-bold transition-all ${
                  activeStep === s.step
                    ? "bg-emerald-500 text-black ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {s.step}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12 items-center">
          {/* Left Column: 3 Step Cards */}
          <div className="lg:col-span-7 space-y-3">
            {currentSteps.map((s) => {
              const isActive = s.step === activeStep;
              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border ${
                    isActive
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                      : "border-border/40 bg-card/60 hover:bg-card/90 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold ${
                          isActive
                            ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        0{s.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                          <span>{s.title}</span>
                          {isActive && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30">
                              Active Step
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "text-emerald-400 translate-x-1" : "text-muted-foreground"}`} />
                  </div>
                </div>
              );
            })}

            {/* Quick Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-md shadow-emerald-500/20 gap-2"
              >
                <Link href={targetHref}>
                  <ShoppingBag className="h-4 w-4" />
                  <span>{guideMode === "social" ? "Go to Services Marketplace" : "Go to Accounts Marketplace"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Smartphone Mockup Displaying Screen Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[280px] rounded-[2.2rem] border-4 border-slate-800 bg-slate-900 p-3.5 shadow-2xl shadow-emerald-500/10">
              {/* Phone Notch */}
              <div className="mx-auto mb-3 h-3.5 w-24 rounded-full bg-slate-950 flex items-center justify-center">
                <div className="h-1 w-8 rounded-full bg-slate-800" />
              </div>

              {/* Phone Content Screen */}
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 min-h-[300px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>HopeSocial</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      {guideMode.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Step {currentStepData.step} of 3 · {currentStepData.tag}
                    </div>
                    <div className="text-xs font-extrabold text-foreground mt-1">
                      {currentStepData.screen.header}
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-900 p-3 border border-slate-800 space-y-2 text-xs">
                    {guideMode === "social" ? (
                      <>
                        {activeStep === 1 && (
                          <>
                            <div className="text-emerald-400 font-mono font-bold">{currentStepData.screen.rate}</div>
                            <div className="text-[11px] text-muted-foreground">{currentStepData.screen.subtext}</div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30 mt-1">
                              {currentStepData.screen.status}
                            </Badge>
                          </>
                        )}
                        {activeStep === 2 && (
                          <>
                            <div className="text-[11px] text-muted-foreground">Quantity: <strong className="text-foreground font-mono">{currentStepData.screen.qty}</strong></div>
                            <div className="text-[11px] text-emerald-400 font-mono truncate">{currentStepData.screen.link}</div>
                            <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-foreground">
                              <span>Total:</span>
                              <span className="text-emerald-400 font-mono">{currentStepData.screen.total}</span>
                            </div>
                          </>
                        )}
                        {activeStep === 3 && (
                          <>
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{currentStepData.screen.header}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground">Paid via {currentStepData.screen.method}</div>
                            <div className="text-[11px] text-emerald-400 font-mono">Status: {currentStepData.screen.status}</div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {activeStep === 1 && (
                          <>
                            <div className="text-[11px] text-slate-300 font-semibold">Country: {currentStepData.screen.country}</div>
                            <div className="text-[11px] text-muted-foreground">{currentStepData.screen.followers}</div>
                            <div className="text-xs font-bold text-emerald-400 font-mono">{currentStepData.screen.price}</div>
                          </>
                        )}
                        {activeStep === 2 && (
                          <>
                            <div className="text-[11px] text-slate-300">OG Email: <strong className="text-emerald-400">{currentStepData.screen.ogEmail}</strong></div>
                            <div className="text-[11px] text-slate-300">Phone Status: <strong className="text-emerald-400">{currentStepData.screen.phoneVerified}</strong></div>
                            <div className="text-[11px] text-muted-foreground">{currentStepData.screen.backupCodes}</div>
                          </>
                        )}
                        {activeStep === 3 && (
                          <>
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <Download className="h-4 w-4" />
                              <span>{currentStepData.screen.header}</span>
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground bg-slate-950 p-2 rounded border border-slate-800">
                              Username: {currentStepData.screen.user || "ig_pro_2020"}<br />
                              Password: ••••••••••••
                            </div>
                            <div className="text-[11px] text-emerald-400">{currentStepData.screen.status}</div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800">
                  <div className="rounded-xl bg-emerald-500 py-1.5 text-center text-[11px] font-extrabold text-black shadow-md shadow-emerald-500/20">
                    {activeStep === 3 ? "Order Completed!" : "Next Step →"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
