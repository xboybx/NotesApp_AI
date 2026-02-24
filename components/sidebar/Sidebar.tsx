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
        <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
            {/* ---- Top: User info ---- */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {session?.user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm font-medium truncate">
                        {session?.user?.name || "User"}
                    </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <ThemeToggle />
                    {/* Close button — only shown on mobile */}
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <Separator />

            {/* ---- Action buttons ---- */}
            <div className="px-3 py-2 space-y-1">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm h-8"
                    onClick={() => {
                        router.push("/dashboard");
                        onClose?.();
                    }}
                >
                    <Home className="h-4 w-4" />
                    Home
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm h-8"
                    onClick={handleCreatePage}
                    disabled={createPage.isPending}
                >
                    <Plus className="h-4 w-4" />
                    New Page
                </Button>
            </div>

            <Separator />

            {/* ---- Scrollable pages list ---- */}
            <ScrollArea className="flex-1 px-2">
                {isLoading ? (
                    // Skeleton loaders while pages are loading
                    <div className="space-y-2 p-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-7 w-full rounded-md" />
                        ))}
                    </div>
                ) : (
                    <div className="py-2">
                        {/* FAVORITES section */}
                        {favoritePages.length > 0 && (
                            <div className="mb-3">
                                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Favorites
                                </p>
                                {favoritePages.map((page) => (
                                    <SidebarPageItem key={page._id} page={page} />
                                ))}
                            </div>
                        )}

                        {/* ALL PAGES section */}
                        <div>
                            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Pages
                            </p>
                            {regularPages.length > 0 ? (
                                regularPages.map((page) => (
                                    <SidebarPageItem key={page._id} page={page} />
                                ))
                            ) : (
                                <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                                    No pages yet. Create one!
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </ScrollArea>

            <Separator />

            {/* ---- Bottom: Trash + Logout ---- */}
            <div className="px-3 py-2 space-y-1">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm h-8 text-muted-foreground"
                    onClick={() => {
                        router.push("/dashboard");
                        onClose?.();
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                    Trash
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm h-8 text-muted-foreground"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Log out
                </Button>
            </div>
        </div>
    );
}
