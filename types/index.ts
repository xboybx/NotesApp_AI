// ============================================================
// types/index.ts
// Global TypeScript types used across the entire app.
// Think of this as our "dictionary" of data shapes.
// ============================================================

// ---- User ----
// Shape of a user returned from the API or session
export interface UserType {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ---- Page (our "note" in Notion style) ----
// Full page shape including content blocks
export interface PageType {
    _id: string;
    userId: string;
    title: string;
    icon?: string | null;         // emoji e.g. "📝"
    coverImage?: string | null;   // URL to a cover image
    content: Record<string, unknown>[]; // BlockNote JSON array
    tags: string[];               // ["react", "nextjs"]
    summary?: string | null;      // AI-generated summary
    isFavorite: boolean;
    isArchived: boolean;          // true = in trash
    createdAt: string;
    updatedAt: string;
}

// Lighter version for sidebar list (no content, saves bandwidth)
export interface PageListItem {
    _id: string;
    title: string;
    icon?: string | null;
    isFavorite: boolean;
    isArchived: boolean;
    updatedAt: string;
}

// ---- Standard API Response ----
// Every API response from Hono follows this shape
export interface ApiResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ---- AI Feature Types ----
export type AIFeature = "summarize" | "improve" | "tags";

export interface AIRequest {
    pageId: string;
    content: string;  // plain text extracted from BlockNote blocks
    title?: string;
    selection?: string; // optional selected text for "improve"
}

// AI response: string for summary/improve, string[] for tags
export interface AIResponse {
    result: string | string[];
}
