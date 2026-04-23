// ============================================================
// components/ai/FloatingAI.tsx
// A floating "Ask AI" button that stays in the bottom-right corner.
//
// Features:
//   - Expands into an input field when clicked
//   - Sends a prompt to the AI to generate content
//   - Calls an "onGenerated" callback with the result
// ============================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIContent } from "@/hooks/useAI";
import { toast } from "sonner";

interface FloatingAIProps {
    pageId: string;
    title: string;
    getContent: () => string;
    onGenerated: (content: string) => void;
}

export function FloatingAI({ pageId, title, getContent, onGenerated }: FloatingAIProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const generateContent = useAIContent();

    // Auto-focus the input when it opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleGenerate = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!prompt.trim() || generateContent.isPending) return;

        try {
            const res = await generateContent.mutateAsync({
                pageId,
                title,
                content: getContent(),
                prompt: prompt.trim()
            });

            if (res.success && res.data?.result) {
                onGenerated(res.data.result as string);
                setPrompt("");
                setIsOpen(false);
                toast.success("Content generated!");
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to generate content";
            toast.error(msg);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
            {/* Expanded Panel — Liquid Glass */}
            {isOpen && (
                <div className="
                    relative w-[350px] md:w-[460px] rounded-[28px]
                    animate-slide-up overflow-hidden
                    border border-white/20 dark:border-white/10
                    shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)]
                    backdrop-blur-[40px] bg-transparent
                ">
                        {/* Subtle top shine only */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                        <div className="relative z-10 p-5">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                        <Sparkles className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground/90 tracking-tight">Ask AI to write...</span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="h-7 w-7 rounded-full flex items-center justify-center
                                        bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20
                                        text-muted-foreground hover:text-foreground transition-all"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Input */}
                            <form onSubmit={handleGenerate} className="relative">
                                <Input
                                    ref={inputRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. Write an overview of machine learning..."
                                    className="pr-14 h-12
                                        bg-transparent
                                        border-white/20 dark:border-white/10
                                        focus-visible:ring-1 focus-visible:ring-white/30
                                        placeholder:text-muted-foreground/40
                                        rounded-2xl text-sm font-medium
                                        transition-all duration-200"
                                    disabled={generateContent.isPending}
                                />
                                <div className="absolute right-1.5 top-1.5 bottom-1.5">
                                    <button
                                        type="submit"
                                        disabled={!prompt.trim() || generateContent.isPending}
                                        className="h-full aspect-square rounded-xl
                                            bg-gradient-to-br from-purple-500 to-blue-500
                                            disabled:opacity-40 disabled:cursor-not-allowed
                                            hover:shadow-lg hover:shadow-purple-500/30
                                            hover:scale-105 active:scale-95
                                            transition-all duration-200
                                            flex items-center justify-center"
                                    >
                                        {generateContent.isPending ? (
                                            <Loader2 className="h-4 w-4 text-white animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4 text-white" />
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Footer */}
                            <p className="mt-3 text-[10px] text-muted-foreground/50 text-center font-medium tracking-wide">
                                AI content may be inaccurate — review before finalizing
                            </p>
                        </div>
                </div>
            )}

            {/* Floating Toggle Button — Liquid Glass */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="
                        relative h-14 w-14 rounded-full
                        bg-transparent
                        backdrop-blur-[40px]
                        border border-white/25 dark:border-white/15
                        shadow-[0_4px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25)]
                        hover:shadow-[0_8px_32px_rgba(139,92,246,0.25),inset_0_1px_0_rgba(255,255,255,0.35)]
                        hover:scale-110 active:scale-95
                        transition-all duration-300
                        overflow-hidden group
                    "
                >
                    {/* Top shine */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                    <Sparkles className="relative z-10 h-5 w-5 text-foreground group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 mx-auto" />
                </button>
            )}
        </div>
    );
}
