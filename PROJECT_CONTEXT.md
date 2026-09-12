# Project Context & Architectural History — Cleft AI Notes (NoteWise AI)

## 1. Project Overview & Core Mission
**Cleft AI Notes (NoteWise AI)** is a high-performance, Notion-style intelligent note-taking application designed for zero-latency productivity. It combines rich-text editing, local-first instant persistence, and AI-assisted content synthesis (summarization, writing improvement, auto-tagging, and contextual generation).

* **Live Demo**: [https://notes-app-ai-one.vercel.app/](https://notes-app-ai-one.vercel.app/)
* **Primary Objective**: Provide instant UI responsiveness (<50ms perceived latency for opening notes and app launch) with seamless background cloud synchronization to MongoDB Atlas.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 16.1 (App Router), React 19, TypeScript 5 |
| **Styling & Design System** | Tailwind CSS 4, Shadcn UI, Radix Primitives, Lucide Icons |
| **Rich Text Editor** | BlockNote 0.47 (ProseMirror-based), Mantine UI components |
| **State & Caching** | TanStack Query v5 (React Query) with Local-First Persistence |
| **Local-First & Sync Engine** | Yjs (`Y.Doc`), `y-indexeddb`, Browser `BroadcastChannel`, `localStorage` |
| **Formulas & Math** | KaTeX (dynamically bundled on demand) |
| **Backend API** | Hono 4.12 running inside Next.js Route Handlers (`/api/*`) |
| **Database & ODM** | MongoDB 7, Mongoose 9 (Connection pooled with compound indexes) |
| **Authentication** | Better Auth 1.4 with MongoDB Adapter & Session Cookie Cache |
| **AI Integration** | OpenRouter / Groq / OpenAI SDK (Gemini 2.0, Claude, Llama) |
| **Media Uploads** | ImageKit |

---

## 3. History of Previous Changes & Commits

| Commit / Milestone | Description & Impact |
| :--- | :--- |
| `6c04935` | **Brand & Icons**: Updated favicon and brand assets. |
| `4c9c1b9` | **Auth UI & AI Provider**: Tuned margin spacing on login/register pages; updated AI provider to Groq for accelerated inference. |
| `6333305` | **Password Reset & Models**: Integrated forgot-password flow with Resend email templates; refined AI model selection. |
| `17e0a81` | **Type Safety**: Resolved strict TypeScript errors across Hono routes and BlockNote typing. |
| `76a4271` | **Initial Performance Overhaul**: Documented in `Status.md`. Introduced Yjs IndexedDB container, dynamic on-demand KaTeX loading, compound MongoDB indexes, and surgical cache updates (`setQueryData`). |
| **Current Optimization** | **Zero-Latency Note & App Loading**: Eliminated serial waterfall in `pages/[pageId]`; added instant `placeholderData` seeding; enabled hover prefetching for sidebar and dashboard; added instant local-first rehydration (<2ms) for note content and sidebar lists; pooled MongoDB and Better Auth clients. |

---

## 4. Performance & Latency Architecture

### Problem Diagnosed
Previously, opening a note suffered from a **3-stage serial waterfall** resulting in 1.0–1.7s delay:
1. `usePage(pageId)` blocked UI rendering with `if (isLoading) return <Skeleton />` while waiting for MongoDB network roundtrip (400–800ms).
2. Only after Stage 1 completed did Next.js trigger the dynamic chunk download for `Editor.tsx` (200–400ms).
3. Only after Stage 2 did BlockNote initialize and parse the blocks (200–400ms).

### Solution Implemented
```
[User Hovers Over Note] ─────► [Prefetches /api/pages/[id] & Pre-warms Editor.tsx Chunk]
                                              │
[User Clicks Note] ──────────► [0ms Instant UI Render via Placeholder Data]
                                              │
                                              ├─► [Instant < 2ms Local Block Hydration]
                                              └─► [Quiet Background REST Revalidation]
```

1. **Instant Placeholder Seeding**: `usePage` reads from the already-loaded `["pages"]` query cache, rendering the title, icon, and toolbar with **0ms delay**.
2. **Instant Local Document Hydration**: `Editor.tsx` checks `cleft_content_${pageId}` in client storage, restoring the note's block content in **< 2ms** on mount.
3. **Hover & Focus Prefetching**: Hovering or focusing any note in `SidebarPageItem` or the Dashboard grid triggers:
   - Route prefetch via Next.js `router.prefetch`
   - TanStack query prefetch for `/api/pages/[id]`
   - Dynamic chunk preload for `import("@/components/editor/Editor")`
4. **App Launch Acceleration**: `components/providers.tsx` rehydrates the user's note list from local storage (< 5ms) on app mount, eliminating cold-start skeleton delays.
5. **Connection Pooling**: `lib/auth/auth.ts` and `lib/db/mongodb.ts` reuse global singletons (`global._mongoClient` and `global.mongoose`) with `maxPoolSize: 10` and `minPoolSize: 2`.

---

## 5. Yjs & Real-Time Sync Status

* **Current Status**: Active local-first architecture. Keystrokes persist to client storage immediately and are debounced (1200ms) to MongoDB. `IndexeddbPersistence` and `BroadcastChannel` support multi-tab synchronization.
* **Roadmap to Multiplayer**:
  Because documents are structured with BlockNote and CRDT primitives, real-time Google Docs-style collaboration can be activated by connecting a WebSocket provider (e.g. Hocuspocus or `y-websocket`) to `useCreateBlockNote`'s `collaboration` configuration.

---

## 6. Project Documentation Index

For in-depth inquiries into specific subsystems, consult the following dedicated documentation:

* **[Status.md](./Status.md)**: Implementation matrix, automation features, and Yjs architecture.
* **[performance analysis.md](./performance%20analysis.md)**: Exhaustive 13-bottleneck technical diagnosis and benchmark measurements.
* **[llm-wiki/01-project-overview.md](./llm-wiki/01-project-overview.md)**: High-level purpose and feature inventory.
* **[llm-wiki/02-project-structure.md](./llm-wiki/02-project-structure.md)**: Full folder and file directory map.
* **[llm-wiki/03-data-models.md](./llm-wiki/03-data-models.md)**: Mongoose schemas, TypeScript interfaces, and indexing strategy.
* **[llm-wiki/04-api-reference.md](./llm-wiki/04-api-reference.md)**: Complete Hono API route specifications.
* **[llm-wiki/05-frontend-architecture.md](./llm-wiki/05-frontend-architecture.md)**: Component tree, routing, and TanStack Query state flow.
* **[llm-wiki/06-ai-integration.md](./llm-wiki/06-ai-integration.md)**: AI prompts, streaming endpoints, and fallback models.
* **[llm-wiki/07-authentication-auth.md](./llm-wiki/07-authentication-auth.md)**: Better Auth configuration and session security.
* **[llm-wiki/08-database-integration.md](./llm-wiki/08-database-integration.md)**: MongoDB connection lifecycle and query optimization.
* **[llm-wiki/09-environment-setup.md](./llm-wiki/09-environment-setup.md)**: Environment variables and deployment guide.
