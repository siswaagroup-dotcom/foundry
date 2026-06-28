import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";

type Params = { params: Promise<{ platform: string }> };

const scopes: Record<string, string[]> = {
  facebook: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
  instagram: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
  linkedin: ["w_organization_social", "r_organization_social"],
  x: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  youtube: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"],
};

function envFor(platform: string) {
  switch (platform) {
    case "facebook":
    case "instagram":
      return {
        clientId: process.env.FACEBOOK_CLIENT_ID,
        redirectUri: process.env.FACEBOOK_REDIRECT_URI,
        url: "https://www.facebook.com/v19.0/dialog/oauth",
      };
    case "linkedin":
      return {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        redirectUri: process.env.LINKEDIN_REDIRECT_URI,
        url: "https://www.linkedin.com/oauth/v2/authorization",
      };
    case "x":
      return {
        clientId: process.env.X_CLIENT_ID,
        redirectUri: process.env.X_REDIRECT_URI,
        url: "https://twitter.com/i/oauth2/authorize",
      };
    case "youtube":
      return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        url: "https://accounts.google.com/o/oauth2/v2/auth",
      };
    default:
      return null;
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { platform } = await params;
  const config = envFor(platform);
  if (!config || !scopes[platform]) {
    return apiError("Unsupported social platform", 400, "UNSUPPORTED_PLATFORM");
  }
  if (!config.clientId || !config.redirectUri) {
    return apiError("OAuth is not configured for this provider", 501, "OAUTH_NOT_CONFIGURED");
  }

  const url = new URL(config.url);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes[platform].join(" "));
  url.searchParams.set("state", crypto.randomUUID());
  if (platform === "youtube") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
  }
  return NextResponse.redirect(url);
}
