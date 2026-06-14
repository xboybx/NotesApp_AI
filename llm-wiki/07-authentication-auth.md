# Authentication & Better Auth Integration

## Overview
NoteWise AI uses **Better Auth** for user authentication, a modern, developer-friendly authentication library that handles all the complexities of user management, sessions, and security.

## Better Auth Configuration

### Server Setup (`/lib/auth/auth.ts`)
The main Better Auth server configuration.
```typescript
export const auth = betterAuth({
  database: mongooseAdapter, // MongoDB adapter
  emailAndPassword: {
    enabled: true,
  },
  user: {
    model: User, // Mongoose User model
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    cookieName: "note-wise-session",
  },
});
```

### Client Setup (`/lib/auth/auth-client.ts`)
Frontend client for interacting with Better Auth.
- Provides hooks: `useSession()`, `useSignIn()`, `useSignOut()`
- Handles cookie management
- Provides type-safe auth methods

## Authentication Flow

### Registration (`/app/(auth)/register/page.tsx`)
1. User enters name, email, password in RegisterForm
2. Form validates inputs with Zod schema
3. Calls `authClient.signUp.email()`
4. On success: redirects to `/dashboard`
5. On error: displays error message in form

### Login (`/app/(auth)/login/page.tsx`)
1. User enters email and password in LoginForm
2. Form validates credentials
3. Calls `authClient.signIn.email()`
4. On success: sets session cookie, redirects to dashboard
5. On error: shows invalid credentials message

### Logout
- Available in sidebar/user menu
- Calls `authClient.signOut()`
- Clears session cookie
- Redirects to login page
- Invalidates all cached data

## Protected Routes
All routes under `(app)/` require authentication. The layout checks for a valid session before rendering:

1. In `app/(app)/layout.tsx`, the `useSession()` hook checks authentication
2. If no session exists, redirects to `/login`
3. If session exists, renders the protected layout and children

## API Route Protection
Hono middleware protects all API endpoints that require authentication:
- File: `/lib/hono/middlewares/auth.middleware.ts`
- Verifies the session cookie on every request
- Attaches the user object to the request context
- Returns 401 Unauthorized if no valid session
- Applied to: `/api/pages/*`, `/api/ai/*`, `/api/upload/*`

### Middleware Usage
```typescript
// In pages.routes.ts
pagesRoutes.use("*", authMiddleware);
```

## User Model Integration
Better Auth integrates with the Mongoose User model:
- Stores email, name, profile image
- Tracks email verification status
- Manages session creation and expiration
- Handles password hashing automatically (never stores plain text)

## Security Features
- **Password Hashing**: Better Auth handles secure password hashing
- **HttpOnly Cookies**: Sessions stored in secure, HttpOnly cookies
- **CSRF Protection**: Built-in CSRF protection
- **Session Expiration**: Sessions expire after 7 days of inactivity
- **Type Safety**: Full TypeScript support for all auth operations

## Environment Variables Required for Auth
```env
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Auth API Routes
Better Auth automatically creates these auth endpoints:
- `POST /api/auth/sign-up/email` - Register
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session
- All handled by `app.all("/auth/*", (c) => auth.handler(c.req.raw))` in Hono