// ============================================================
// lib/auth/auth-client.ts
// Better Auth CLIENT-SIDE helper.
//
// There are TWO sides to Better Auth:
//   1. auth.ts      → SERVER side (reads DB, validates sessions)
//   2. auth-client.ts → CLIENT side (sends requests from the browser)
//
// This file is used inside React components ("use client").
// It communicates with the Better Auth server handler at /api/auth/*.
// ============================================================

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // The base URL where Better Auth's API lives.
    // In dev: http://localhost:3000
    // In prod: your deployed URL (from env)
    baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

// Export individual methods from the client for easy use in components:
//
// signIn   → logs in an existing user
//           Usage: await signIn.email({ email, password })
//
// signUp   → creates a new account
//           Usage: await signUp.email({ name, email, password })
//
// signOut  → logs out the current user (clears the cookie)
//           Usage: await signOut()
//
// useSession → React hook to get the current logged-in user
//              Usage: const { data: session } = useSession()
//              Returns: { user: { id, name, email, ... } } or null
export const { signIn, signUp, signOut, useSession } = authClient;
