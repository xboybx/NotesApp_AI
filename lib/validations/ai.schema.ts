// ============================================================
// lib/validations/ai.schema.ts
// Zod validation schemas for AI feature requests.
// Validates the request body before we call OpenAI.
// ============================================================

import { z } from "zod";

// All AI endpoints share the same request body shape
export const aiRequestSchema = z.object({
    pageId: z.string().min(1, "Page ID is required"),
    content: z.string().min(1, "Content is required for AI processing"),
    title: z.string().optional(),
    selection: z.string().optional(), // for "improve" — user-selected text only
});

export type AIRequestData = z.infer<typeof aiRequestSchema>;
