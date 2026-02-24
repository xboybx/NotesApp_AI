// ============================================================
// lib/hono/routes/ai.routes.ts
// API routes for AI features — summarize, improve, generate tags.
//
// Each route:
//   1. Validates the request body with Zod
//   2. Sends the content to OpenAI with a specific prompt
//   3. Returns the AI result to the frontend
//   4. Optionally saves the result to the page in MongoDB
//
// All routes are protected — user must be logged in.
// ============================================================

import { Hono } from "hono";
import { authMiddleware } from "@/lib/hono/middlewares/auth.middleware";
import openai from "@/lib/ai/openai";
import {
    getSummarizePrompt,
    getImprovePrompt,
    getTagsPrompt,
    getGeneratePrompt,
} from "@/lib/ai/prompts";
import connectDB from "@/lib/db/mongodb";
import Page from "@/lib/db/page.model";

const aiRoutes = new Hono();

// Apply auth middleware to all AI routes
aiRoutes.use("*", authMiddleware);

// ---------------------------------------------------------------
// POST /ai/summarize — Generate summary of note content
// ---------------------------------------------------------------
// Input:  { pageId, content, title }
// Output: { result: "summary text here" }
// Side effect: saves the summary to the page's "summary" field
aiRoutes.post("/summarize", async (c) => {
    try {
        // 1. Extract request body (manual, avoids Zod version conflict from BlockNote)
        const body = await c.req.json();
        const pageId = typeof body.pageId === "string" ? body.pageId : "";
        const content = typeof body.content === "string" ? body.content : "";
        const title = typeof body.title === "string" ? body.title : "Untitled";
        if (!pageId || !content) {
            return c.json({ success: false, error: "pageId and content are required" }, 400);
        }

        // 2. Check content isn't empty/too short
        if (content.trim().length < 20) {
            return c.json(
                {
                    success: false,
                    error: "Note content is too short to summarize. Add more content!",
                },
                400
            );
        }

        // 3. Call OpenAI with our summarize prompt
        const response = await openai.chat.completions.create({
            model: "arcee-ai/trinity-large-preview:free",
            messages: getSummarizePrompt(title || "Untitled", content),
            max_tokens: 200,
            temperature: 0.3,
        });

        // Log full response for debugging
        console.log("[AI Summarize] finish_reason:", response.choices[0]?.finish_reason);
        console.log("[AI Summarize] content:", response.choices[0]?.message?.content);

        // 4. Extract the AI's response text
        const summary = response.choices[0]?.message?.content?.trim() || "";

        if (!summary) {
            return c.json(
                { success: false, error: "AI returned an empty response" },
                500
            );
        }

        // 5. Save the summary to the page in MongoDB (caching it)
        await connectDB();
        await Page.findByIdAndUpdate(pageId, { summary });

        // 6. Return the summary to the frontend
        return c.json({ success: true, data: { result: summary } });
    } catch (error: unknown) {
        console.error("AI Summarize error:", error);

        // Handle OpenAI-specific errors
        if (error instanceof Error && error.message.includes("rate limit")) {
            return c.json(
                {
                    success: false,
                    error: "AI rate limit reached. Please try again in a moment.",
                },
                429
            );
        }

        return c.json(
            { success: false, error: "Failed to generate summary" },
            500
        );
    }
});

// ---------------------------------------------------------------
// POST /ai/improve — Improve grammar and clarity of text
// ---------------------------------------------------------------
// Input:  { pageId, content, selection? }
// Output: { result: "improved text here" }
// Does NOT auto-save — user gets to review and accept/reject
aiRoutes.post("/improve", async (c) => {
    try {
        const body = await c.req.json();
        const content = typeof body.content === "string" ? body.content : "";
        const selection = typeof body.selection === "string" ? body.selection : undefined;

        const textToImprove = selection || content;

        if (textToImprove.trim().length < 5) {
            return c.json(
                {
                    success: false,
                    error: "Please provide more text to improve.",
                },
                400
            );
        }

        const response = await openai.chat.completions.create({
            model: "arcee-ai/trinity-large-preview:free",
            messages: getImprovePrompt(content, selection),
            max_tokens: 2000,
            temperature: 0.4,
        });

        console.log("[AI Improve] finish_reason:", response.choices[0]?.finish_reason);
        console.log("[AI Improve] content:", response.choices[0]?.message?.content?.slice(0, 100));

        const improved = response.choices[0]?.message?.content?.trim() || "";

        if (!improved) {
            return c.json(
                { success: false, error: "AI returned an empty response" },
                500
            );
        }

        // We do NOT save automatically — the user reviews first
        return c.json({ success: true, data: { result: improved } });
    } catch (error: unknown) {
        console.error("AI Improve error:", error);

        if (error instanceof Error && error.message.includes("rate limit")) {
            return c.json(
                {
                    success: false,
                    error: "AI rate limit reached. Please try again in a moment.",
                },
                429
            );
        }

        return c.json(
            { success: false, error: "Failed to improve text" },
            500
        );
    }
});

