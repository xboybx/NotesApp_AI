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
import { Sparkles, Send, X, Loader2, Globe } from "lucide-react";
import { useAIContent } from "@/hooks/useAI";
import { isWebSearchQuery } from "@/lib/ai/search";
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
    const [isSearchingWeb, setIsSearchingWeb] = useState(false);
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

    // Only fallback to JS resizing if modern CSS field-sizing is not supported
    useEffect(() => {
        if (typeof CSS !== "undefined" && CSS.supports("field-sizing", "content")) {
            return; // Native CSS handles it with 0 JS overhead
        }
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

        const willSearch = isWebSearchQuery(prompt.trim());
        setIsSearchingWeb(willSearch);

        try {
            console.log(`[FloatingAI] Sending prompt to AI: "${prompt}" (Web search: ${willSearch})`);
            const res = await generateContent.mutateAsync({
                pageId,
                title,
                content: getContent(),
                prompt: prompt.trim(),
                searchWeb: willSearch,
            });

            console.log(`[FloatingAI] Full API response received:`, res);

            if (res.success && res.data?.result) {
                const resultText = res.data.result as string;
                console.log(`[FloatingAI] Received result length: ${resultText.length} characters`);
                console.log(`[FloatingAI] Passing result to onGenerated...`);
                onGenerated(resultText);

                setPrompt("");
                setIsSearchingWeb(false);
                setIsOpen(false);
                
                const searchedWeb = (res.data as { searchedWeb?: boolean })?.searchedWeb;
                toast.success(
                    searchedWeb
                        ? "Content generated with live DuckDuckGo web search!"
                        : `Content generated! (${resultText.length} chars)`
                );
            } else {
                console.error("[FloatingAI] API returned success but no result:", res);
                toast.error("AI returned incomplete content");
                setIsSearchingWeb(false);
            }
        } catch (err: unknown) {
            console.error("[FloatingAI] Generation error:", err);
            const msg = err instanceof Error ? err.message : "Failed to generate content";
            toast.error(msg);
            setIsSearchingWeb(false);
        }
    };

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleGenerate();
        }
    };

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Modern GPU-accelerated Bubble Bloom Animation (Compositor only, zero CPU layout cost) */}
            <style>{`
                @keyframes bubble-bloom {
                    0% {
                        transform: scale(0.12);
                        opacity: 0;
                    }
                    75% {
                        transform: scale(1.02);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .bubble-bloom-enter {
                    transform-origin: bottom right;
                    animation: bubble-bloom 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    will-change: transform, opacity;
                }
            `}</style>

            {/* Expanded Panel — Bubble expanding out from bottom-right circle */}
            {isOpen && (
                <div className="fixed bottom-8 right-8 w-[calc(100vw-4rem)] max-w-xl z-[100] bubble-bloom-enter">
                    <div className="
                        relative w-full rounded-[28px]
                        border border-black/15 dark:border-white/20
                        shadow-2xl shadow-black/10 dark:shadow-black/50
                        bg-white dark:bg-black
                        text-black dark:text-white
                        flex items-center px-4 py-2.5 gap-3
                        transition-colors duration-200
                    ">
                        {/* First Icon — AI / Globe with Blinking Glow during search */}
                        <div 
                            className="relative z-10 flex items-center justify-center h-10 w-10 flex-shrink-0"
                            title={isSearchingWeb || isWebSearchQuery(prompt.trim()) ? "Live Web Search Active" : "Ask AI"}
                        >
                            {isSearchingWeb ? (
                                <Globe className="h-5 w-5 text-black dark:text-white animate-[pulse_1s_ease-in-out_infinite] drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
                            ) : isWebSearchQuery(prompt.trim()) ? (
                                <Globe className="h-5 w-5 text-black dark:text-white transition-all" />
                            ) : (
                                <Sparkles className="h-5 w-5 text-black dark:text-white transition-all" />
                            )}
                        </div>

                        {/* Form: Horizontal-only alignment with 0 layout reflow */}
                        <form onSubmit={handleGenerate} className="relative z-10 flex flex-1 items-center gap-3 w-full">
                            {generateContent.isPending ? (
                                <div className="flex-1 flex items-center py-2 min-h-[40px] text-sm animate-pulse text-black dark:text-white font-medium select-none">
                                    {isSearchingWeb ? (
                                        <span className="truncate">Searching the web...</span>
                                    ) : (
                                        <span className="truncate">Writing response...</span>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleTextareaKeyDown}
                                    placeholder="Ask AI to write anything..."
                                    style={{ fieldSizing: "content" }}
                                    className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm font-normal px-2 py-2 resize-none max-h-48 overflow-y-auto min-h-[40px] leading-relaxed"
                                    disabled={generateContent.isPending}
                                />
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0 h-10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsSearchingWeb(false);
                                    }}
                                    title="Close"
                                    className="h-9 w-9 rounded-full flex items-center justify-center
                                            bg-transparent hover:bg-black/5 dark:hover:bg-white/10
                                            text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-all duration-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || generateContent.isPending}
                                    title={prompt.trim() ? "Send to AI" : "Enter prompt first"}
                                    className={`
                                        h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                                        ${
                                            prompt.trim() && !generateContent.isPending
                                                ? "hover:bg-black/10 dark:hover:bg-white/15 text-black dark:text-white hover:scale-105 active:scale-95 cursor-pointer"
                                                : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                                        }
                                    `}
                                >
                                    {generateContent.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-black dark:text-white" />
                                    ) : (
                                        <Send className="h-4 w-4 text-black dark:text-white" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button — Pure Black & White in Bottom-Right */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="
                        fixed bottom-8 right-8 z-[100]
                        h-14 w-14 rounded-full
                        bg-white dark:bg-black
                        border border-black/15 dark:border-white/20
                        shadow-lg shadow-black/10 dark:shadow-black/50
                        hover:scale-110 active:scale-95
                        transition-all duration-300
                        flex items-center justify-center
                    "
                >
                    <Sparkles className="h-5 w-5 text-black dark:text-white transition-transform duration-300 group-hover:rotate-12" />
                </button>
            )}
        </>,
        document.body
    );
}