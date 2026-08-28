"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import {
    forgotPasswordSchema,
    type ForgotPasswordFormData,
} from "@/lib/validations/auth.schema";
import { requestPasswordReset } from "@/lib/auth/auth-client";
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

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(data: ForgotPasswordFormData) {
        setIsLoading(true);
        try {
            const result = await requestPasswordReset({
                email: data.email,
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (result.error) {
                toast.error(result.error.message || "Unable to send reset email.");
                return;
            }

            setSubmitted(true);
        } catch {
            toast.error("Unable to send reset email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    if (submitted) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <MailCheck className="mx-auto h-10 w-10" />
                    <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                    <CardDescription>
                        If an account exists for that email, we sent a password reset link.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                    <Link href="/login" className="text-sm text-primary underline-offset-4 hover:underline">
                        Back to sign in
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
                <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4 pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" disabled={isLoading} {...register("email")} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending link...</> : "Send reset link"}
                    </Button>
                    <Link href="/login" className="text-sm text-primary underline-offset-4 hover:underline">
                        Back to sign in
                    </Link>
                </CardFooter>
            </form>
        </Card>
    );
}
