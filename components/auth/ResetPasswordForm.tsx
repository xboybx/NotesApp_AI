"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    resetPasswordSchema,
    type ResetPasswordFormData,
} from "@/lib/validations/auth.schema";
import { resetPassword } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const token = searchParams.get("token");
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    async function onSubmit(data: ResetPasswordFormData) {
        if (!token) {
            toast.error("This reset link is invalid or expired.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await resetPassword({
                newPassword: data.password,
                token,
            });

            if (result.error) {
                toast.error(result.error.message || "Unable to reset password.");
                return;
            }

            toast.success("Password updated. You can now sign in.");
            router.push("/login");
        } catch {
            toast.error("This reset link is invalid or expired.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
                <CardDescription>Choose a new password for your account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4 pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="password">New password</Label>
                        <Input id="password" type="password" disabled={isLoading || !token} {...register("password")} />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm new password</Label>
                        <Input id="confirmPassword" type="password" disabled={isLoading || !token} {...register("confirmPassword")} />
                        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                    </div>
                    {!token && <p className="text-sm text-destructive">This reset link is invalid or expired.</p>}
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading || !token}>
                        {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating password...</> : "Update password"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
