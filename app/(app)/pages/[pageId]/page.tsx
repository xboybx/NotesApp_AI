// ============================================================
// app/(app)/pages/[pageId]/page.tsx
// The full Notion-style page editor.
//
// Features:
//   - Editable emoji icon picker
//   - Editable title with auto-save (1.5s debounce)
//   - BlockNote rich text editor with auto-save
//   - AI Toolbar: Summarize, Improve Writing, Generate Tags
//   - AI Panel: shows AI results with Accept/Copy/Dismiss
//   - Tags display + AI Summary display
//   - Favorite & Archive actions in page header
// ============================================================

"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
    Star,
    Trash2,
    Sparkles,
    Tag,
    FileText,
    Wand2,
    ArrowLeft,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import { useTheme } from "next-themes";

import { usePage, useUpdatePage, useToggleFavorite, useArchivePage } from "@/hooks/usePages";
import { useSummarize, useImprove, useGenerateTags, useAIContent } from "@/hooks/useAI";
import { AIPanel } from "@/components/ai/AIPanel";
import { FloatingAI } from "@/components/ai/FloatingAI";
import { extractTextFromBlocks } from "@/lib/utils/blocknote-to-text";
import type { Block } from "@blocknote/core";
import { EditorRef } from "@/components/editor/Editor";

// Dynamically import the editor to avoid SSR issues.
// BlockNote uses browser-only APIs (document, window) so it can't
// render on the server. "ssr: false" tells Next.js to only render it client-side.
const Editor = dynamic(
    () => import("@/components/editor/Editor").then((m) => m.Editor),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-3 py-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-4/6" />
            </div>
        ),
    }
);

// AI panel state shape
type AIPanelState = {
    type: "summary" | "improve" | "tags" | null;
    result: string | string[] | null;
};

