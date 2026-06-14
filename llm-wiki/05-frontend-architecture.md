# Frontend Architecture & Component Logic

## State Management with TanStack Query
The application uses TanStack Query (React Query) for all server state management. All data fetching logic is centralized in custom hooks.

### Key Hooks (`/hooks/usePages.ts`)

#### `usePages()`
- Fetches all pages for the sidebar
- Query Key: `["pages"]`
- Invalidated after any page mutation to keep sidebar in sync
- Returns: `{ data, isLoading, isError }`

#### `usePage(pageId: string)`
- Fetches a single page with full content for editing
- Query Key: `["page", pageId]`
- Only enabled when pageId is truthy
- Returns: `{ data, isLoading, isError }`

#### `useCreatePage()`
- Mutation to create a new page
- On success: invalidates `["pages"]` query to refresh sidebar
- Used by: Sidebar "New Page" button

#### `useUpdatePage()`
- Mutation to update any page fields
- On success: invalidates both `["pages"]` and `["page", pageId]`
- Used by: Auto-save in editor, title changes, icon updates

#### `useToggleFavorite()`
- Mutation to flip favorite status
- On success: invalidates page queries
- Used by: SidebarPageItem dropdown menu

#### `useArchivePage()`
- Mutation to move page to/from trash
- On success: invalidates page queries
- If archiving the currently open page, redirects to dashboard

## Core Components Explained

### Sidebar System (`/components/sidebar/`)

#### `Sidebar.tsx`
The main sidebar navigation component.
- Organizes pages into: Favorites, Private Pages, Trash
- Handles page creation via "New Page" button
- Lists pages using `SidebarPageItem` components
- Fetches pages using `usePages()` hook
- Shows loading states while fetching

#### `SidebarPageItem.tsx`
Individual page entry in the sidebar list.
- Displays page icon (emoji) and title
- Shows hover actions: toggle favorite, archive/delete
- Highlights active page with background color
- Navigates to `/pages/[pageId]` when clicked
- Shows loading spinner during navigation
- Stops propagation for action button clicks to prevent navigation

### Editor System (`/components/editor/Editor.tsx`)
The BlockNote-based rich text editor.
- Initializes BlockNote editor with custom configurations
- Implements auto-save: debounced 1500ms after last change
- Extracts plain text from BlockNote blocks for AI features
- Provides toolbar with AI actions (summarize, improve, tags)
- Handles real-time updates to page content
- Supports emoji icon picker for page customization

### AI Components (`/components/ai/`)

#### `AIPanel.tsx`
Toolbar in the editor with AI feature buttons.
- Contains: Summarize, Improve Writing, Generate Tags
- Calls respective AI APIs when buttons are clicked
- Updates page content automatically after AI processing
- Shows loading states during AI operations
- Displays toast notifications for success/error

#### `FloatingAI.tsx`
Floating "Ask AI" button in bottom-right corner.
- Expands to show input field for custom prompts
- Sends prompt to `/api/ai/generate` endpoint
- Inserts generated content directly into the editor
- Uses the current page's content as context

### Layout Components (`/app/(app)/layout.tsx`)
Protected layout wrapper for all app routes.
- Renders sidebar (collapsible on desktop, sheet on mobile)
- Provides toggle buttons for sidebar visibility
- Wraps all child pages with the sidebar layout
- Handles responsive design: mobile vs desktop layouts

## Routing Structure
- `/dashboard` - Main dashboard, shows all pages
- `/pages/[pageId]` - Individual note editor
- `/trash` - Archived pages management
- `/profile` - User profile settings
- `/login` - Authentication login
- `/register` - New user registration

## Authentication Flow
1. User visits `/login` or `/register`
2. After successful auth, Better Auth sets session cookie
3. User is redirected to `/dashboard`
4. All protected routes check for valid session
5. API endpoints use auth middleware to verify session