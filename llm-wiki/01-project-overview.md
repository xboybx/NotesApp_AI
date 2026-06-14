# Project Overview: NoteWise AI - Intelligent Note-Taking Application

## Project Name
NoteWise AI - A modern, Notion-style note-taking application with advanced AI capabilities.

## Core Purpose
A collaborative, AI-enhanced note-taking platform that provides:
- Rich-text editing with BlockNote
- AI-powered content generation and improvement
- Organization features (favorites, trash, tags)
- User authentication and data persistence

## Live Demo
https://notes-app-ai-one.vercel.app/

## Key Features
1. **Rich Text Editing**: BlockNote-based editor with slash commands, drag-and-drop blocks, and keyboard shortcuts (bold, italic, etc.). The "Create link" shortcut is temporarily disabled due to a library update.
2. **AI Features**: Summarization, writing improvement, auto-tag generation, content generation
3. **Organization**: Favorites, trash archive, tags system
4. **Collaboration**: Auto-save, real-time updates
5. **Security**: User authentication with Better Auth

## Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Hono API framework running on Next.js
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI SDK with OpenRouter integration (supports Gemini 2.0, Claude, etc.)
- **Auth**: Better Auth
- **State Management**: TanStack Query (React Query)
- **Editor**: BlockNote 0.47.0

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```