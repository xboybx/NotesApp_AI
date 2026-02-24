// ============================================================
// app/(auth)/login/page.tsx
// Login page — uses the (auth) route group.
//
// Route groups = folders with parentheses like (auth).
// They let you share a layout WITHOUT affecting the URL.
// This page is at /login (NOT /auth/login).
// ============================================================

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
    title: "Login — AI Notes",
    description: "Sign in to your AI-powered note-taking app",
};

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <LoginForm />
        </div>
    );
}
