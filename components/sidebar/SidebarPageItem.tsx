// ============================================================
// components/sidebar/SidebarPageItem.tsx
// A single page item in the sidebar list.
// Shows: icon + title + hover actions (favorite, archive, delete).
//
// When clicked → navigates to /pages/[id] to open the editor.
// ============================================================

"use client";

import { useState } from "react";

import { useRouter, usePathname } from "next/navigation";
import { MoreHorizontal, Star, Trash2, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useToggleFavorite, useArchivePage } from "@/hooks/usePages";
import type { PageListItem } from "@/types";

interface SidebarPageItemProps {
    page: PageListItem;
}

export function SidebarPageItem({ page }: SidebarPageItemProps) {
    const router = useRouter();
    const pathname = usePathname();
    const toggleFavorite = useToggleFavorite();
    const archivePage = useArchivePage();
    const [isNavigating, setIsNavigating] = useState(false);

    // Highlight the currently active page in the sidebar
    const isActive = pathname === `/pages/${page._id}`;

    // Navigate to the page editor when clicked
    async function handleClick() {
        setIsNavigating(true);
        // router.push returns void; use try/finally to reset state
        try {
            await router.push(`/pages/${page._id}`);
        } finally {
            // component will unmount on success, but clear on failure just in case
            setIsNavigating(false);
        }
    }

    // Toggle favorite (star/unstar)
    async function handleToggleFavorite(e: React.MouseEvent) {
        e.stopPropagation(); // prevent triggering the parent onClick (navigation)
        try {
            await toggleFavorite.mutateAsync(page._id);
            toast.success(page.isFavorite ? "Removed from favorites" : "Added to favorites");
        } catch {
            toast.error("Failed to update favorite");
        }
    }

    // Move to trash (archive)
    async function handleArchive(e: React.MouseEvent) {
        e.stopPropagation();
        try {
            await archivePage.mutateAsync(page._id);
            toast.success("Moved to trash");
            // If we just archived the currently open page, go back to dashboard
            if (isActive) {
                router.push("/dashboard");
            }
        } catch {
            toast.error("Failed to move to trash");
        }
    }

    return (
        <div
            onClick={handleClick}
            className={`
        group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer
        text-sm transition-all duration-200 ease-in-out
        hover:bg-accent/80 hover:translate-x-1
        ${isActive ? "bg-accent/100 text-accent-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5" : "text-muted-foreground hover:text-foreground"}
      `}
        >
            {/* Page icon (emoji) or fallback. Show spinner while navigating. */}
            <span className="text-base shrink-0">
                {isNavigating ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                    page.icon || "📄"
                )}
            </span>

            {/* Page title — truncated if too long */}
            <span className="truncate flex-1">
                {page.title || "Untitled"}
            </span>

            {/* Hover action menu — only visible when hovering the item */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => e.stopPropagation()} // prevent navigation
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleToggleFavorite}>
                            <Star
                                className={`mr-2 h-4 w-4 ${page.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                                    }`}
                            />
                            {page.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleArchive}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Move to trash
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
