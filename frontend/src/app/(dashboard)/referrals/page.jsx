"use client";

import { Copy, Gift, Users, Wallet, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function ReferralsPage() {
  const link = "http://localhost:3000/register?ref=hope";

  return (
    <div>
      <PageHeader
        title="Referrals & Earnings"
        description="Invite friends and earn 10% lifetime commission on all their deposits in Naira (₦)."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total earned" value="₦482,500.00" delta="+₦42,600 this month" icon={Wallet} tone="primary" />
        <StatCard label="Total referrals" value="18" icon={Users} />
        <StatCard label="This month" value="+₦42,600.00" icon={Gift} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Your referral link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input readOnly value={link} className="bg-muted/40 font-mono text-sm" />
              <Button onClick={() => { navigator.clipboard.writeText(link); toast.success("Referral link copied!"); }}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Commission tier</span>
                <span className="font-semibold text-primary">Standard (10%)</span>
              </div>
              <Progress value={60} />
              <div className="mt-1 text-xs text-muted-foreground">7 more referrals to unlock 12% commission.</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-primary/15 via-card to-card">
          <CardHeader>
            <CardTitle className="text-base">Invite friends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Share your link on socials or send by email.</p>
            <Input placeholder="friend@example.com" className="bg-muted/40" />
            <Button className="w-full" onClick={() => toast.success("Invitation sent successfully!")}>Send invite</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
