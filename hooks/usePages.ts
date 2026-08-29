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
        queryKey: ["pages"],
        queryFn: () => fetchApi<PageListItem[]>("/api/pages"),
    });
}

// ---------------------------------------------------------------
// usePage(id) — Get a SINGLE page with full content
// ---------------------------------------------------------------
// Used by the editor page to load the full BlockNote content.
export function usePage(pageId: string) {
    return useQuery({
        queryKey: ["page", pageId],
        queryFn: () => fetchApi<PageType>(`/api/pages/${pageId}`),
        enabled: !!pageId,
    });
}

// ---------------------------------------------------------------
// useCreatePage() — Create a new blank page
// ---------------------------------------------------------------
export function useCreatePage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title?: string; icon?: string }) =>
            fetchApi<PageType>("/api/pages", {
                method: "POST",
                body: JSON.stringify(data),
            }),

        onSuccess: (res) => {
            const pageData = res.data;
            if (pageData) {
                // Optimistically insert new page into sidebar list cache
                queryClient.setQueryData<ApiResponse<PageListItem[]>>(
                    ["pages"],
                    (old) => {
                        if (!old?.data) return old;
                        const newItem: PageListItem = {
                            _id: pageData._id,
                            title: pageData.title,
                            icon: pageData.icon,
                            isFavorite: pageData.isFavorite,
                            isArchived: pageData.isArchived,
                            updatedAt: pageData.updatedAt || new Date().toISOString(),
                        };
                        return { ...old, data: [newItem, ...old.data] };
                    }
                );
                // Pre-populate page detail cache
                queryClient.setQueryData(["page", pageData._id], res);
            }
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

        onMutate: async ({ pageId, data }) => {
            const nowIso = new Date().toISOString();

            // Optimistically update sidebar metadata if title or icon changed
            if (data.title !== undefined || data.icon !== undefined) {
                queryClient.setQueryData<ApiResponse<PageListItem[]>>(
                    ["pages"],
                    (old) => {
                        if (!old?.data) return old;
                        return {
                            ...old,
                            data: old.data.map((p) =>
                                p._id === pageId
                                    ? {
                                          ...p,
                                          ...(data.title !== undefined ? { title: data.title } : {}),
                                          ...(data.icon !== undefined ? { icon: data.icon } : {}),
                                          updatedAt: nowIso,
                                      }
                                    : p
                            ),
                        };
                    }
                );
            }

            // Optimistically update page detail cache
            queryClient.setQueryData<ApiResponse<PageType>>(
                ["page", pageId],
                (old) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            ...data,
                            updatedAt: nowIso,
                        },
                    };
                }
            );
        },

        onSuccess: (res, variables) => {
            if (res.data) {
                queryClient.setQueryData(["page", variables.pageId], res);
            }
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
            fetchApi<{ isFavorite: boolean }>(`/api/pages/${pageId}/favorite`, {
                method: "PATCH",
            }),

        onMutate: async (pageId) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ["pages"] });
            await queryClient.cancelQueries({ queryKey: ["page", pageId] });

            // Optimistically flip favorite in sidebar
            queryClient.setQueryData<ApiResponse<PageListItem[]>>(
                ["pages"],
                (old) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: old.data.map((p) =>
                            p._id === pageId ? { ...p, isFavorite: !p.isFavorite } : p
                        ),
                    };
                }
            );

            // Optimistically flip favorite in active page cache
            queryClient.setQueryData<ApiResponse<PageType>>(
                ["page", pageId],
                (old) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            isFavorite: !old.data.isFavorite,
                        },
                    };
                }
            );
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
            fetchApi<{ isArchived: boolean }>(`/api/pages/${pageId}/archive`, {
                method: "PATCH",
            }),

        onMutate: async (pageId) => {
            // Optimistically remove from active pages list
            queryClient.setQueryData<ApiResponse<PageListItem[]>>(
                ["pages"],
                (old) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: old.data.filter((p) => p._id !== pageId),
                    };
                }
            );
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pages", "trash"] });
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
            queryClient.invalidateQueries({ queryKey: ["pages", "trash"] });
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