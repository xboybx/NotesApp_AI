import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = {
    title: "Forgot Password — AI Notes",
    description: "Request a password reset link",
};

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <ForgotPasswordForm />
        </div>
    );
}
