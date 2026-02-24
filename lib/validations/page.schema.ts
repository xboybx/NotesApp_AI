// ============================================================
// lib/validations/page.schema.ts
// Zod validation schemas for page (note) operations.
// These validate the request body BEFORE it hits the database.
// ============================================================

import { z } from "zod";

// ---- Create Page ----
// When creating a new page, only title is optional (defaults to "Untitled").
// Content starts empty — user fills it in the editor.
export const createPageSchema = z.object({
    title: z.string().optional().default("Untitled"),
    icon: z.string().optional(),
});

// ---- Update Page ----
// All fields are optional because you might update just the title,
// or just the content, or just add tags — not everything at once.
// .partial() makes every field optional automatically.
export const updatePageSchema = z.object({
    title: z.string().optional(),
    icon: z.string().nullable().optional(),
    coverImage: z.string().url().nullable().optional(),
    content: z.array(z.record(z.string(), z.unknown())).optional(), // BlockNote JSON blocks
    tags: z.array(z.string()).optional(),
    summary: z.string().nullable().optional(),
});

// ---- Inferred TypeScript Types ----
export type CreatePageData = z.infer<typeof createPageSchema>;
export type UpdatePageData = z.infer<typeof updatePageSchema>;
