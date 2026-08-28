import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
    title: "Reset Password — AI Notes",
    description: "Choose a new password",
};

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <ResetPasswordForm />
        </div>
    );
}
