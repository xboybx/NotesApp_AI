// ============================================================
// components/providers.tsx
// Wraps the entire app with all global "providers."
// A provider in React is a component that makes some global value
// (like theme, or cached data) available to ALL child components.
//
// We have 3 providers:
//   1. QueryClientProvider → powers data fetching (TanStack Query)
//   2. ThemeProvider       → powers dark/light mode (next-themes)
//   3. Toaster             → shows toast notifications (sonner)
// ============================================================

"use client"; // This file uses React hooks, so it must be a Client Component

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

// Props: just the children (everything inside the app)
interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    // We create the QueryClient INSIDE the component using useState.
    // Why? If we created it outside, it would be shared across ALL users
    // in server-side rendering — which would leak one user's data to another!
    // useState ensures each render gets its own fresh instance.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // "staleTime" of 5 minutes keeps client cache warm and fresh while
                        // optimistic updates keep state 100% accurate in real-time.
                        staleTime: 5 * 60 * 1000, // 5 minutes
                        gcTime: 15 * 60 * 1000,    // 15 minutes garbage collection time
                        refetchOnWindowFocus: false, // Prevents background fetch storms on tab switch
                        retry: 1, // if a request fails, retry it once before showing error
                    },
                },
            })
    );

    return (
        // 1. TanStack Query: makes useQuery() and useMutation() work everywhere
        <QueryClientProvider client={queryClient}>
            {/* 2. next-themes: adds dark/light mode support */}
            <ThemeProvider
                attribute="class" // adds class="dark" to <html> tag when dark mode
                defaultTheme="system" // follows the user's OS preference by default
                enableSystem // allows the "system" option
                disableTransitionOnChange // prevents a flash when switching themes
            >
                {children}

                {/* 3. Toaster: renders toast notification UI at the top of the page */}
                <Toaster richColors position="top-right" />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