// ---------------------------------------------------------------
// POST /ai/tags — Auto-generate relevant tags for a note
// ---------------------------------------------------------------
// Input:  { pageId, content, title }
// Output: { result: ["tag1", "tag2", "tag3"] }
// Side effect: saves tags to the page's "tags" field
aiRoutes.post("/tags", async (c) => {
    try {
        const body = await c.req.json();
        const pageId = typeof body.pageId === "string" ? body.pageId : "";
        const content = typeof body.content === "string" ? body.content : "";
        const title = typeof body.title === "string" ? body.title : "Untitled";
        if (!pageId || !content) {
            return c.json({ success: false, error: "pageId and content are required" }, 400);
        }

        if (content.trim().length < 10) {
            return c.json(
                {
                    success: false,
                    error: "Note content is too short to generate tags.",
                },
                400
            );
        }

        const response = await openai.chat.completions.create({
            model: "arcee-ai/trinity-large-preview:free",
            messages: getTagsPrompt(title || "Untitled", content),
            max_tokens: 100,
            temperature: 0.3,
        });

        console.log("[AI Tags] finish_reason:", response.choices[0]?.finish_reason);
        console.log("[AI Tags] full message:", JSON.stringify(response.choices[0]?.message));

        const rawResponse = response.choices[0]?.message?.content?.trim() || "";

        // Log so we can see exactly what the model returned
        console.log("[AI Tags] Raw model response:", JSON.stringify(rawResponse));

        if (!rawResponse) {
            return c.json({ success: false, error: "AI returned empty response" }, 500);
        }

        let tags: string[] = [];

        // Strategy 1: find a JSON array anywhere in the response
        const jsonMatch = rawResponse.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed)) {
                    tags = parsed.filter((t) => typeof t === "string" && t.trim()).slice(0, 5);
                }
            } catch { /* fall through */ }
        }

        // Strategy 2: split on commas/newlines (handles bullet/numbered lists too)
        if (tags.length === 0) {
            tags = rawResponse
                .replace(/```[\s\S]*?```/g, "")
                .replace(/[*\-\d.]+\s*/g, " ")
                .replace(/[\[\]"']/g, "")
                .split(/[,\n]+/)
                .map((t) => t.trim().toLowerCase())
                .filter((t) => t.length > 1 && t.length < 30)
                .slice(0, 5);
        }

        console.log("[AI Tags] Parsed tags:", tags);

        if (tags.length === 0) {
            return c.json({ success: false, error: "AI could not generate tags" }, 500);
        }

        // Save tags to the page in MongoDB
        await connectDB();
        await Page.findByIdAndUpdate(pageId, { tags });

        return c.json({ success: true, data: { result: tags } });
    } catch (error: unknown) {
        console.error("AI Tags error:", error);

        if (error instanceof Error && error.message.includes("rate limit")) {
            return c.json(
                {
                    success: false,
                    error: "AI rate limit reached. Please try again in a moment.",
                },
                429
            );
        }

        return c.json(
            { success: false, error: "Failed to generate tags" },
            500
        );
    }
});

// ---------------------------------------------------------------
// POST /ai/generate — Generate content from scratch/prompt
// ---------------------------------------------------------------
aiRoutes.post("/generate", async (c) => {
    try {
        const body = await c.req.json();
        const userPrompt = typeof body.prompt === "string" ? body.prompt : "";
        const title = typeof body.title === "string" ? body.title : "";
        const content = typeof body.content === "string" ? body.content : "";

        if (!userPrompt.trim()) {
            return c.json({ success: false, error: "Prompt is required" }, 400);
        }

        const response = await openai.chat.completions.create({
            model: "arcee-ai/trinity-large-preview:free",
            messages: getGeneratePrompt(userPrompt, title, content),
            max_tokens: 1500,
            temperature: 0.7,
        });

        const generated = response.choices[0]?.message?.content?.trim() || "";

        if (!generated) {
            return c.json({ success: false, error: "AI returned an empty response" }, 500);
        }

        return c.json({ success: true, data: { result: generated } });
    } catch (error: unknown) {
        console.error("AI Generate error:", error);

        if (error instanceof Error && error.message.includes("rate limit")) {
            return c.json(
                {
                    success: false,
                    error: "AI rate limit reached. Please try again in a moment.",
                },
                429
            );
        }

        return c.json(
            { success: false, error: "Failed to generate content" },
            500
        );
    }
});

export default aiRoutes;
