// ============================================================
// lib/ai/search.ts
// Free, zero-dependency DuckDuckGo web search & prompt intent detection.
// No API keys or extra npm packages required.
// ============================================================

export interface SearchResult {
    title: string;
    snippet: string;
    url?: string;
}

/**
 * 1. Intent Detection: Decides if the prompt requires a live web search
 * Checks for recency words, real-time queries, news, or explicit search triggers.
 */
export function isWebSearchQuery(prompt: string): boolean {
    if (!prompt || typeof prompt !== "string") return false;
    const text = prompt.toLowerCase().trim();

    // Explicit triggers
    if (/^(search|google|browse|find info|look up|search the web)\b/i.test(text)) {
        return true;
    }

    // Temporal / Recency indicators (news, current year, recent events)
    const temporalKeywords = [
        "latest",
        "recent",
        "today",
        "current",
        "now",
        "news",
        "updates",
        "trending",
        "release date",
        "released",
        "price of",
        "weather in",
        "scores",
        "standing",
        "who won",
        "who is the current",
        "2024",
        "2025",
        "2026",
        "versus",
        "vs",
        "roadmap",
        "changelog",
    ];

    return temporalKeywords.some((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "i");
        return regex.test(text);
    });
}

/**
 * 2. DuckDuckGo Web Search:
 * Fetches HTML from DuckDuckGo's public HTML endpoint and extracts clean snippets.
 */
export async function searchDuckDuckGo(query: string, maxResults = 5): Promise<SearchResult[]> {
    try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        if (!response.ok) {
            console.warn(`[DuckDuckGo] Search failed with status: ${response.status}`);
            return [];
        }

        const html = await response.text();
        const results: SearchResult[] = [];

        // Match snippet and result title from DuckDuckGo HTML layout
        const resultBlockRegex = /<div class="result__body">([\s\S]*?)<\/div>/g;
        let match;

        while ((match = resultBlockRegex.exec(html)) !== null && results.length < maxResults) {
            const block = match[1];

            // Extract Title
            const titleMatch = /<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>/.exec(block);
            const title = titleMatch ? cleanHtml(titleMatch[1]) : "Search Result";

            // Extract Snippet
            const snippetMatch = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/.exec(block);
            const snippet = snippetMatch ? cleanHtml(snippetMatch[1]) : "";

            // Extract URL
            const urlMatch = /<a[^>]*class="result__url"[^>]*href="([^"]*)"/.exec(block);
            const resultUrl = urlMatch ? urlMatch[1] : undefined;

            if (snippet) {
                results.push({
                    title,
                    snippet,
                    url: resultUrl,
                });
            }
        }

        return results;
    } catch (error) {
        console.error("[DuckDuckGo] Search error:", error);
        return [];
    }
}

/**
 * Helper to strip HTML tags and decode common HTML entities
 */
function cleanHtml(raw: string): string {
    return raw
        .replace(/<[^>]+>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

