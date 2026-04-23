// ============================================================
// app/(app)/layout.tsx
// Layout for all PROTECTED pages (dashboard, pages, profile).
//
// This layout provides:
//   1. Collapsible Sidebar on desktop (toggle button in top bar)
//   2. Sidebar as a Sheet (drawer) on mobile (hamburger button)
//   3. The main content area where child pages render
// ============================================================

"use client";

import { useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);         // mobile sheet
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop toggle

    return (
        <div className="h-screen flex overflow-hidden">
            {/* ---- Desktop Sidebar (collapsible) ---- */}
            <aside
                className={`
                    hidden md:flex shrink-0 border-r border-border
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${sidebarCollapsed ? "w-0 border-r-0" : "w-[260px]"}
                `}
            >
                <div className="w-[260px] h-full">
                    <Sidebar />
                </div>
            </aside>

            {/* ---- Mobile Sidebar (Sheet drawer) ---- */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-[260px]">
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* ---- Main Content Area ---- */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar with toggle buttons */}
                <div className="flex items-center p-2 border-b border-border/50 shrink-0">
                    {/* Mobile hamburger */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-8 w-8"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>

                    {/* Desktop toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
                    >
                        {sidebarCollapsed ? (
                            <PanelLeftOpen className="h-4 w-4" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" />
                        )}
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
