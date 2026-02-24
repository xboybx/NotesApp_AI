// ============================================================
// app/api/[[...route]]/route.ts
// The bridge between Next.js and Hono.
//
// Next.js uses the file system for routing. Any file inside app/api/
// becomes an API endpoint. The special name [[...route]] is a
// "catch-all" route — it matches ANY path starting with /api/.
//
// So when a browser calls:
//   GET  /api/health           → this file handles it → passes to Hono
//   POST /api/auth/sign-in/email → this file handles it → passes to Hono
//   GET  /api/notes            → this file handles it → passes to Hono
//
// Hono then looks at the route and calls the right handler.
// ============================================================

import { handle } from "hono/vercel";
import app from "@/lib/hono";

// Tell Next.js to run this on the Node.js runtime (not Edge).
// We need Node.js because MongoDB and Better Auth don't work on Edge.
export const runtime = "nodejs";

// Export Next.js route handlers for each HTTP method.
// "handle(app)" wraps our Hono app so Next.js understands it.
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
