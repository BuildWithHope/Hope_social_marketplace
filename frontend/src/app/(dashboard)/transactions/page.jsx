"use client";

import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
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
import { transactions } from "@/data/mock";
import { toast } from "sonner";

export default function TransactionsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("30d");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const list = useMemo(
    () => transactions.filter((t) =>
      (status === "all" || t.status === status) &&
      (q === "" || `${t.id} ${t.reference} ${t.method}`.toLowerCase().includes(q.toLowerCase())),
    ),
    [q, status],
  );
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const paged = list.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="A live log of every credit and debit on your account in Naira (₦)."
        actions={<Button variant="outline" className="border-border/60" onClick={() => toast.success("CSV exported")}><Download className="h-4 w-4" /> Export CSV</Button>}
      />

      <Card className="mb-5 border-border/60 bg-card">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by ID, reference, method…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-muted/40" />
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-full md:w-[160px] bg-muted/40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-[160px] bg-muted/40"><SelectValue /></SelectTrigger>
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
                {paged.map((t) => (
                  <TableRow key={t.id} className="border-border/40">
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell>{t.type}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">₦{t.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{t.method}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{t.reference}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(t.date).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
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
                <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(pages, p + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
