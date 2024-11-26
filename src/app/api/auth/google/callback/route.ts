import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../utils/authOptions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: "https://mucalsync.vercel.app/api/auth/google/callback",
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error("Token error:", tokens);
      return NextResponse.redirect("https://mucalsync.vercel.app/auth/error");
    }

    // Get the session and store the access token
    const session = await getServerSession(authOptions);
    if (session) {
      session.accessToken = tokens.access_token;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect("https://mucalsync.vercel.app/auth/error");
  }
}
