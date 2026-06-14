# Data Models & Database Schema

## Core Database Models

### User Model (`/lib/db/user.model.ts`)
Stores user account information.

**Fields:**
- `id`: string (unique identifier)
- `name`: string (user's display name)
- `email`: string (unique email, required)
- `image`: string (optional profile image URL)
- `emailVerified`: boolean (email verification status)
- `createdAt`: Date (account creation timestamp)
- `updatedAt`: Date (last update timestamp)

### Page Model (`/lib/db/page.model.ts`)
Stores all note/page data. This is the primary data model for the application.

**Fields:**
- `_id`: ObjectId (MongoDB primary key)
- `userId`: string (reference to User.id, owns this page)
- `title`: string (page title, defaults to "Untitled")
- `icon`: string (emoji icon, e.g., "📝", optional)
- `coverImage`: string (cover image URL, optional)
- `content`: Array (BlockNote JSON blocks, the actual note content)
- `tags`: string[] (array of tags for organization)
- `summary`: string (AI-generated summary, optional)
- `isFavorite`: boolean (starred/favorite status, defaults to false)
- `isArchived`: boolean (in trash, defaults to false)
- `createdAt`: Date (page creation timestamp)
- `updatedAt`: Date (last modification timestamp)

## TypeScript Interfaces (`/types/index.ts`)

### `UserType`
Matches the User model for frontend usage.
```typescript
interface UserType {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
```

### `PageType`
Full page data including content for editing.
```typescript
interface PageType {
    _id: string;
    userId: string;
    title: string;
    icon?: string | null;
    coverImage?: string | null;
    content: Record<string, unknown>[]; // BlockNote JSON
    tags: string[];
    summary?: string | null;
    isFavorite: boolean;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}
```

### `PageListItem`
Lightweight version for sidebar lists (excludes heavy content field to save bandwidth).
```typescript
interface PageListItem {
    _id: string;
    title: string;
    icon?: string | null;
    isFavorite: boolean;
    isArchived: boolean;
    updatedAt: string;
}
```

### `ApiResponse<T>`
Standard API response wrapper used by all Hono endpoints.
```typescript
interface ApiResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
```

## AI-Related Types

### `AIRequest`
Request body for AI feature endpoints.
```typescript
interface AIRequest {
    pageId: string;
    content: string;  // plain text extracted from BlockNote
    title?: string;
    selection?: string; // optional selected text
}
```

### `AIResponse`
Response from AI endpoints.
```typescript
interface AIResponse {
    result: string | string[]; // string for summary/improve, string[] for tags
}
```