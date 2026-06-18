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
import { createPortal } from "react-dom";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
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
    const [mounted, setMounted] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const generateContent = useAIContent();

    // Ensure portal only renders on the client side to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-focus the input when it opens
    useEffect(() => {
        if (isOpen) {
            textareaRef.current?.focus();
        }
    }, [isOpen]);

    // Auto-adjust textarea height on input changes
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [prompt]);

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
            console.log(`[FloatingAI] Sending prompt to AI: "${prompt}"`);
            const res = await generateContent.mutateAsync({
                pageId,
                title,
                content: getContent(),
                prompt: prompt.trim()
            });

            console.log(`[FloatingAI] Full API response received:`, res);

            if (res.success && res.data?.result) {
                const resultText = res.data.result as string;
                console.log(`[FloatingAI] Received result length: ${resultText.length} characters`);
                console.log(`[FloatingAI] Full AI response that will be pasted:\n`, resultText);

                console.log(`[FloatingAI] Passing result to onGenerated...`);
                onGenerated(resultText);

                setPrompt("");
                setIsOpen(false);
                toast.success(`Content generated! (${resultText.length} chars)`);
            } else {
                console.error("[FloatingAI] API returned success but no result:", res);
                toast.error("AI returned incomplete content");
            }
        } catch (err: unknown) {
            console.error("[FloatingAI] Generation error:", err);
            const msg = err instanceof Error ? err.message : "Failed to generate content";
            toast.error(msg);
        }
    };

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    if (!mounted) return null;

    return createPortal(
        <>
            {/* CSS Stylesheet for custom liquid blob animations */}
            <style>{`
                @keyframes float-blob-1 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -15px) scale(1.1); }
                    66% { transform: translate(-20px, 10px) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes float-blob-2 {
                    0% { transform: translate(0, 0) scale(1.1); }
                    50% { transform: translate(-25px, 15px) scale(0.95); }
                    100% { transform: translate(0, 0) scale(1.1); }
                }
                @keyframes float-blob-3 {
                    0% { transform: translate(0, 0) scale(0.9); }
                    50% { transform: translate(20px, -20px) scale(1.05); }
                    100% { transform: translate(0, 0) scale(0.9); }
                }
            `}</style>

            {/* Expanded Panel — Centered Bottom Bar */}
            {isOpen && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-[100] animate-slide-up">
                    <div className="
                        relative w-full rounded-[28px] overflow-hidden
                        border border-white/20 dark:border-white/10
                        shadow-[0_24px_50px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.2)]
                        backdrop-blur-[30px] bg-white/25 dark:bg-white/10
                        flex items-end px-4 py-3 gap-3
                    ">
                        {/* Glow Blobs behind the glass */}
                        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-purple-500/20 dark:bg-purple-400/10 blur-2xl pointer-events-none animate-[float-blob-1_10s_infinite_ease-in-out]" />
                        <div className="absolute left-1/2 -bottom-12 w-44 h-40 rounded-full bg-blue-400/20 dark:bg-blue-400/10 blur-2xl pointer-events-none animate-[float-blob-2_12s_infinite_ease-in-out]" />
                        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-pink-400/15 dark:bg-pink-400/10 blur-2xl pointer-events-none animate-[float-blob-3_8s_infinite_ease-in-out]" />

                        {/* Top shine */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                        {/* Sparkles Badge (No Background) */}
                        <div className="relative z-10 hidden sm:flex items-center justify-center h-10 w-10 flex-shrink-0">
                            <Sparkles className="h-5 w-5 text-black dark:text-white animate-pulse" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleGenerate} className="relative z-10 flex flex-1 items-end gap-3 w-full">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleTextareaKeyDown}
                                placeholder="Ask AI to write anything..."
                                className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/50 text-sm font-medium px-2 py-2 resize-none max-h-48 overflow-y-auto min-h-[40px] leading-relaxed"
                                disabled={generateContent.isPending}
                            />

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0 h-10">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="h-9 w-9 rounded-full flex items-center justify-center
                                            bg-muted/30 dark:bg-white/5 hover:bg-muted/50 dark:hover:bg-white/10
                                            text-muted-foreground hover:text-foreground transition-all duration-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || generateContent.isPending}
                                    className="h-9 w-9 rounded-full bg-transparent hover:bg-muted/30 dark:hover:bg-white/5 
                                            text-black dark:text-white disabled:opacity-30 disabled:text-muted-foreground/50 disabled:cursor-not-allowed 
                                            hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                                >
                                    {generateContent.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button — Liquid Glass in Bottom-Right */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="
                        fixed bottom-8 right-8 z-[100]
                        h-14 w-14 rounded-full
                        bg-white/10 dark:bg-black/25
                        backdrop-blur-[30px]
                        border border-white/25 dark:border-white/15
                        shadow-[0_4px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25)]
                        hover:shadow-[0_8px_32px_rgba(139,92,246,0.25),inset_0_1px_0_rgba(255,255,255,0.35)]
                        hover:scale-110 active:scale-95
                        transition-all duration-300
                        overflow-hidden group flex items-center justify-center
                    "
                >
                    {/* Glow Blobs behind the glass */}
                    <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-purple-500/30 dark:bg-purple-400/15 blur-md pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                    <div className="absolute -right-2 -bottom-2 w-10 h-10 rounded-full bg-blue-400/30 dark:bg-blue-400/15 blur-md pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                    {/* Top shine */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                    <Sparkles className="relative z-10 h-5 w-5 text-foreground group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
                </button>
            )}
        </>,
        document.body
    );
}