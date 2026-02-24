// ============================================================
// app/(app)/pages/[pageId]/loading.tsx
// Loading skeleton for the page editor.
// Next.js automatically shows this while the page component loads.
// ============================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoading() {
    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            {/* Title skeleton */}
            <Skeleton className="h-10 w-3/4 mb-4" />

            {/* Tag badges skeleton */}
            <div className="flex gap-2 mb-6">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
            </div>

            {/* Content block skeletons */}
            <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-4/6" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
            </div>
        </div>
    );
}
