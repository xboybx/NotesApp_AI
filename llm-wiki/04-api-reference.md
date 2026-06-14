# API Reference - Hono Backend

## Overview
All API routes are handled by Hono and mounted under `/api`. The main Hono app instance is in `/lib/hono/index.ts`.

## Authentication Routes (`/api/auth/*`)
Handled automatically by Better Auth. These endpoints are created by the Better Auth library:

- `POST /api/auth/sign-up/email` - Register new user with email/password
- `POST /api/auth/sign-in/email` - Login existing user
- `POST /api/auth/sign-out` - Logout and clear session
- `GET /api/auth/get-session` - Get current user session

## Pages API (`/api/pages/*`)
All CRUD operations for pages/notes. Authenticated by the auth middleware.

### `GET /api/pages`
List all pages for the current user.
- **Response**: `ApiResponse<PageListItem[]>`
- **Filters**: Excludes archived pages by default
- **Used by**: Sidebar to display all notes

### `GET /api/pages/:id`
Get a single page by ID with full content.
- **Params**: `id` - page MongoDB ID
- **Response**: `ApiResponse<PageType>`
- **Used by**: Editor page to load full note content

### `POST /api/pages`
Create a new blank page.
- **Body**: `{ title?: string; icon?: string }`
- **Response**: `ApiResponse<PageType>`
- **Defaults**: title="Untitled", icon=null, isFavorite=false, isArchived=false
- **Used by**: "New Page" button in sidebar

### `PATCH /api/pages/:id`
Update a page (partial update).
- **Params**: `id` - page MongoDB ID
- **Body**: `Partial<PageType>` - any fields to update
- **Response**: `ApiResponse<PageType>`
- **Used by**: Auto-save in editor, title changes, icon updates

### `PATCH /api/pages/:id/favorite`
Toggle favorite status.
- **Params**: `id` - page MongoDB ID
- **Response**: `ApiResponse<{ isFavorite: boolean }>`
- **Flips**: `isFavorite` from true ↔ false

### `PATCH /api/pages/:id/archive`
Toggle archive/trash status.
- **Params**: `id` - page MongoDB ID
- **Response**: `ApiResponse<{ isArchived: boolean }>`
- **Used by**: Delete/move to trash, restore from trash

### `DELETE /api/pages/:id`
Permanently delete a page.
- **Params**: `id` - page MongoDB ID
- **Only allowed**: if page is already archived (in trash)
- **Safety**: Prevents accidental permanent deletion

## AI API (`/api/ai/*`)
All AI-powered features.

### `POST /api/ai/summarize`
Generate a summary of the note content.
- **Body**: `{ pageId: string; content: string; title: string }`
- **Response**: `ApiResponse<{ result: string }>`
- **Returns**: 2-3 sentence summary

### `POST /api/ai/improve`
Improve writing, grammar, and clarity.
- **Body**: `{ pageId: string; content: string; selection?: string }`
- **Response**: `ApiResponse<{ result: string }>`
- **If selection provided**: only improves the selected text

### `POST /api/ai/tags`
Auto-generate relevant tags.
- **Body**: `{ pageId: string; content: string; title: string }`
- **Response**: `ApiResponse<{ result: string[] }>`
- **Returns**: 3-5 lowercase tags as array

### `POST /api/ai/generate`
Generate new content from a user prompt.
- **Body**: `{ prompt: string; title?: string; existingContent?: string }`
- **Response**: `ApiResponse<{ result: string }>`
- **Used by**: Floating AI assistant

## Upload API (`/api/upload/*`)
File upload handling.

### `POST /api/upload`
Upload a file (currently for cover images).
- **Response**: `ApiResponse<{ url: string }>`
- **Returns**: Public URL to access the uploaded file

## Health Check
### `GET /api/health`
Simple health check endpoint.
- **Response**: `{ success: true; message: "API is running!"; timestamp: string }`