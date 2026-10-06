// ============================================================
// app/(auth)/login/loading.tsx
// Loading skeleton for the login page shown before the page renders.
// ============================================================

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-sm">
                <CardHeader className="text-center space-y-2">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </CardHeader>

                <CardContent className="space-y-4 pb-6">
                    {/* Email field skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                    {/* Password field skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    {/* Submit button skeleton */}
                    <Skeleton className="h-10 w-full rounded-md" />
                    {/* Links skeleton */}
                    <Skeleton className="h-4 w-28 mx-auto" />
                    <Skeleton className="h-4 w-44 mx-auto" />
                </CardFooter>
            </Card>
        </div>
    );
}
