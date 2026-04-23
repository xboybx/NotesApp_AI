// ============================================================
// components/sidebar/Sidebar.tsx
// The main left sidebar — Notion-style layout.
//
// Structure:
//   - User info + logout button at top
//   - Search trigger button
//   - "New Page" button
//   - FAVORITES section (pages where isFavorite = true)
//   - ALL PAGES section (all non-archived, non-favorite pages)
//   - Trash link at the bottom
//
// This component fetches all pages using the usePages() hook
// and splits them into favorites and non-favorites.
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Home,
    Trash2,
    LogOut,
    ChevronsLeft,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useSession, signOut } from "@/lib/auth/auth-client";
import { usePages, useCreatePage } from "@/hooks/usePages";
import { SidebarPageItem } from "@/components/sidebar/SidebarPageItem";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface SidebarProps {
    onClose?: () => void; // used on mobile to close the sidebar Sheet
}

export function Sidebar({ onClose }: SidebarProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { data: pagesData, isLoading } = usePages();
    const createPage = useCreatePage();

    // Split pages into favorites and regular pages
    const allPages = pagesData?.data || [];
    const favoritePages = allPages.filter((page) => page.isFavorite);
    const regularPages = allPages.filter((page) => !page.isFavorite);

    // Create a new blank page and navigate to it
    async function handleCreatePage() {
        try {
            const result = await createPage.mutateAsync({});
            if (result.data?._id) {
                router.push(`/pages/${result.data._id}`);
                onClose?.(); // close mobile sidebar
            }
        } catch {
            toast.error("Failed to create page");
        }
    }

    // Logout: clear session cookie and redirect to login
    async function handleLogout() {
        try {
            await signOut();
            router.push("/login");
            router.refresh();
        } catch {
            toast.error("Failed to log out");
        }
    }

    return (
        <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-xl text-sidebar-foreground border-r border-sidebar-border">
            {/* ---- Top: User info ---- */}
            <div className="flex items-center justify-between p-4">
                <div
                    className="flex-1 flex items-center gap-2 min-w-0 cursor-pointer hover:bg-sidebar-accent/80 p-2 rounded-lg transition-all duration-200 group"
                    onClick={() => {
                        router.push("/profile");
                        onClose?.();
                    }}
                >
                    <div className="h-8 w-8 rounded-lg bg-primary shadow-sm flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 group-hover:scale-105 transition-transform">
                        {session?.user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm font-semibold truncate">
                        {session?.user?.name || "User"}
                    </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                    <ThemeToggle />
                    {/* Close button — only shown on mobile */}
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <Separator className="opacity-50 mx-4 w-auto" />

            {/* ---- Action buttons ---- */}
            <div className="px-4 py-4 space-y-1.5">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm h-9 rounded-lg hover:bg-sidebar-accent transition-all hover:translate-x-1"
                    onClick={() => {
                        router.push("/dashboard");
                        onClose?.();
                    }}
                >
                    <Home className="h-4 w-4 text-primary" />
                    <span className="font-medium">Home</span>
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm h-9 rounded-lg hover:bg-sidebar-accent transition-all hover:translate-x-1"
                    onClick={handleCreatePage}
                    disabled={createPage.isPending}
                >
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="font-medium">New Page</span>
                </Button>
            </div>

            <Separator className="opacity-50 mx-4 w-auto" />

            {/* ---- Scrollable pages list ---- */}
            <ScrollArea className="flex-1 px-3">
                {isLoading ? (
                    // Skeleton loaders while pages are loading
                    <div className="space-y-3 p-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="py-4 space-y-6">
                        {/* FAVORITES section */}
                        {favoritePages.length > 0 && (
                            <div className="animate-slide-up">
                                <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
                                    Favorites
                                </p>
                                <div className="space-y-0.5">
                                    {favoritePages.map((page) => (
                                        <SidebarPageItem key={page._id} page={page} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ALL PAGES section */}
                        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
                                Pages
                            </p>
                            {regularPages.length > 0 ? (
                                <div className="space-y-0.5">
                                    {regularPages.map((page) => (
                                        <SidebarPageItem key={page._id} page={page} />
                                    ))}
                                </div>
                            ) : (
                                <div className="px-3 py-8 text-center bg-accent/20 rounded-xl border border-dashed border-border/50 mx-2">
                                    <p className="text-xs text-muted-foreground font-medium">
                                        No pages yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ScrollArea>

            <Separator className="opacity-50 mx-4 w-auto" />

            {/* ---- Bottom: Trash + Logout ---- */}
            <div className="p-4 space-y-1.5">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm h-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => {
                        router.push("/trash");
                        onClose?.();
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="font-medium">Trash</span>
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm h-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Log out</span>
                </Button>
            </div>
        </div>

    );
}
