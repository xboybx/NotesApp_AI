// ============================================================
// hooks/usePages.ts
// React Query hooks for pages (notes).
//
// These hooks handle all communication between the frontend
// and the backend for page operations. They use TanStack Query
// which provides:
//   - Automatic caching (don't re-fetch if data is fresh)
//   - Loading states (isLoading, isPending)
//   - Error states (isError, error)
//   - Mutation helpers (auto-refresh data after create/update/delete)
//
// HOW IT WORKS:
//   useQuery  → for GET requests (reading data)
//   useMutation → for POST/PATCH/DELETE requests (changing data)
//
// After a mutation succeeds, we call queryClient.invalidateQueries()
// which tells React Query: "the old data is stale, re-fetch it."
// This keeps the sidebar and editor automatically in sync.
// ============================================================

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PageType, PageListItem, ApiResponse } from "@/types";

// ---- Helper: make API calls ----
// A simple wrapper around fetch that:
//   1. Adds the Content-Type header
//   2. Throws an error if the response is not OK (4xx, 5xx)
//   3. Parses the JSON response
async function fetchApi<T>(
    url: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
    }

    return data;
}

// ---------------------------------------------------------------
// usePages() — Get ALL pages for the sidebar
// ---------------------------------------------------------------
// Returns: { data, isLoading, isError }
// data.data = PageListItem[] (title, icon, favorite, date — no content)
export function usePages() {
    return useQuery({
        // queryKey: a unique identifier for this cached data.
        // React Query uses this to know WHAT data to cache/invalidate.
        queryKey: ["pages"],

        // queryFn: the function that actually fetches the data.
        queryFn: () => fetchApi<PageListItem[]>("/api/pages"),
    });
}

// ---------------------------------------------------------------
// usePage(id) — Get a SINGLE page with full content
// ---------------------------------------------------------------
// Used by the editor page to load the full BlockNote content.
export function usePage(pageId: string) {
    return useQuery({
        queryKey: ["page", pageId], // unique per page ID
        queryFn: () => fetchApi<PageType>(`/api/pages/${pageId}`),
        enabled: !!pageId, // don't fetch if pageId is empty/undefined
    });
}

// ---------------------------------------------------------------
// useCreatePage() — Create a new blank page
// ---------------------------------------------------------------
// Returns a mutation function: createPage.mutateAsync({ title, icon })
export function useCreatePage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title?: string; icon?: string }) =>
            fetchApi<PageType>("/api/pages", {
                method: "POST",
                body: JSON.stringify(data),
            }),

        // After creating a page, tell React Query to re-fetch the pages list.
        // This updates the sidebar automatically without a manual refresh.
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
        },
    });
}

// ---------------------------------------------------------------
// useUpdatePage() — Update a page (auto-save, title change, etc.)
// ---------------------------------------------------------------
export function useUpdatePage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pageId,
            data,
        }: {
            pageId: string;
            data: Partial<PageType>;
        }) =>
            fetchApi<PageType>(`/api/pages/${pageId}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            }),

        onSuccess: (_, variables) => {
            // Invalidate BOTH: the pages list (sidebar) AND the specific page
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({
                queryKey: ["page", variables.pageId],
            });
        },
    });
}

// ---------------------------------------------------------------
// useToggleFavorite() — Toggle a page's favorite status
// ---------------------------------------------------------------
export function useToggleFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (pageId: string) =>
            fetchApi(`/api/pages/${pageId}/favorite`, { method: "PATCH" }),

        onSuccess: (_, pageId) => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["page", pageId] });
        },
    });
}

// ---------------------------------------------------------------
// useArchivePage() — Move page to/from trash
// ---------------------------------------------------------------
export function useArchivePage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (pageId: string) =>
            fetchApi(`/api/pages/${pageId}/archive`, { method: "PATCH" }),

        onSuccess: (_, pageId) => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
            queryClient.invalidateQueries({ queryKey: ["page", pageId] });
        },
    });
}

// ---------------------------------------------------------------
// useDeletePage() — Permanently delete a page
// ---------------------------------------------------------------
export function useDeletePage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (pageId: string) =>
            fetchApi(`/api/pages/${pageId}`, { method: "DELETE" }),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages"] });
        },
    });
}

// ---------------------------------------------------------------
// useSearchPages() — Search pages by title
// ---------------------------------------------------------------
export function useSearchPages(query: string) {
    return useQuery({
        queryKey: ["pages", "search", query],
        queryFn: () =>
            fetchApi<PageListItem[]>(
                `/api/pages/search?q=${encodeURIComponent(query)}`
            ),
        enabled: query.length > 0, // only search if there's a query
    });
}

// ---------------------------------------------------------------
// useTrashPages() — Get all trashed (archived) pages
// ---------------------------------------------------------------
export function useTrashPages() {
    return useQuery({
        queryKey: ["pages", "trash"],
        queryFn: () => fetchApi<PageListItem[]>("/api/pages/trash"),
    });
}
