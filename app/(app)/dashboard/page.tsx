// ============================================================
// app/(app)/dashboard/page.tsx
// Dashboard — the landing page after login.
//
// Shows:
//   - Welcome message with user's name
//   - "Create New Page" button
//   - Grid of recently updated pages
//   - Empty state if no pages exist yet
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { Plus, FileText, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useSession } from "@/lib/auth/auth-client";
import { usePages, useCreatePage } from "@/hooks/usePages";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { data: pagesData, isLoading } = usePages();
    const createPage = useCreatePage();

    const pages = pagesData?.data || [];

    // Create a new page and open it immediately
    async function handleCreatePage() {
        try {
            const result = await createPage.mutateAsync({});
            if (result.data?._id) {
                router.push(`/pages/${result.data._id}`);
            }
        } catch {
            toast.error("Failed to create page");
        }
    }

    // Format a date string to a readable format like "Feb 24, 2026"
    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            {/* ---- Welcome Header ---- */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {session?.user?.name?.split(" ")[0] || "there"} 👋
                </h1>
                <p className="text-muted-foreground">
                    Your AI-powered workspace. Create, organize, and enhance your notes.
                </p>
            </div>

            {/* ---- Quick Create Button ---- */}
            <Button
                onClick={handleCreatePage}
                disabled={createPage.isPending}
                className="mb-8 gap-2"
                size="lg"
            >
                <Plus className="h-5 w-5" />
                New Page
            </Button>

            {/* ---- Recent Pages Section ---- */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Recently Updated
                </h2>

                {isLoading ? (
                    // Loading skeleton grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-lg" />
                        ))}
                    </div>
                ) : pages.length > 0 ? (
                    // Pages grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pages.map((page) => (
                            <Card
                                key={page._id}
                                className="cursor-pointer hover:bg-accent/50 transition-colors group"
                                onClick={() => router.push(`/pages/${page._id}`)}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">{page.icon || "📄"}</span>
                                        {page.isFavorite && (
                                            <span className="text-yellow-400 text-sm">★</span>
                                        )}
                                    </div>
                                    <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                                        {page.title || "Untitled"}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Updated {formatDate(page.updatedAt)}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : (
                    // Empty state — no pages yet
                    <div className="text-center py-16 border border-dashed rounded-lg">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No pages yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first page to get started
                        </p>
                        <Button onClick={handleCreatePage} disabled={createPage.isPending}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Page
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
