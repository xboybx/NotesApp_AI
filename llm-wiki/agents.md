# LLM Agent Instructions for NoteWise AI Project

## 🎯 Your Mission
You are an AI assistant specialized in the NoteWise AI project. Your purpose is to help developers understand, modify, debug, and extend this codebase. Always start by referencing the documentation in the `llm-wiki/` folder to provide accurate, context-aware assistance.

## 📚 How to Use This Knowledge Base
**FIRST AND FOREMOST**: Before answering any question about the codebase, read the relevant files in `/llm-wiki/`. These files contain comprehensive documentation about the entire project.

### Available Documentation Files
Read these in order depending on the question:

1. **[01-project-overview.md](./01-project-overview.md)** - What this project is, tech stack, core features
2. **[02-project-structure.md](./02-project-structure.md)** - Directory layout, where to find files
3. **[03-data-models.md](./03-data-models.md)** - Database schema, TypeScript interfaces
4. **[04-api-reference.md](./04-api-reference.md)** - All API endpoints, request/response formats
5. **[05-frontend-architecture.md](./05-frontend-architecture.md)** - React components, state management, routing
6. **[06-ai-integration.md](./06-ai-integration.md)** - AI features, OpenRouter integration, prompts
7. **[07-authentication-auth.md](./07-authentication-auth.md)** - Better Auth, user sessions, protected routes
8. **[08-database-integration.md](./08-database-integration.md)** - MongoDB, Mongoose, queries
9. **[09-environment-setup.md](./09-environment-setup.md)** - Setup, deployment, environment variables

## 🧠 Core Principles to Follow

### 1. Always Reference the Documentation
When asked about any aspect of the project, first check the appropriate wiki file. Never guess about:
- Where a file is located
- How the database is structured
- What API endpoints exist
- How authentication works
- What the AI features do
- The project's technology choices

### 2. Maintain Project Standards
When suggesting code changes or additions:
- **Match existing code style**: Look at surrounding code for patterns
- **Use the same libraries**: Don't introduce new packages unless absolutely necessary
- **Follow TanStack Query patterns**: Use the existing hooks pattern for any new data fetching
- **Maintain TypeScript safety**: All code must be properly typed
- **Keep the Hono pattern**: Add new API routes in the existing structure
- **Respect the component architecture**: Place new components in the correct directory

### 3. Security First
- Never expose secrets or API keys
- Never log sensitive user data
- Always enforce the existing authentication middleware on new API routes
- Maintain the userId scoping on all database queries (users can only access their own data)
- Follow the same authorization patterns as existing code

### 4. Performance Guidelines
- Keep using TanStack Query for caching and invalidation
- Maintain the pattern of using `PageListItem` (lightweight) for lists and `PageType` (full content) for editing
- Continue using debounced auto-save for the editor
- Keep database indexes in mind when adding new queries
- Avoid loading unnecessary data on the client

### 5. Feature Enhancement Principles
When adding new features:
- Integrate with existing AI patterns if adding new AI capabilities
- Follow the BlockNote patterns when extending the editor
- Maintain the sidebar component patterns for any new list items
- Use Shadcn UI components that are already imported in the project
- Add new environment variables to the documentation
- Update TypeScript types in `/types/index.ts` for any new data structures

## 🎯 Common Scenarios & How to Handle Them

### If Asked: "Where is X file located?"
- First check `02-project-structure.md` - it has the complete directory tree
- If not found there, use search tools but document the finding for future reference

### If Asked: "How do I add a new API endpoint?"
- Reference `04-api-reference.md` and `/lib/hono/index.ts` patterns
- Add the route to the appropriate routes file or create a new one
- Include the auth middleware if it needs protection
- Add the TypeScript types for request/response
- Follow the existing `ApiResponse<T>` wrapper pattern

### If Asked: "How do I add a new AI feature?"
- Reference `06-ai-integration.md`
- Add a new prompt template in `/lib/ai/prompts.ts`
- Create the endpoint in `ai.routes.ts`
- Add the frontend hook in `useAI.ts`
- Add the UI button in `AIPanel.tsx` or `FloatingAI.tsx`
- Follow the same error handling and loading states

### If Asked: "How do I add a new database field?"
- Update the Mongoose schema in `/lib/db/page.model.ts` or `user.model.ts`
- Add the field to the TypeScript interface in `/types/index.ts`
- Add any necessary database indexes
- Update any API routes that need to handle the new field
- Update the frontend hooks if they need to mutate the field

### If Asked: "Debug this error..."
- First locate the file mentioned in the error stack
- Cross-reference with the documentation to understand the expected behavior
- Trace the data flow: frontend hook → API route → database query
- Check if all the middleware is correctly applied
- Verify TypeScript types match at every step

## 📍 Always Start by Reading the Wiki
Before writing any code, before suggesting any changes, before answering any question — **check the wiki first**. The documentation in `/llm-wiki/` contains the complete understanding of this project that you need to be effective.

If information is missing from the wiki, after you discover it, add it to keep the documentation complete for future interactions.