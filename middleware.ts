// =============================================================================
// NEXT.JS MIDDLEWARE — Route Protection
// Runs on the Edge runtime before every matching request.
// Protects /dashboard/* and /workspace/* using the JWT access token
// stored in localStorage — read from the Authorization header or a
// custom cookie (x-access-token) set by the client.
//
// Strategy:
//   1. Read token from cookie "foundry_access_token"
//   2. Verify it using the JWT_ACCESS_SECRET env var
//   3. If valid   → allow request through
//   4. If invalid → redirect to /auth
//   5. Public routes (/auth, /api/*) are always allowed through
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/workspace"];

// Routes that are always public — never redirect these
const PUBLIC_PREFIXES = [
  "/auth",
  "/invite",      // invitation acceptance pages
  "/api",         // API routes handle their own auth
  "/_next",       // Next.js internals
  "/favicon.ico",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public routes through immediately
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Root "/" — redirect to /auth (auth page is the landing page)
  if (pathname === "/") {
    return NextResponse.next(); // page.tsx handles this redirect already
  }

  // Only enforce auth on protected routes
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  // ── Read token ────────────────────────────────────────────────────────────
  // The client stores the access token in localStorage, but middleware
  // runs on the server and cannot read localStorage. The client-side
  // AuthSessionBootstrap sets a cookie on every page load so middleware
  // can read it. Cookie name matches the localStorage key.
  const token =
    req.cookies.get("foundry_access_token")?.value ?? "";

  if (!token) {
    return redirectToAuth(req);
  }

  // ── Verify token ─────────────────────────────────────────────────────────
  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET ?? "");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token expired or invalid — clear cookie and redirect
    const response = redirectToAuth(req);
    response.cookies.delete("foundry_access_token");
    return response;
  }
}

function redirectToAuth(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/auth";
  // Preserve intended destination so we can redirect back after login
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// Apply middleware only to these path patterns
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspace/:path*",
  ],
};
