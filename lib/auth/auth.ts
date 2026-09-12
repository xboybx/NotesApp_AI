import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { sendPasswordResetEmail } from "@/lib/email/resend";

declare global {
    var _mongoClient: MongoClient | undefined;
}

// For connecting BetterAuth with MongoDB using connection pooling and singleton cache
if (!global._mongoClient) {
    global._mongoClient = new MongoClient(process.env.MONGODB_URI!, {
        maxPoolSize: 10,
        minPoolSize: 2,
    });
}
const client = global._mongoClient;
const db = client.db("notes_app_ai");

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({
                email: user.email,
                name: user.name,
                url,
            });
        },
        resetPasswordTokenExpiresIn: 60 * 60,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },
    trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;