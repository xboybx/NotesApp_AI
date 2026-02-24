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

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Our Zod schema defines what a valid login looks like
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";

// Better Auth client — sends requests to /api/auth/*
import { signIn } from "@/lib/auth/auth-client";

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
    const [isLoading, setIsLoading] = useState(false);

    // React Hook Form setup:
    // - register: connects an <input> to the form (tracks its value)
    // - handleSubmit: wraps our submit function with validation
    // - formState.errors: contains any validation errors from Zod
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema), // tells RHF to use our Zod schema for validation
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // This runs ONLY if Zod validation passes (email format ok, password length ok)
    async function onSubmit(data: LoginFormData) {
        setIsLoading(true);

        try {
            // signIn.email() → POST /api/auth/sign-in/email
            // Better Auth checks the email+password against the DB,
            // and if valid, sets the session cookie automatically.
            const result = await signIn.email({
                email: data.email,
                password: data.password,
            });

            if (result.error) {
                toast.error(result.error.message || "Login failed. Please try again.");
                return;
            }

            toast.success("Welcome back!");
            router.push("/dashboard"); // redirect to dashboard after login
            router.refresh(); // refresh the page to pick up the new session
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false); // re-enable the button
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
                <CardContent className="space-y-4">
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
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••"
                            disabled={isLoading}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>

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
