// ============================================================
// lib/hono/index.ts
// The main Hono application instance.
// All API routes come together here and are mounted under /api.
//
// Route structure:
//   /api/auth/**  → Better Auth (login, register, logout, session)
//   /api/pages/** → Pages CRUD (list, create, read, update, delete)
//   /api/ai/**    → AI features (summarize, improve, tags)
//   /api/health   → Health check
// ============================================================

import { Hono } from "hono";
import { auth } from "@/lib/auth/auth";
import pagesRoutes from "@/lib/hono/routes/pages.routes";
import aiRoutes from "@/lib/hono/routes/ai.routes";

// Create the Hono app with /api base path.
// Every route registered here gets /api prepended automatically.
const app = new Hono().basePath("/api");

// ---------------------------------------------------------------
// BETTER AUTH ROUTES: /api/auth/**
// ---------------------------------------------------------------
// Delegates ALL auth routes to Better Auth's built-in handler.
// Better Auth creates these automatically:
//   POST /api/auth/sign-up/email  → Register new user
//   POST /api/auth/sign-in/email  → Login existing user
//   POST /api/auth/sign-out       → Logout (clear cookie)
//   GET  /api/auth/get-session    → Get current session/user
app.all("/auth/*", (c) => {
    return auth.handler(c.req.raw);
});//Hono gives the data to bettet Auth to handle user Crund Operations and betterAuth  handles all with handler

// ---------------------------------------------------------------
// PAGES ROUTES: /api/pages/**
// ---------------------------------------------------------------
// Mounts pagesRoutes at /pages. So pagesRoutes.get("/") becomes
// GET /api/pages, and pagesRoutes.get("/:id") becomes GET /api/pages/:id.
app.route("/pages", pagesRoutes);

// ---------------------------------------------------------------
// AI ROUTES: /api/ai/**
// ---------------------------------------------------------------
// POST /api/ai/summarize → Generate summary of a note
// POST /api/ai/improve   → Improve grammar and clarity
// POST /api/ai/tags      → Auto-generate tags
app.route("/ai", aiRoutes);

// ---------------------------------------------------------------
// HEALTH CHECK: GET /api/health
// ---------------------------------------------------------------
app.get("/health", (c) => {
    return c.json({
        success: true,
        message: "API is running!",
        timestamp: new Date().toISOString(),
    });
});

export default app;
