"use client";

import { LifeBuoy, MessageSquare, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

export default function Support() {
  return (
    <div>
      <PageHeader
        title="Support Center"
        description="We're here 24/7. Open a ticket or browse common questions."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Response time</div>
              <div className="text-xs text-muted-foreground">Under 15 minutes avg.</div>
            </div>
          </div>
        </Card>
        <Card className="border-border/60 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Resolution rate</div>
              <div className="text-xs text-muted-foreground">99.2% solved first touch</div>
            </div>
          </div>
        </Card>
        <Card className="border-border/60 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Live support</div>
              <div className="text-xs text-muted-foreground">24/7 live agents available</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" /> Create ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Subject" className="bg-muted/40" />
            <Textarea placeholder="Describe your issue…" rows={6} className="bg-muted/40" />
            <Button onClick={() => toast.success("Ticket submitted", { description: "We'll reply within 2 hours." })}>Submit ticket</Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Active tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "T-4812", title: "Order HS-48210 speed inquiry", status: "Open", time: "12m ago" },
                { id: "T-4790", title: "API webhook signature verification", status: "Resolved", time: "2d ago" },
              ].map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground">{t.id}</div>
                    <div className="text-sm font-medium">{t.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-primary">{t.status}</div>
                    <div className="text-[11px] text-muted-foreground">{t.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Knowledge base · FAQs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {[
              ["How fast are orders delivered?", "Most orders begin processing within 1–5 minutes and complete within the delivery window shown on each service."],
              ["Can I get a refund?", "Yes — failed and cancelled orders are auto-refunded to your wallet within minutes."],
              ["How do I fund my wallet?", "Head to Wallet → Add Funds and choose your preferred method: bank, Flutterwave, Paystack or crypto."],
              ["Do you support the API?", "Yes, our REST API is fully documented on the API Documentation page with samples in 4 languages."],
            ].map(([q, a], i) => (
              <AccordionItem key={i} value={`i-${i}`} className="border-border/40">
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
