"use client";

import { useState } from "react";
import { AppSidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";

export function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <div className="hidden lg:block">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border">
          <AppSidebar collapsed={false} onToggle={() => {}} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-[1440px] p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
