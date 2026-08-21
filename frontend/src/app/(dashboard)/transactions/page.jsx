"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Download, Loader2, Key, Copy, Check, FileText, ShieldAlert, Clock, ShoppingBag, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { getTransactions, getOrders } from "@/lib/api";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function TransactionsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("30d");
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deliverables Modal State
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [copied, setCopied] = useState(false);
  const perPage = 10;

  useEffect(() => {
    async function loadData() {
      try {
        const [txData, orderData] = await Promise.all([
          getTransactions().catch(() => []),
          getOrders().catch(() => []),
        ]);
        setTransactions(txData || []);
        setOrders(orderData || []);
      } catch (err) {
        setTransactions([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const list = useMemo(
    () => (transactions || []).filter((t) => {
      const txStatus = t.status || t.transaction_type || "";
      const txId = t.id || t.reference || "";
      const txMethod = t.method || t.payment_method || "";
      const txRef = t.reference || "";
      return (
        (status === "all" || txStatus.toLowerCase() === status.toLowerCase()) &&
        (q === "" || `${txId} ${txRef} ${txMethod}`.toLowerCase().includes(q.toLowerCase()))
      );
    }),
    [transactions, q, status],
  );
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const paged = list.slice((page - 1) * perPage, page * perPage);

  const handleExportCSV = () => {
    if (!list || list.length === 0) {
      toast.error("No transactions available to export.");
      return;
    }

    const headers = ["Tx ID", "Type", "Amount (NGN)", "Status", "Method", "Reference", "Date"];
    const csvRows = [headers.join(",")];

    list.forEach((t) => {
      const row = [
        `"${t.id || t.reference || ''}"`,
        `"${t.type || t.transaction_type || 'Deposit'}"`,
        `"${parseFloat(t.amount || 0).toFixed(2)}"`,
        `"${t.status || 'Completed'}"`,
        `"${t.method || t.payment_method || 'Bank Transfer'}"`,
        `"${t.reference || t.id || ''}"`,
        `"${t.date || t.created_at || ''}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hopesocial_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${list.length} transaction(s) to CSV!`);
  };

  const copyDeliverableText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDeliverableFile = (order) => {
    const text = order.deliverable_info || `=== ACCOUNT ACCESS CREDENTIALS ===\nOrder ID: ${order.id}\nItem: ${order.service_name}\nDate: ${order.date || order.created_at}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Account_Credentials_Order_${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Credentials file downloaded!");
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <PageHeader
          title="Orders & Transactions"
          description="View your order history, download purchased account credentials, and track transactions."
          actions={
            <Button variant="outline" className="border-border/60 gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          }
        />

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md bg-muted/50 p-1 mb-4">
            <TabsTrigger value="orders" className="text-xs font-semibold gap-1.5">
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              <span>My Orders & Credentials ({orders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs font-semibold gap-1.5">
              <CreditCard className="h-4 w-4 text-cyan-400" />
              <span>Transactions Log ({transactions.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MY ORDERS & DOWNLOAD CREDENTIALS */}
          <TabsContent value="orders" className="space-y-4">
            <Card className="border-border/60 bg-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/60">
                        <TableHead>Order ID</TableHead>
                        <TableHead>Service / Account Item</TableHead>
                        <TableHead className="text-right">Total Payable</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Account Credentials</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                            <div className="flex justify-center items-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                              <span>Loading your orders…</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-sm font-medium">
                            No orders placed yet. Purchase an aged account or growth service to view deliverables here.
                          </TableCell>
                        </TableRow>
                      ) : (
                        orders.map((o) => {
                          const statusStr = String(o.status || '').toLowerCase();
                          const isCompleted = statusStr === "completed" || statusStr === "completed / active";
                          const hasDeliverables = Boolean(o.deliverable_info && o.deliverable_info.trim().length > 0);
                          const isAccount = Boolean(o.account || (o.service_name || o.target_link || "").toLowerCase().includes("account") || (o.service_name || "").toLowerCase().includes("aged"));

                          return (
                            <TableRow key={o.id} className="border-border/40 hover:bg-muted/20">
                              <TableCell className="font-mono text-xs font-bold text-foreground">#{o.id}</TableCell>
                              <TableCell>
                                <div className="font-semibold text-foreground text-sm">{o.service_name || o.target_link}</div>
                                <div className="text-xs text-muted-foreground font-mono">Qty: {o.quantity?.toLocaleString() || 1}</div>
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-extrabold text-emerald-400 font-mono">
                                ₦{parseFloat(o.total_amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={o.status || "Pending"} />
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs font-mono">
                                {o.date || o.created_at ? new Date(o.date || o.created_at).toLocaleDateString() : "Recently"}
                              </TableCell>
                              <TableCell className="text-right">
                                {isAccount ? (
                                  isCompleted && hasDeliverables ? (
                                    <Button
                                      size="sm"
                                      className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                                      onClick={() => setSelectedDeliverable(o)}
                                    >
                                      <Key className="h-3.5 w-3.5" />
                                      <span>Download Credentials</span>
                                    </Button>
                                  ) : (
                                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-semibold gap-1 text-[11px]">
                                      <Clock className="h-3 w-3" />
                                      <span>Awaiting Admin Approval</span>
                                    </Badge>
                                  )
                                ) : (
                                  <span className="text-xs text-muted-foreground italic font-medium">
                                    {isCompleted ? "Service Delivered" : "Awaiting Approval"}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: TRANSACTIONS LOG */}
          <TabsContent value="transactions" className="space-y-4">
            <Card className="mb-4 border-border/60 bg-card">
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, reference, method…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-9 bg-muted/40"
                  />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full md:w-[160px] bg-muted/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/60">
                        <TableHead>Tx ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount (₦)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                            <div className="flex justify-center items-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              <span>Loading transactions…</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : paged.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm font-medium">
                            No transactions recorded yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paged.map((t) => (
                          <TableRow key={t.id || t.reference} className="border-border/40">
                            <TableCell className="font-mono text-xs">{t.id || t.reference}</TableCell>
                            <TableCell>{t.type || t.transaction_type || "Deposit"}</TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">
                              ₦{parseFloat(t.amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={t.status || "Completed"} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {t.method || t.payment_method || "Bank Transfer"}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {t.reference || t.id || "N/A"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {t.date || t.created_at ? new Date(t.date || t.created_at).toLocaleString() : "Recently"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} />
                  </PaginationItem>
                  {Array.from({ length: pages }).slice(0, 6).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage((p) => Math.min(pages, p + 1))} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>
        </Tabs>

        {/* DELIVERABLES & CREDENTIALS DOWNLOAD MODAL */}
        {selectedDeliverable && (
          <Dialog open={!!selectedDeliverable} onOpenChange={() => setSelectedDeliverable(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg text-emerald-400">
                  <Key className="h-5 w-5" />
                  <span>Account Credentials & Deliverables</span>
                </DialogTitle>
                <DialogDescription>
                  Order #{selectedDeliverable.id} — {selectedDeliverable.service_name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="rounded-xl border border-emerald-500/30 bg-slate-950 p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                  {selectedDeliverable.deliverable_info || "No credentials specified for this item."}
                </div>

                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300">
                  🔒 Store these credentials securely. Do not share your login details with anyone.
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 gap-2 text-xs font-semibold"
                  onClick={() => copyDeliverableText(selectedDeliverable.deliverable_info || selectedDeliverable.service_name)}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </Button>
                <Button
                  className="w-full sm:flex-1 gap-2 font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-md cursor-pointer"
                  onClick={() => downloadDeliverableFile(selectedDeliverable)}
                >
                  <Download className="h-4 w-4" />
                  <span>Download .TXT File</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedRoute>
  );
}
