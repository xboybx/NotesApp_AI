// ============================================================
// components/auth/LoginForm.tsx
// The login form — users enter email + password to log in.
//
// How it works:
// 1. React Hook Form manages the input values and form state
// 2. Zod validates the inputs (email format, password length)
// 3. On submit → calls Better Auth's signIn.email() method
// 4. Better Auth sends POST to /api/auth/sign-in/email
// 5. If success → cookie is set, user is redirected to /dashboard
// 6. If error → toast notification shows the error message
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Our Zod schema defines what a valid login looks like
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";

// Better Auth client — sends requests to /api/auth/*
import { signIn, useSession } from "@/lib/auth/auth-client";

// shadcn/ui components
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

export function LoginForm() {
    const router = useRouter();
    const { data: session, isPending: isSessionPending } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (session?.user) {
            router.push("/dashboard");
        }
    }, [session, router]);

    // React Hook Form setup:
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Loading state before login while checking session or if already logged in
    if (isSessionPending || session?.user) {
        return (
            <Card className="w-full max-w-md p-10 text-center flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="space-y-1">
                    <p className="text-base font-semibold">
                        {session?.user ? "Redirecting to workspace..." : "Checking credentials..."}
                    </p>
                    <p className="text-xs text-muted-foreground">Please wait a moment</p>
                </div>
            </Card>
        );
    }

    // This runs ONLY if Zod validation passes (email format ok, password length ok)
    async function onSubmit(data: LoginFormData) {
        setIsLoading(true);

        try {
            const result = await signIn.email({
                email: data.email,
                password: data.password,
            });

            if (result.error) {
                toast.error(result.error.message || "Login failed. Please try again.");
                setIsLoading(false);
                return;
            }

            setIsRedirecting(true);
            toast.success("Welcome back!");
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
            setIsRedirecting(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>

            {/* handleSubmit(onSubmit) → validates with Zod FIRST, then calls onSubmit */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4 pb-6">
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            disabled={isLoading}
                            {...register("email")} // connects this input to React Hook Form
                        />
                        {/* Show Zod validation error if email is invalid */}
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••"
                                disabled={isLoading}
                                className="pr-10"
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading || isRedirecting}>
                        {isRedirecting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Redirecting to workspace...
                            </>
                        ) : isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                        <Link
                            href="/forgot-password"
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </p>

                    <p className="text-sm text-muted-foreground text-center">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}