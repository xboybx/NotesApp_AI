// ============================================================
// app/(app)/layout.tsx
// Layout for all PROTECTED pages (dashboard, pages, profile).
//
// This layout provides:
//   1. Sidebar on desktop (always visible, 260px wide)
//   2. Sidebar as a Sheet (drawer) on mobile (toggle button)
//   3. The main content area where child pages render
//
// Route group (app) means the URL does NOT include "app",
// so /dashboard means app/(app)/dashboard/page.tsx
// ============================================================

"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex overflow-hidden">
            {/* ---- Desktop Sidebar (hidden on mobile) ---- */}
            <aside className="hidden md:flex w-[260px] shrink-0 border-r border-border">
                <Sidebar />
            </aside>

            {/* ---- Mobile Sidebar (Sheet drawer) ---- */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-[260px]">
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* ---- Main Content Area ---- */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header: hamburger menu button */}
                <div className="md:hidden flex items-center p-2 border-b border-border">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* Page content — scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
