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
        <div className="fixed bottom-8 right-8 z-100 flex flex-col items-end gap-3">
            {/* Expanded UI */}
            {isOpen && (
                <div className="bg-card border rounded-2xl shadow-2xl p-4 w-[350px] md:w-[450px] animate-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            Ask AI to write...
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleGenerate} className="relative">
                        <Input
                            ref={inputRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Write a brief overview of machine learning..."
                            className="pr-12 h-12 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-purple-500 rounded-xl"
                            disabled={generateContent.isPending}
                        />
                        <div className="absolute right-1 top-1 bottom-1 flex items-center pr-1">
                            <Button
                                type="submit"
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 text-purple-500 hover:text-purple-600 hover:bg-purple-500/10 rounded-lg shrink-0"
                                disabled={!prompt.trim() || generateContent.isPending}
                            >
                                {generateContent.isPending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-3 px-1">
                        <p className="text-[10px] text-muted-foreground/60 leading-tight">
                            AI-generated content may be inaccurate. Review before finalizing.
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-xl bg-linear-to-tr from-purple-600 to-blue-600 hover:scale-110 active:scale-95 transition-all duration-300 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                </Button>
            )}
        </div>
    );
}
