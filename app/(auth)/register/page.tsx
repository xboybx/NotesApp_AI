// ============================================================
// app/(auth)/register/page.tsx
// Register page — same (auth) route group as login.
// Accessible at /register (NOT /auth/register).
// ============================================================

import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
    title: "Register — AI Notes",
    description: "Create a new account for the AI-powered note-taking app",
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <RegisterForm />
        </div>
    );
}
