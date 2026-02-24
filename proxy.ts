// ============================================================
// proxy.ts  (at the ROOT of the project, next to package.json)
// Next.js 16 Proxy — runs on EVERY request, before the page loads.
//
// This is our "security guard at the door."
// It checks: "Does this user have a valid session cookie?"
//
// If they're trying to access a protected page without being logged in
// → redirect them to /login
//
// If they're already logged in and trying to visit /login or /register
// → redirect them to /dashboard (no need to login again!)
// ============================================================

import { NextRequest, NextResponse } from "next/server";

// Routes that need the user to be logged in
const PROTECTED_ROUTES = ["/dashboard", "/pages", "/profile"];

// Routes that should redirect to /dashboard if already logged in
const AUTH_ROUTES = ["/login", "/register"];

// In Next.js 16, the exported function must be named "proxy" (not "middleware")
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // If it's not a route we care about, let it pass through immediately
    if (!isProtectedRoute && !isAuthRoute) {
        return NextResponse.next();
    }

    // Check for the Better Auth session cookie.
    const sessionCookie =
        request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token");

    const isLoggedIn = !!sessionCookie;

    // Case 1: Trying to access a protected page without being logged in
    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Case 2: Already logged in but visiting login/register page
    if (isAuthRoute && isLoggedIn) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

// Configure which routes this proxy runs on.
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
