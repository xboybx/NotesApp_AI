// ============================================================
// lib/hono/middlewares/auth.middleware.ts
// Hono middleware that protects API routes.
//
// "Middleware" in Hono is a function that runs BEFORE a route handler.
// This one checks if the incoming request has a valid session cookie.
// If yes  → attaches the user to context and moves on to the route.
// If no   → immediately returns 401 Unauthorized and stops everything.
//
// Usage in routes:
//   app.get("/notes", authMiddleware, (c) => { ... })
//                     ^^^^^^^^^^^^^
//                     runs first, before the handler
// ============================================================

import type { Context, Next } from "hono";
import { auth } from "@/lib/auth/auth";

export async function authMiddleware(c: Context, next: Next) {
    // auth.api.getSession() reads the HTTP-only cookie from the request headers,
    // verifies the JWT token, and looks up the session in MongoDB.
    // Returns null if no valid session found.
    const session = await auth.api.getSession({
        headers: c.req.raw.headers, // pass raw headers from the incoming request
    });

    // No session = not logged in → block access
    if (!session) {
        return c.json(
            {
                success: false,
                error: "Unauthorized. Please log in to continue.",
            },
            401 // HTTP 401 = Unauthorized
        );
    }

    // Session found! Attach user and session data to Hono's context.
    // This makes them accessible in any route handler via:
    //   const user = c.get("user")      → { id, name, email, ... }
    //   const session = c.get("session") → { id, expiresAt, ... }
    c.set("user", session.user);
    c.set("session", session.session);

    // Move on to the actual route handler
    await next();
}
