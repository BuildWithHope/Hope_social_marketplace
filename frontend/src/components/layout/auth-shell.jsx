"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, Zap, Globe2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30"><Sparkles className="h-4 w-4" /></div>
          <div><div className="text-sm font-semibold">HopeSocial</div><div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Marketplace</div></div>
        </Link>
        <div className="mx-auto w-full max-w-md py-16">
          {children}
        </div>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} HopeSocial · All rights reserved</div>
      </div>

      <div
        className="relative hidden overflow-hidden border-l border-border lg:block"
        style={{ background: "var(--gradient-hero)", backgroundColor: "oklch(0.14 0.012 240)" }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div />
          <div className="max-w-md">
            <h2 className="text-3xl font-semibold tracking-tight">The premium marketplace for social growth.</h2>
            <p className="mt-3 text-muted-foreground">Deploy campaigns, buy verified accounts and integrate our API all from one lightning-fast dashboard.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[{i: ShieldCheck, t: "Secure"},{i: Zap, t: "Instant"},{i: Globe2, t: "Global"}].map(({i:Icon,t}) => (
                <div key={t} className="rounded-xl border border-border/60 bg-card/60 p-3 text-center backdrop-blur">
                  <Icon className="mx-auto h-5 w-5 text-primary" />
                  <div className="mt-1 text-xs">{t}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Trusted by 12,000+ creators, marketers and agencies</div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
