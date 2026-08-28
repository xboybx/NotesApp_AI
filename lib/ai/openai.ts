// ============================================================
// lib/ai/openai.ts
// Groq client — uses Groq's OpenAI-compatible API.
//
// ============================================================

import OpenAI from "openai";

const baseURL = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
const apiKey = process.env.AI_API_KEY;
export const fastAiModel =
    process.env.AI_FAST_MODEL_NAME || process.env.AI_MODEL_NAME || "groq/compound";
if (!apiKey) {
    throw new Error("AI_API_KEY is not configured");
}

export const aiModel = process.env.AI_MODEL_NAME || "groq/compound";

const openai = new OpenAI({
    baseURL,
    apiKey,
    defaultHeaders: {
        "X-Title": "AI Notes App",
    },
});

export default openai;
