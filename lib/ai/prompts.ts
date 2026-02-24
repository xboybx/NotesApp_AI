// ============================================================
// lib/ai/prompts.ts
// AI prompt templates for each feature.
//
// A "prompt" is the instruction we send to GPT telling it
// what to do with the note content. Good prompts = good results.
//
// Each function returns a "messages" array that OpenAI expects:
//   - system message: tells GPT its role and rules
//   - user message: the actual content to process
// ============================================================

// ---- Summarize ----
// Generates a concise 2-3 sentence summary of the note content.
export function getSummarizePrompt(title: string, content: string) {
    return [
        {
            role: "system" as const,
            content: `You are a concise note summarizer. Your job is to read a note and produce a clear, 
informative summary in 2-3 sentences. Focus on the key points and main ideas. 
Do NOT use markdown formatting. Just return plain text.`,
        },
        {
            role: "user" as const,
            content: `Note Title: ${title}\n\nNote Content:\n${content}`,
        },
    ];
}

// ---- Improve Writing ----
// Improves grammar, clarity, and structure of the provided text.
// If "selection" is provided, only that part is improved.
// If no selection, the full content is improved.
export function getImprovePrompt(content: string, selection?: string) {
    const textToImprove = selection || content;

    return [
        {
            role: "system" as const,
            content: `You are a professional writing assistant. Your job is to improve the given text by:
- Fixing grammar and spelling errors
- Improving clarity and readability  
- Better sentence structure and flow
- Keeping the original meaning and tone intact

IMPORTANT RULES:
- Return ONLY the improved text, nothing else
- Do NOT add explanations or comments
- Do NOT wrap in quotes or markdown
- Keep the same general length (don't make it significantly longer or shorter)`,
        },
        {
            role: "user" as const,
            content: `Please improve this text:\n\n${textToImprove}`,
        },
    ];
}

// ---- Generate Tags ----
// Auto-generates 3-5 relevant tags based on the note content.
export function getTagsPrompt(title: string, content: string) {
    return [
        {
            role: "system" as const,
            content: `You are a tag generator for notes. Your job is to read a note and generate 
3 to 5 short, relevant tags that describe the note's topic and content.

IMPORTANT RULES:
- Return ONLY a valid JSON array of strings, nothing else
- Each tag should be 1-2 words, lowercase
- Tags should be descriptive and useful for categorization
- Example output: ["javascript", "web development", "react hooks"]
- Do NOT include explanations or any other text`,
        },
        {
            role: "user" as const,
            content: `Note Title: ${title}\n\nNote Content:\n${content}`,
        },
    ];
}
// ---- Generate Content ----
// Generates new content from scratch or based on a prompt.
export function getGeneratePrompt(userPrompt: string, title?: string, existingContent?: string) {
    let systemContent = `You are a creative and helpful writing assistant inside a note-taking app. 
Your job is to generate high-quality text based on the user's request. 
Keep the following in mind:
- Be helpful and provide valuable, well-structured information
- Use clear, professional yet conversational language
- If provided, use the note title and existing content to match the current style/context
- Do NOT add introductory or concluding remarks like "Here is the content you requested"
- Just return the generated text content directly.`;

    if (title || existingContent) {
        systemContent += `\n\nContext for this note:\n`;
        if (title) systemContent += `- Title: ${title}\n`;
        if (existingContent) systemContent += `- Existing Content: ${existingContent.slice(0, 1000)}... (truncated)\n`;
    }

    return [
        {
            role: "system" as const,
            content: systemContent,
        },
        {
            role: "user" as const,
            content: `User Request: ${userPrompt}`,
        },
    ];
}
