// ============================================================
// app/(auth)/register/loading.tsx
// Loading skeleton for the register page shown before the page renders.
// ============================================================

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-sm">
                <CardHeader className="text-center space-y-2">
                    <Skeleton className="h-8 w-52 mx-auto" />
                    <Skeleton className="h-4 w-60 mx-auto" />
                </CardHeader>

                <CardContent className="space-y-4 pb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                </CardFooter>
            </Card>
        </div>
    );
}