export default function PageEditorPage() {
    const params = useParams();
    const router = useRouter();
    const pageId = params.pageId as string;
    const editorRef = useRef<EditorRef>(null);

    // ---- Data fetching ----
    const { data: pageData, isLoading, isError } = usePage(pageId);
    const updatePage = useUpdatePage();
    const toggleFavorite = useToggleFavorite();
    const archivePage = useArchivePage();

    // ---- AI mutations ----
    const summarize = useSummarize();
    const improve = useImprove();
    const generateTags = useGenerateTags();

    // ---- Local state ----
    const [title, setTitle] = useState("");
    const [aiPanel, setAIPanel] = useState<AIPanelState>({ type: null, result: null });
    const [isSavingTitle, setIsSavingTitle] = useState(false);

    // Track initial load so we don't reset title on every re-render
    const initialLoadDone = useRef(false);
    const titleSaveTimer = useRef<NodeJS.Timeout | null>(null);
    const liveBlocksRef = useRef<Block[]>([]); // Track hot editor content for AI


    const page = pageData?.data;

    // Populate local title state when page data first loads
    useEffect(() => {
        if (page && !initialLoadDone.current) {
            setTitle(page.title || "");
            initialLoadDone.current = true;
        }
    }, [page]);

    // ---- Auto-save title (debounced 1.5s) ----
    const handleTitleChange = useCallback(
        (newTitle: string) => {
            setTitle(newTitle);
            if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
            titleSaveTimer.current = setTimeout(async () => {
                setIsSavingTitle(true);
                try {
                    await updatePage.mutateAsync({ pageId, data: { title: newTitle } });
                } catch {
                    toast.error("Failed to save title");
                } finally {
                    setIsSavingTitle(false);
                }
            }, 1500);
        },
        [pageId, updatePage]
    );

    // ---- Auto-save editor content (called by Editor component) ----
    const handleEditorSave = useCallback(
        async (blocks: Block[]) => {
            try {
                await updatePage.mutateAsync({
                    pageId,
                    data: { content: blocks as unknown as Record<string, unknown>[] },
                });
            } catch {
                toast.error("Failed to auto-save content");
            }
        },
        [pageId, updatePage]
    );

    // ---- Get plain text from CURRENT live editor content for AI ----
    // This ensures AI summarizes what you're currently typing,
    // not just the last saved version in the database.
    function getPlainText(): string {
        const blocks = liveBlocksRef.current;
        if (!blocks || blocks.length === 0) {
            // Fallback to server content if ref is empty (e.g. on first load)
            if (!page?.content) return "";
            return extractTextFromBlocks(page.content);
        }
        return extractTextFromBlocks(blocks as unknown as Record<string, unknown>[]);
    }

    // ---- AI: Summarize ----
    async function handleSummarize() {
        const text = getPlainText();
        if (!text.trim()) {
            toast.error("Add some content first before summarizing!");
            return;
        }
        setAIPanel({ type: "summary", result: null });
        try {
            const res = await summarize.mutateAsync({ pageId, content: text, title });
            setAIPanel({ type: "summary", result: res.data?.result as string || null });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to summarize";
            toast.error(msg);
            setAIPanel({ type: null, result: null });
        }
    }

    // ---- AI: Improve Writing ----
    async function handleImprove() {
        const text = getPlainText();
        if (!text.trim()) {
            toast.error("Add some content first!");
            return;
        }
        setAIPanel({ type: "improve", result: null });
        try {
            const res = await improve.mutateAsync({ pageId, content: text });
            setAIPanel({ type: "improve", result: res.data?.result as string || null });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to improve";
            toast.error(msg);
            setAIPanel({ type: null, result: null });
        }
    }

    // ---- AI: Generate Content (via floating button) ----
    const handleAIGenerated = (newContent: string) => {
        editorRef.current?.insertContent(newContent);
    };

    // ---- AI: Generate Tags ----
    async function handleGenerateTags() {
        const text = getPlainText();
        if (!text.trim()) {
            toast.error("Add some content first!");
            return;
        }
        setAIPanel({ type: "tags", result: null });
        try {
            const res = await generateTags.mutateAsync({ pageId, content: text, title });
            setAIPanel({ type: "tags", result: res.data?.result as string[] || null });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to generate tags";
            toast.error(msg);
            setAIPanel({ type: null, result: null });
        }
    }

    // ---- Toggle Favorite ----
    async function handleFavorite() {
        try {
            await toggleFavorite.mutateAsync(pageId);
            toast.success(page?.isFavorite ? "Removed from favorites" : "Added to favorites");
        } catch {
            toast.error("Failed to update favorite");
        }
    }

    // ---- Archive (move to trash) ----
    async function handleArchive() {
        try {
            await archivePage.mutateAsync(pageId);
            toast.success("Moved to trash");
            router.push("/dashboard");
        } catch {
            toast.error("Failed to move to trash");
        }
    }

    // ---- Change Icon ----
    async function handleIconSelect(emojiData: { emoji: string }) {
        try {
            await updatePage.mutateAsync({
                pageId,
                data: { icon: emojiData.emoji },
            });
            toast.success("Icon updated");
        } catch {
            toast.error("Failed to update icon");
        }
    }

    const { resolvedTheme } = useTheme();

    // ---- Loading state ----
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-12">
                <Skeleton className="h-10 w-3/4 mb-6" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-5/6 mb-2" />
                <Skeleton className="h-5 w-4/6" />
            </div>
        );
    }

    // ---- Error state ----
    if (isError || !page) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center py-20">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Page not found</h2>
                <p className="text-muted-foreground mb-4">
                    This page may have been deleted or you don&apos;t have access.
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const isAILoading =
        summarize.isPending || improve.isPending || generateTags.isPending;

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-4 py-8">

            {/* ---- Page Action Bar ---- */}
            <div className="flex items-center justify-between mb-6 gap-4">
                {/* AI Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSummarize}
                        disabled={isAILoading}
                        className="gap-1.5 text-xs"
                    >
                        {summarize.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                        )}
                        Summarize
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleImprove}
                        disabled={isAILoading}
                        className="gap-1.5 text-xs"
                    >
                        {improve.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Wand2 className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        Improve
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateTags}
                        disabled={isAILoading}
                        className="gap-1.5 text-xs"
                    >
                        {generateTags.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Tag className="h-3.5 w-3.5 text-green-500" />
                        )}
                        Generate Tags
                    </Button>
                </div>

                {/* Page Actions */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleFavorite}
                        title={page!.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Star
                            className={`h-4 w-4 ${page!.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                        />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={handleArchive}
                        title="Move to trash"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* ---- AI Panel ---- */}
            {(aiPanel.type || isAILoading) && (
                <div className="mb-6">
                    <AIPanel
                        type={aiPanel.type}
                        result={aiPanel.result}
                        isLoading={isAILoading}
                        onDismiss={() => setAIPanel({ type: null, result: null })}
                    />
                </div>
            )}

            {/* ---- Page Icon ---- */}
            <div className="mb-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            className="text-6xl cursor-pointer select-none hover:bg-accent rounded-lg p-2 transition-colors -ml-2"
                            title="Click to change icon"
                        >
                            {page!.icon || "📄"}
                        </button>
                    </DialogTrigger>
                    <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-fit">
                        <DialogTitle className="sr-only">Choose an emoji</DialogTitle>
                        <EmojiPicker
                            onEmojiClick={handleIconSelect}
                            theme={resolvedTheme === "dark" ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* ---- Page Title ---- */}
            <div className="mb-2 flex items-center gap-3">
                <Input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Untitled"
                    className="text-3xl md:text-4xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/30 py-2"
                />
                {isSavingTitle && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap animate-pulse shrink-0">
                        Saving...
                    </span>
                )}
            </div>

            {/* ---- Tags ---- */}
            {page!.tags && page!.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                    {page!.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}

            {/* ---- AI Summary ---- */}
            {page!.summary && (
                <div className="mb-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <p className="text-xs font-semibold text-purple-500 mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Summary
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {page.summary}
                    </p>
                </div>
            )}

            <Separator className="mb-6" />

            {/* ---- BlockNote Editor ---- */}
            <Editor
                ref={editorRef}
                initialContent={page!.content as unknown as Block[]}
                onSave={handleEditorSave}
                onChange={(blocks) => liveBlocksRef.current = blocks} // sync live ref
                editable={true}
            />

            {/* ---- Floating AI Generator ---- */}
            <FloatingAI
                pageId={pageId}
                title={title}
                getContent={getPlainText}
                onGenerated={handleAIGenerated}
            />
        </div>
    );
}
