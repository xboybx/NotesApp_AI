// ============================================================
// app/(app)/profile/page.tsx
// User profile page — shows name, email, and avatar info.
// Simple for a POC — just displays the session data.
// ============================================================

"use client";

import { useSession } from "@/lib/auth/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return (
            <div className="max-w-2xl mx-auto p-6 md:p-10">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    const user = session?.user;

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-10">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        {/* Avatar circle with first letter of name */}
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                            {user?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                            <CardTitle className="text-xl">{user?.name || "User"}</CardTitle>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Name</p>
                            <p className="text-sm text-muted-foreground">{user?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Joined</p>
                            <p className="text-sm text-muted-foreground">
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })
                                    : "Unknown"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
