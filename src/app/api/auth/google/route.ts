import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI =
    process.env.NODE_ENV === "production"
      ? process.env.GOOGLE_REDIRECT_PROD_URI
      : process.env.GOOGLE_REDIRECT_URI;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    console.error("Missing environment variables");
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append(
    "scope",
    "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email"
  );
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent");

  return NextResponse.json({ url: authUrl.toString() });
}
