// ============================================================
// app/page.tsx (Root page — the "/" route)
// This is the landing page. It simply redirects users:
//   - Logged in → /dashboard
//   - Not logged in → /login
//
// We use Next.js's redirect() function which works on the server
// (no client-side JavaScript needed — instant redirect).
// ============================================================

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export default async function RootPage() {
  // Try to get the current session from the request cookies.
  // headers() gives us the incoming request headers (including cookies).
  // auth.api.getSession() verifies the session JWT from the cookie.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is logged in → go to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // If not logged in → go to login page
  redirect("/login");
}
