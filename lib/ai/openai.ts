// ============================================================
// lib/ai/openai.ts
// OpenRouter client — drop-in replacement for the OpenAI SDK.
//
// OpenRouter gives access to 300+ models (GPT-4o, Claude, Gemini,
// Mistral, Llama, etc.) via one OpenAI-compatible API.
//
// Just change the model string in ai.routes.ts to switch models.
// Example models:
//   "openai/gpt-4o-mini"          ← fast + cheap
//   "openai/gpt-4o"               ← most capable OpenAI
//   "anthropic/claude-3.5-sonnet" ← best for writing
//   "google/gemini-flash-1.5"     ← fast Google model
//   "meta-llama/llama-3-8b"       ← free open-source
// ============================================================

import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
    defaultHeaders: {
        // Used for rankings on openrouter.ai (optional but good practice)
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AI Notes App",
    },
});

export default openai;
