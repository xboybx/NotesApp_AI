// ============================================================
// hooks/useAI.ts
// React Query hooks for AI features.
//
// These hooks call the AI API endpoints and manage loading states.
// Each AI feature is a "mutation" (POST request that changes data).
//
// Usage in components:
//   const summarize = useSummarize();
//   await summarize.mutateAsync({ pageId, content, title });
//   // summarize.data.data.result → "This is the summary..."
// ============================================================

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AIResponse, ApiResponse, PageType } from "@/types";

// Helper: make POST requests to AI endpoints
async function callAI(
    endpoint: string,
    data: {
        pageId: string;
        content: string;
        title?: string;
        selection?: string;
        prompt?: string;
    }
): Promise<ApiResponse<AIResponse>> {
    const response = await fetch(`/api/ai/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "AI request failed");
    }

    return result;
}

// ---------------------------------------------------------------
// useSummarize() — Generate AI summary
// ---------------------------------------------------------------
export function useSummarize() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            pageId: string;
            content: string;
            title?: string;
        }) => callAI("summarize", data),

        onSuccess: (res, variables) => {
            if (res.data?.result && typeof res.data.result === "string") {
                const summaryText = res.data.result;
                queryClient.setQueryData<ApiResponse<PageType>>(
                    ["page", variables.pageId],
                    (old) => {
                        if (!old?.data) return old;
                        return {
                            ...old,
                            data: {
                                ...old.data,
                                summary: summaryText,
                            },
                        };
                    }
                );
            }
        },
    });
}

// ---------------------------------------------------------------
// useImprove() — Improve text quality
// ---------------------------------------------------------------
// Does NOT invalidate queries — user must manually accept the improvement
export function useImprove() {
    return useMutation({
        mutationFn: (data: {
            pageId: string;
            content: string;
            selection?: string;
        }) => callAI("improve", data),
    });
}

// ---------------------------------------------------------------
// useGenerateTags() — Auto-generate tags
// ---------------------------------------------------------------
export function useGenerateTags() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            pageId: string;
            content: string;
            title?: string;
        }) => callAI("tags", data),

        onSuccess: (res, variables) => {
            if (res.data?.result && Array.isArray(res.data.result)) {
                const tagList = res.data.result;
                queryClient.setQueryData<ApiResponse<PageType>>(
                    ["page", variables.pageId],
                    (old) => {
                        if (!old?.data) return old;
                        return {
                            ...old,
                            data: {
                                ...old.data,
                                tags: tagList,
                            },
                        };
                    }
                );
            }
        },
    });
}

// ---------------------------------------------------------------
// useAIContent() — Generate new content from a prompt
// ---------------------------------------------------------------
export function useAIContent() {
    return useMutation({
        mutationFn: (data: {
            pageId: string;
            content: string;
            title?: string;
            prompt: string;
        }) => callAI("generate", data),
    });
}
