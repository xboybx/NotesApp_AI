"use client";

import { useTrashPages, useArchivePage, useDeletePage } from "@/hooks/usePages";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, RotateCcw, FileText } from "lucide-react";
import { toast } from "sonner";

export default function TrashPage() {
    const { data: trashData, isLoading } = useTrashPages();
    const restorePage = useArchivePage();
    const deletePage = useDeletePage();

    const trashedPages = trashData?.data || [];

    const handleRestore = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await restorePage.mutateAsync(id);
            toast.success("Page restored to your workspace");
        } catch {
            toast.error("Failed to restore page");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Are you sure you want to permanently delete this page? This cannot be undone.")) {
            return;
        }

        try {
            await deletePage.mutateAsync(id);
            toast.success("Page permanently deleted");
        } catch {
            toast.error("Failed to delete page");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 pt-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-500/10 rounded-xl">
                    <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
                    <p className="text-muted-foreground mt-1">
                        Deleted pages stay here until you permanently remove them.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                </div>
            ) : trashedPages.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 mt-8 text-center border border-dashed rounded-xl bg-muted/30">
                    <Trash2 className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-1">Trash is empty</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        When you delete a page from your workspace, it will show up here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {trashedPages.map((page) => (
                        <div
                            key={page._id}
                            className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="text-2xl shrink-0 border rounded-lg h-10 w-10 flex items-center justify-center bg-muted/50">
                                    {page.icon ? page.icon : <FileText className="w-5 h-5 text-muted-foreground" />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-medium truncate">{page.title || "Untitled"}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        Deleted {new Date(page.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 shrink-0"
                                    onClick={(e) => handleRestore(page._id, e)}
                                    disabled={restorePage.isPending}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Restore
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={(e) => handleDelete(page._id, e)}
                                    disabled={deletePage.isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
