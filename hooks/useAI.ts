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
import type { AIResponse, ApiResponse } from "@/types";

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
// After success, invalidates the page query to show the cached summary
export function useSummarize() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            pageId: string;
            content: string;
            title?: string;
        }) => callAI("summarize", data),

        // After summarize succeeds, the summary is saved to the DB.
        // We invalidate the page query so the UI shows the new summary.
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["page", variables.pageId],
            });
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
// After success, invalidates the page query to show the new tags
export function useGenerateTags() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            pageId: string;
            content: string;
            title?: string;
        }) => callAI("tags", data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["page", variables.pageId],
            });
            // Also refresh sidebar (tags might affect display later)
            queryClient.invalidateQueries({ queryKey: ["pages"] });
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
