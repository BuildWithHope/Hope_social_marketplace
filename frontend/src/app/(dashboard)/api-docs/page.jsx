"use client";

import { useState } from "react";
import { Copy, KeyRound, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const snippets = {
  JavaScript: `const res = await fetch("https://api.hopesocial.io/v1/orders", {
  method: "POST",
  headers: { "Authorization": "Bearer $HS_KEY", "Content-Type": "application/json" },
  body: JSON.stringify({ service_id: "SVC-1004", link: "https://instagram.com/hope", quantity: 1000 }),
});
const data = await res.json();`,
  Python: `import requests
r = requests.post(
  "https://api.hopesocial.io/v1/orders",
  headers={"Authorization": f"Bearer {HS_KEY}"},
  json={"service_id": "SVC-1004", "link": "https://instagram.com/hope", "quantity": 1000},
)
print(r.json())`,
  PHP: `<?php
$ch = curl_init("https://api.hopesocial.io/v1/orders");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => ["Authorization: Bearer $HS_KEY", "Content-Type: application/json"],
  CURLOPT_POSTFIELDS => json_encode(["service_id" => "SVC-1004", "link" => "https://instagram.com/hope", "quantity" => 1000]),
]);
$res = json_decode(curl_exec($ch), true);`,
  cURL: `curl -X POST "https://api.hopesocial.io/v1/orders" \\
  -H "Authorization: Bearer $HS_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"service_id":"SVC-1004","link":"https://instagram.com/hope","quantity":1000}'`,
};

const endpoints = [
  { method: "GET", path: "/v1/services", desc: "List all active marketplace services, prices and limits." },
  { method: "POST", path: "/v1/orders", desc: "Create a new service order." },
  { method: "GET", path: "/v1/orders/{id}", desc: "Fetch live order status, remaning count and logs." },
  { method: "POST", path: "/v1/orders/cancel", desc: "Cancel processing order & trigger auto-refund." },
  { method: "GET", path: "/v1/balance", desc: "Check your live wallet balance." },
];

const errorCodes = [
  { code: 400, msg: "Bad Request", tip: "Invalid or missing parameters." },
  { code: 401, msg: "Unauthorized", tip: "Missing or invalid API key." },
  { code: 402, msg: "Insufficient Funds", tip: "Top up your wallet." },
  { code: 429, msg: "Rate Limited", tip: "Too many requests — back off." },
  { code: 500, msg: "Server Error", tip: "Retry with exponential backoff." },
];

function CodeBlock({ code }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-[oklch(0.11_0.01_240)]">
      <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-7 text-xs" onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied"); }}>
        <Copy className="h-3.5 w-3.5" /> Copy
      </Button>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

export default function ApiDocs() {
  const [apiKey] = useState("hs_live_98a7f6e5d4c3b2a1_prod");

  return (
    <div>
      <PageHeader
        title="API Documentation"
        description="Integrate our services into your panel, bot, or application."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" /> API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input readOnly value={apiKey} type="password" className="flex-1 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm font-mono" />
              <Button onClick={() => { navigator.clipboard.writeText(apiKey); toast.success("API Key copied"); }}>Copy key</Button>
              <Button variant="outline" onClick={() => toast.success("New key generated")}>Roll key</Button>
            </div>
            <p className="text-xs text-muted-foreground">Keep your key secret. Do not expose it in client-side code.</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Limits & Headers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground">Rate limit</span><span className="font-mono">120 req/min</span></div>
            <div className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground">Auth header</span><span className="font-mono">Authorization: Bearer</span></div>
            <div className="flex justify-between py-1"><span className="text-muted-foreground">Format</span><span className="font-mono">JSON</span></div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Code Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">All API requests require an Authorization: Bearer &lt;YOUR_API_KEY&gt; header.</p>
          <Tabs defaultValue="JavaScript">
            <TabsList className="mb-3">
              {Object.keys(snippets).map((lang) => (
                <TabsTrigger key={lang} value={lang}>{lang}</TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(snippets).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <CodeBlock code={code} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base">Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {endpoints.map((e) => (
              <div key={e.path} className="flex flex-col gap-2 rounded-lg border border-border/40 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={e.method === "GET" ? "secondary" : "default"}>{e.method}</Badge>
                  <span className="font-mono text-sm">{e.path}</span>
                </div>
                <span className="text-xs text-muted-foreground">{e.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Error Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {errorCodes.map((c) => (
              <div key={c.code} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{c.code}</Badge>
                  <span className="text-sm font-medium">{c.msg}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
