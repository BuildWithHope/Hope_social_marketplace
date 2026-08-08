"use client";

import { useState, useEffect } from "react";
import { LifeBuoy, MessageSquare, BookOpen, Clock, CheckCircle2, RefreshCw, Send, ShieldAlert, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { getSupportTickets, createSupportTicket, replySupportTicket } from "@/lib/api";

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [replyLoadingId, setReplyLoadingId] = useState(null);

  // Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [priority, setPriority] = useState("Medium");
  const [message, setMessage] = useState("");
  const [replyMsgMap, setReplyMsgMap] = useState({});

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getSupportTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load your support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please enter both subject and message details.");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await createSupportTicket({
        subject,
        category,
        priority,
        message,
      });

      toast.success(`Complaint Ticket #${res.id || "Submitted"} created!`, {
        description: "Our admin team has received your alert and will respond promptly.",
      });

      // Clear/Reset form fields back to blank
      setSubject("");
      setMessage("");
      setCategory("General Inquiry");
      setPriority("Medium");

      // Refresh ticket list
      loadTickets();
    } catch (err) {
      toast.error(err.message || "Failed to submit support ticket.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUserReply = async (ticketId) => {
    const replyText = replyMsgMap[ticketId];
    if (!replyText || !replyText.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    setReplyLoadingId(ticketId);
    try {
      await replySupportTicket(ticketId, { message: replyText });
      toast.success("Reply added to ticket!");
      setReplyMsgMap({ ...replyMsgMap, [ticketId]: "" });
      loadTickets();
    } catch (err) {
      toast.error(err.message || "Failed to add reply.");
    } finally {
      setReplyLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Complaint Center"
        description="Submit support tickets, report issues, and communicate directly with staff admins 24/7."
        actions={
          <Button variant="outline" size="sm" onClick={loadTickets} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Tickets
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Response Time</div>
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
              <div className="text-sm font-semibold">Resolution Guarantee</div>
              <div className="text-xs text-muted-foreground">100% verified staff support</div>
            </div>
          </div>
        </Card>
        <Card className="border-border/60 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Admin Escalation</div>
              <div className="text-xs text-muted-foreground">Direct alert sent to staff</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Ticket Card */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" /> Create Support Complaint Ticket
            </CardTitle>
            <CardDescription>
              Describe your issue or order inquiry. Submitting sends an instant alert to the Admin Control Panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subject Title *</label>
                <Input
                  placeholder="e.g. Order #ORD-1002 speed inquiry or payment check"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-muted/40 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-muted/40 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Issues">Order Issues</option>
                    <option value="Payment / Deposit">Payment / Deposit</option>
                    <option value="Account Delivery">Account Delivery</option>
                    <option value="API Integration">API Integration</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-muted/40 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Detailed Complaint / Message *</label>
                <Textarea
                  placeholder="Provide order references, link details, or questions so our admins can resolve your issue quickly..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-muted/40 text-xs"
                  required
                />
              </div>

              <Button
                type="button"
                onClick={handleSubmitTicket}
                disabled={submitLoading}
                className="w-full font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Submitting Ticket...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit Complaint Ticket
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Support Tickets */}
        <Card className="border-border/60 bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Your Support Tickets ({tickets.length})
            </CardTitle>
            <CardDescription>
              View your open and resolved support complaint tickets and reply to staff responses.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 text-xs">
                You have no active support tickets. Create one on the left if you need assistance.
              </div>
            ) : (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-muted-foreground">#{t.id}</span>
                          <span className="text-xs font-semibold text-foreground">{t.subject}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {t.category} · {t.created_at ? new Date(t.created_at).toLocaleDateString() : "Recent"}
                        </div>
                      </div>
                      <div>
                        {t.status === "Answered" ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                            Answered
                          </Badge>
                        ) : t.status === "Open" ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                            Open
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">{t.status}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Messages Thread */}
                    <div className="space-y-2 max-h-36 overflow-y-auto text-xs">
                      {(t.replies || []).map((rep, idx) => (
                        <div key={idx} className={`p-2 rounded-lg border ${rep.is_staff_reply ? "bg-primary/10 border-primary/20 ml-3" : "bg-card border-border/40 mr-3"}`}>
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                            <span className="font-bold text-foreground">
                              {rep.is_staff_reply ? "🛡️ Support Admin" : "You"}
                            </span>
                            <span>{rep.created_at ? new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                          </div>
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{rep.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Reply Form */}
                    <div className="flex gap-2 items-center pt-1">
                      <Input
                        placeholder="Reply to ticket..."
                        value={replyMsgMap[t.id] || ""}
                        onChange={(e) => setReplyMsgMap({ ...replyMsgMap, [t.id]: e.target.value })}
                        className="h-8 text-xs bg-muted/40"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleUserReply(t.id);
                          }
                        }}
                      />
                      <Button
                        size="xs"
                        disabled={replyLoadingId === t.id}
                        onClick={() => handleUserReply(t.id)}
                        className="h-8 px-3 text-xs font-semibold cursor-pointer shrink-0"
                      >
                        {replyLoadingId === t.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          "Reply"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ Accordion */}
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Knowledge Base · FAQs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {[
              ["How fast are orders delivered?", "Most orders begin processing within 1–5 minutes and complete within the delivery window shown on each service."],
              ["Can I get a refund?", "Yes — failed and cancelled orders are auto-refunded to your wallet within minutes."],
              ["How do I fund my wallet?", "Head to Wallet → Add Funds and choose your preferred method: bank transfer, Flutterwave, or card."],
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

