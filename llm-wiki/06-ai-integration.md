# AI Integration & Features

## Overview
NoteWise AI integrates with OpenRouter (via OpenAI SDK) to provide AI-powered note-taking features. OpenRouter allows access to multiple leading AI models including Gemini 2.0, Claude, and others through a unified API.

## AI Architecture
- **Client**: `/lib/ai/openai.ts` - OpenAI client configured for OpenRouter
- **Prompts**: `/lib/ai/prompts.ts` - All AI prompt templates
- **API Routes**: `/lib/hono/routes/ai.routes.ts` - Backend AI endpoints
- **Frontend Hooks**: Custom hooks in `/hooks/useAI.ts`
- **UI Components**: `AIPanel.tsx`, `FloatingAI.tsx`

## Available AI Features

### 1. Summarize
**Endpoint**: `POST /api/ai/summarize`
- Takes: page title and full note content
- Returns: 2-3 sentence concise summary
- Prompt System Message: Instructs AI to focus on key points, avoid markdown
- Usage: Click "✨ Summarize" in editor toolbar
- Saves the generated summary to the page's `summary` field in the database

### 2. Improve Writing
**Endpoint**: `POST /api/ai/improve`
- Takes: note content, optional selected text
- Returns: Polished text with improved grammar, clarity, and flow
- Rules for AI:
  - Fix grammar and spelling
  - Improve sentence structure
  - Maintain original meaning and tone
  - Return ONLY the improved text (no explanations)
  - Keep similar length to original
- Usage: Click "🪄 Improve Writing" in toolbar, can work on selection

### 3. Generate Tags
**Endpoint**: `POST /api/ai/tags`
- Takes: page title and content
- Returns: JSON array of 3-5 lowercase tags
- AI Rules:
  - Return ONLY valid JSON array
  - Each tag 1-2 words
  - Descriptive and useful for categorization
  - Example output: `["javascript", "react", "web development"]`
- Usage: Click "🏷️ Generate Tags" in toolbar
- Saves tags array to the page's `tags` field

### 4. Generate Content (Floating AI)
**Endpoint**: `POST /api/ai/generate`
- Takes: User's prompt, optional page title and existing content
- Returns: Generated text based on the prompt
- Context-aware: Uses existing note content to maintain consistent style
- Usage: Click the floating spark button, type your request
- Inserts generated content directly at the current cursor position in the editor

## Prompt Engineering (`/lib/ai/prompts.ts`)
All prompts follow a consistent structure:
1. System message that defines the AI's role and strict rules
2. User message containing the content to process
3. Returns OpenAI chat completion message format

### Example Prompt Structure
```typescript
// Summarize prompt returns messages array:
[
  {
    role: "system",
    content: "You are a concise note summarizer. ..."
  },
  {
    role: "user",
    content: "Note Title: My Note\n\nNote Content: ..."
  }
]
```

## OpenRouter Configuration
The OpenAI client is configured to use OpenRouter's base URL:
```typescript
baseURL: "https://openrouter.ai/api/v1",
```

This allows access to models like:
- `google/gemini-2.0-flash-001`
- `anthropic/claude-3.5-sonnet`
- And many others via the same OpenAI SDK

## Text Extraction
To send note content to AI, BlockNote's JSON format must be converted to plain text:
- Utility: `/lib/utils/blocknote-to-text.ts`
- Extracts text content from all BlockNote blocks
- Strips formatting, creates clean plain text for AI processing
- Used by all AI features to prepare content for the LLM

## Error Handling
- All AI operations include try/catch blocks
- Toast notifications show success/error messages
- Frontend displays loading spinners during AI processing
- Backend validates all inputs before sending to OpenAI
- API key errors are caught and displayed to the user