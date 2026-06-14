# Project Structure & Directory Layout

## Root Level Files
```
notesapp_ai/
├── app/                    # Next.js App Router pages & layouts
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Backend logic, libraries, utilities
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
├── llm-wiki/               # This documentation
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## Directory Deep Dive

### `/app` - Next.js App Router
Uses route groups for organization:
- `(app)/` - Protected application routes (requires authentication)
  - `dashboard/page.tsx` - Main dashboard showing all notes
  - `pages/[pageId]/page.tsx` - Individual note editor page
  - `trash/page.tsx` - Trash/archive page
  - `profile/page.tsx` - User profile
  - `layout.tsx` - Shared app layout with sidebar
- `(auth)/` - Authentication routes
  - `login/page.tsx` - Login page
  - `register/page.tsx` - Registration page
- `api/[[...route]]/route.ts` - Hono API catch-all route
- `globals.css` - Global styles
- `layout.tsx` - Root layout with providers

### `/components` - React Components
```
components/
├── ai/                     # AI-related components
│   ├── AIPanel.tsx         # AI toolbar in editor
│   └── FloatingAI.tsx      # Floating AI assistant
├── auth/                   # Authentication forms
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── editor/                 # BlockNote editor
│   └── Editor.tsx          # Main note editor component
├── sidebar/                # Sidebar components
│   ├── Sidebar.tsx         # Main sidebar
│   └── SidebarPageItem.tsx # Individual page list item
├── ui/                     # Shadcn UI components (auto-generated)
├── layout/                 # Layout components
│   └── ThemeToggle.tsx     # Dark/light mode toggle
└── providers.tsx           # React context providers
```

### `/lib` - Backend & Utilities
```
lib/
├── ai/                     # AI integration
│   ├── openai.ts           # OpenAI/OpenRouter client
│   └── prompts.ts          # AI prompt templates
├── auth/                   # Authentication
│   ├── auth.ts             # Better Auth server config
│   └── auth-client.ts      # Better Auth client
├── db/                     # Database
│   ├── mongodb.ts          # MongoDB connection
│   ├── page.model.ts       # Page Mongoose schema
│   └── user.model.ts       # User Mongoose schema
├── hono/                   # Hono API framework
│   ├── index.ts            # Main Hono app instance
│   ├── middlewares/
│   │   └── auth.middleware.ts # Auth middleware
│   └── routes/
│       ├── pages.routes.ts # Pages CRUD API
│       ├── ai.routes.ts    # AI features API
│       └── upload.routes.ts # File upload API
├── utils/                  # Utilities
│   └── blocknote-to-text.ts # Convert BlockNote to plain text
├── validations/            # Zod schemas
│   ├── page.schema.ts
│   ├── ai.schema.ts
│   └── auth.schema.ts
└── utils.ts                # General utilities
```

### `/hooks` - Custom React Hooks
```
hooks/
├── usePages.ts             # All page-related queries/mutations
└── useAI.ts                # AI feature hooks
```

### `/types` - TypeScript Types
- `index.ts` - All global TypeScript interfaces