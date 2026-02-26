# 📔 NoteWise AI — Intelligent Note-Taking

NoteWise AI is a modern, Notion-style note-taking application boosted with advanced AI features. It offers a seamless, rich-text editing experience combined with an intelligent assistant to help you summarize, organize, and generate content effortlessly.

Live demo: https://notes-app-ai-one.vercel.app/

---

## 🚀 How to Use the App

### 1. Getting Started
- **Login / Signup**: Securely log in using Better Auth.
- **Create a Page**: Click the "+" button in the sidebar to create a new blank note.
- **Personalize**: Click on the page icon (emoji) to change it, and click the title to give your note a name.

### 2. Writing with BlockNote
- **Slash Commands**: Type `/` inside the editor to open the block menu. You can insert headings, bullet lists, code blocks, images, and more.
- **Drag & Drop**: Hover over any block to reveal a handle. Drag it to reorder your content easily.
- **Auto-Save**: Everything you type is automatically saved to the database every 1.5 seconds of inactivity.

### 3. Unleashing the AI
- **Top Toolbar**:
  - **✨ Summarize**: Generates a 2-3 sentence summary of your note.
  - **🪄 Improve Writing**: Polish your grammar, clarity, and tone.
  - **🏷️ Generate Tags**: Automatically suggests relevant tags for better organization.
- **Floating AI Assistant (Bottom-Right)**:
  - Click the floating spark button to open the **Ask AI** bar.
  - Ask the AI to write something specific (e.g., *"Write a Python script for a simple calculator"*).
  - The AI uses your current note as context and inserts the result directly into your editor.

### 4. Organization
- **Favorites**: Click the star icon to move important notes to the "Favorites" section in the sidebar.
- **Trash**: Archive notes you no longer need. You can restore them or permanently delete them later.

---

## 🏗️ Technical Structure

The application follows a modern full-stack architecture using Next.js 16 with a clean separation between the frontend UI and the backend API services.

### 📂 Frontend Structure (`/app`, `/components`, `/hooks`)
- **Next.js App Router**: Handles page routing and layouts.
- **BlockNote Editor**: A customized implementation located in `/components/editor/Editor.tsx`.
- **UI Components**: Built using **Shadcn UI** and **Tailwind CSS** for a premium, responsive design.
- **State Management**: Uses **TanStack Query** (React Query) for efficient data fetching, caching, and optimistic UI updates.
- **Custom Hooks**: logic found in `/hooks/usePages.ts` and `/hooks/useAI.ts` decouples API logic from UI components.

### 📂 Backend Structure (`/lib/hono`, `/lib/db`)
- **Hono API Framework**: Instead of standard Next.js API routes, we use Hono for its performance and powerful middleware support.
  - `/lib/hono/routes/pages.routes.ts`: Handles CRUD operations for notes.
  - `/lib/hono/routes/ai.routes.ts`: Orchestrates all AI features and interactions.
- **Database (MongoDB)**: Data persistence via **Mongoose** models (`/lib/db/page.model.ts`).
- **Better Auth**: A developer-friendly auth system managing sessions and cookies, integrated with the MongoDB adapter.

### 📂 AI Engine (`/lib/ai`)
- **OpenRouter Integration**: Connects to the world's best AI models (Gemini 2.0, Arcee Trinity, etc.) via a unified SDK.
- **Prompt Engineering**: Specialized prompts located in `/lib/ai/prompts.ts` ensure high-quality summaries and generation results.

---

## 🛠️ Environment Variables
To run this project, you will need to add the following variables to your `.env` file:
- `MONGODB_URI`: Your MongoDB connection string.
- `OPENROUTER_API_KEY`: API key for OpenRouter AI services.
- `BETTER_AUTH_SECRET`: A secure random string for encryption.
- `BETTER_AUTH_URL`: Your base application URL (e.g., `http://localhost:3000`).
- `NEXT_PUBLIC_APP_URL`: Same as above for client-side access.

---

## 🛠️ Installation & Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Set up your `.env` variables.
4. Run `npm run dev` to start the development server.
