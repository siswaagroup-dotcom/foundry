import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  // Production URL from Railway
  const appUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID is missing." },
      { status: 500 }
    );
  }

  if (!appUrl) {
    return NextResponse.json(
      { error: "APP_URL or NEXT_PUBLIC_APP_URL is missing." },
      { status: 500 }
    );
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const state = crypto.randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  const response = NextResponse.redirect(
    `${GOOGLE_AUTH_URL}?${params.toString()}`
  );

  response.cookies.set("foundry_google_oauth_state", state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}