import { NextRequest, NextResponse } from "next/server";

import { signInWithOAuth, type AuthSession } from "@/services/auth.server";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_PROFILE_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleProfileResponse = {
  id?: string;
  email?: string;
  verified_email?: boolean;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function redirectToAuthError(req: NextRequest, message: string) {
  const url = new URL("/auth", req.nextUrl.origin);
  url.searchParams.set("error", message);

  const response = NextResponse.redirect(url);
  response.cookies.delete("foundry_google_oauth_state");
  return response;
}

function createDashboardBridge(session: AuthSession) {
  const payload = JSON.stringify({ success: true, data: session }).replace(
    /</g,
    "\\u003c"
  );

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url=/dashboard" />
    <title>Signing in...</title>
  </head>
  <body>
    <script>
      const authResponse = ${payload};
      localStorage.setItem("foundry_access_token", authResponse.data.accessToken);
      localStorage.setItem("foundry_refresh_token", authResponse.data.refreshToken);
      document.cookie = "foundry_access_token=" + authResponse.data.accessToken + "; path=/; max-age=900; SameSite=Strict";
      window.location.replace("/dashboard");
    </script>
  </body>
</html>`;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");
  const expectedState = req.cookies.get("foundry_google_oauth_state")?.value;

  if (error) {
    return redirectToAuthError(req, "Google sign in was cancelled.");
  }

  if (!code) {
    return redirectToAuthError(req, "Google authorization code is missing.");
  }

  if (!state || !expectedState || state !== expectedState) {
    return redirectToAuthError(req, "Google sign in state is invalid.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  if (!clientId || !clientSecret) {
    return redirectToAuthError(req, "Google OAuth is not configured.");
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenJson = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenJson.access_token) {
      console.error("[api.auth.google.callback.token]", tokenJson);
      return redirectToAuthError(req, "Google token exchange failed.");
    }

    const profileResponse = await fetch(GOOGLE_PROFILE_URL, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });

    const profileJson = (await profileResponse.json()) as GoogleProfileResponse;

    if (!profileResponse.ok || !profileJson.id || !profileJson.email) {
      console.error("[api.auth.google.callback.profile]", profileJson);
      return redirectToAuthError(req, "Google profile lookup failed.");
    }

    const expiresAt =
      typeof tokenJson.expires_in === "number"
        ? new Date(Date.now() + tokenJson.expires_in * 1000)
        : null;

    const result = await signInWithOAuth(
      {
        provider: "google",
        providerUserId: profileJson.id,
        email: profileJson.email,
        name: profileJson.name ?? profileJson.email.split("@")[0],
        avatarUrl: profileJson.picture ?? null,
        emailVerified: Boolean(
          profileJson.verified_email ?? profileJson.email_verified
        ),
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token ?? null,
        expiresAt,
      },
      req
    );

    if (!result.success) {
      return redirectToAuthError(req, result.error);
    }

    const response = new NextResponse(createDashboardBridge(result.data), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });

    response.cookies.delete("foundry_google_oauth_state");
    response.cookies.set("foundry_access_token", result.data.accessToken, {
      maxAge: 15 * 60,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (callbackError) {
    console.error("[api.auth.google.callback]", callbackError);
    return redirectToAuthError(req, "Google sign in failed.");
  }
}
