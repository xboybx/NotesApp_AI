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
- **Keyboard Shortcuts**: Basic styling shortcuts (bold, italic, underline) are available. The "Create link" shortcut is temporarily disabled.
- **Keyboard Shortcuts**: Basic styling shortcuts (bold, italic, underline) are available. The "Create link" shortcut is temporarily disabled.

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
- `RESEND_API_KEY`: API key from your Resend account.
- `RESEND_FROM_EMAIL`: Verified sender, for example `NoteWise AI <noreply@yourdomain.com>`.

### Password Reset: Complete Implementation Guide

The password reset feature uses Better Auth for the security-sensitive work and Resend only for delivering the email. The application never creates, stores, or hashes reset tokens itself.

#### Files and Responsibilities

| File | Responsibility |
| --- | --- |
| `app/(auth)/forgot-password/page.tsx` | Defines the public `/forgot-password` page and renders the request form. |
| `components/auth/ForgotPasswordForm.tsx` | Collects the email, validates it, calls Better Auth, and shows a generic success message. |
| `app/(auth)/reset-password/page.tsx` | Defines the public `/reset-password` page and renders the new-password form. |
| `components/auth/ResetPasswordForm.tsx` | Reads the token from the URL, validates both password fields, and submits the new password. |
| `components/auth/LoginForm.tsx` | Provides the **Forgot password?** link from the login screen. |
| `lib/validations/auth.schema.ts` | Contains the email, password, and confirm-password Zod schemas. |
| `lib/auth/auth-client.ts` | Exports the browser methods `requestPasswordReset` and `resetPassword`. |
| `lib/auth/auth.ts` | Configures Better Auth, MongoDB, the email callback, and the one-hour token lifetime. |
| `lib/email/resend.ts` | Sends the reset email through Resend and escapes user-provided HTML values. |
| `lib/hono/index.ts` | Forwards `/api/auth/*` requests to Better Auth. No custom reset route is needed. |
| `app/api/[[...route]]/route.ts` | Connects the Next.js catch-all API route to the Hono application. |

#### Step 1: User Requests a Reset Link

The user opens `/login` and clicks the link added in `components/auth/LoginForm.tsx`. The link opens `/forgot-password`, which renders `ForgotPasswordForm`.

When the form is submitted, `ForgotPasswordForm.tsx` does two things:

1. `forgotPasswordSchema` checks that the email is present and has a valid format.
2. `requestPasswordReset` sends this request through the Better Auth client:

```ts
await requestPasswordReset({
  email: data.email,
  redirectTo: `${window.location.origin}/reset-password`,
});
```

Better Auth sends this to `POST /api/auth/request-password-reset`. The request reaches `app/api/[[...route]]/route.ts`, is passed to Hono, and is then handled by `auth.handler()` in `lib/hono/index.ts`.

The `redirectTo` value tells Better Auth where the browser should arrive after the email token has been checked. Better Auth will append the valid token to that URL.

#### Step 2: Better Auth Creates the Token

The `emailAndPassword` section in `lib/auth/auth.ts` enables password reset emails:

```ts
sendResetPassword: async ({ user, url }) => {
  await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    url,
  });
},
resetPasswordTokenExpiresIn: 60 * 60,
```

Better Auth generates a random token, stores a temporary verification record in MongoDB, and creates a URL similar to this:

```text
/api/auth/reset-password/TOKEN?callbackURL=https%3A%2F%2Fyour-app.com%2Freset-password
```

The token expires after `60 * 60` seconds, which is one hour. Better Auth also returns the same generic message whether or not the email exists. This prevents someone from using the form to discover registered accounts.

#### Step 3: Resend Delivers the Email

`lib/email/resend.ts` creates a Resend client using `RESEND_API_KEY`. Its `sendPasswordResetEmail` function receives the user email, name, and Better Auth URL.

The important point is that the email helper does not construct or modify the reset URL. It sends the exact URL created by Better Auth. When the user clicks it, Better Auth validates the token at `GET /api/auth/reset-password/:token`, then redirects the browser to `/reset-password?token=TOKEN`.

The helper also:

- Uses `RESEND_FROM_EMAIL` as the verified sender.
- Escapes the name and URL before inserting them into HTML.
- Throws an error if Resend reports a delivery failure.

#### Step 4: User Sets a New Password

`ResetPasswordForm.tsx` uses `useSearchParams()` to read `token` from the URL. If the token is missing, the form is disabled and the user sees an invalid or expired-link message.

When submitted, `resetPasswordSchema` checks that the new password is at least six characters and that both fields match. The form then calls:

```ts
await resetPassword({
  newPassword: data.password,
  token,
});
```

Better Auth receives this at `POST /api/auth/reset-password`. It verifies the token, hashes the new password, updates the account, and removes or invalidates the temporary reset token. The user is redirected to `/login` and can sign in with the new password.

#### Environment Setup

Add these values to `.env.local` during development and to the deployment environment in production:

```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_long_random_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=NoteWise AI <noreply@your-verified-domain.com>
```

The sender domain must be verified in Resend. After changing environment variables, restart `npm run dev`. Never expose `RESEND_API_KEY` with a `NEXT_PUBLIC_` prefix because it must remain server-only.

#### Testing the Feature

1. Start the application with `npm run dev`.
2. Open `/forgot-password` or use the link on `/login`.
3. Submit the email address of an existing account.
4. Confirm that Resend delivered the email.
5. Open the email link and submit a new password.
6. Return to `/login` and sign in with the new password.
7. Try the same link again or wait until it expires; it should no longer work.

If no email arrives, check `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, Resend domain verification, and the server terminal logs. If the link reports an invalid token, check that `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, and the deployed domain all point to the same application.

---

## 🛠️ Installation & Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Set up your `.env` variables.
4. Run `npm run dev` to start the development server.