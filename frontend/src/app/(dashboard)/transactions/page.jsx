"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { getTransactions } from "@/lib/api";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function TransactionsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("30d");
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const perPage = 10;

  useEffect(() => {
    async function loadTx() {
      try {
        const data = await getTransactions();
        setTransactions(data || []);
      } catch (err) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    loadTx();
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

  return (
    <ProtectedRoute>
      <div>
        <PageHeader
          title="Transactions"
          description="A live log of every credit and debit on your account in Naira (₦)."
          actions={
            <Button variant="outline" className="border-border/60 gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          }
        />

        <Card className="mb-5 border-border/60 bg-card">
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
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-full md:w-[160px] bg-muted/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableRow className="hover:bg-transparent">
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
                        No transactions recorded yet. Fund your wallet or place an order to get started.
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
      </div>
    </ProtectedRoute>
  );
}
