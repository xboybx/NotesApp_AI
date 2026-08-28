const brevoApiKey = process.env.MAIL_API_KEY;

function escapeHtml(value: string) {
    return value.replace(
        /[&<>'"]/g,
        (character) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
            })[character] ?? character
    );
}

export async function sendPasswordResetEmail({
    email,
    name,
    url,
}: {
    email: string;
    name: string;
    url: string;
}) {
    const senderEmail = process.env.MAIL_FROM_EMAIL;

    if (!brevoApiKey || !senderEmail) {
        throw new Error("Brevo email configuration is missing");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            accept: "application/json",
            "api-key": brevoApiKey,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            sender: {
                name: "NoteWise AI",
                email: senderEmail,
            },
            to: [
                {
                    email,
                },
            ],
            subject: "Reset your NoteWise AI password",
            htmlContent: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202020; max-width: 560px;">
                    <h1>Reset your password</h1>
                    <p>Hi ${escapeHtml(name)},</p>
                    <p>We received a request to reset your NoteWise AI password.</p>
                    <p>
                        <a href="${escapeHtml(url)}"
                           style="display: inline-block; background: #202020; color: #fff; padding: 12px 18px; text-decoration: none; border-radius: 6px;">
                            Reset password
                        </a>
                    </p>
                    <p>This link expires in one hour.</p>
                    <p>If you did not request this, you can ignore this email.</p>
                </div>
            `,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Brevo email failed: ${errorText}`);
    }
}