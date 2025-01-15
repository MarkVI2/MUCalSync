import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshAccessToken } from "../../../utils/auth";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const refresh_token = cookieStore.get("google_refresh_token")?.value;
  const access_token = cookieStore.get("google_access_token")?.value;

  if (!refresh_token) {
    return NextResponse.json({ googleAuthenticated: false });
  }

  if (!access_token) {
    // Access token expired, get a new one using refresh token
    const newTokens = await refreshAccessToken(refresh_token);

    if (!newTokens || newTokens.error) {
      // Refresh token invalid/expired
      cookieStore.delete("google_refresh_token");
      return NextResponse.json({ authenticated: false });
    }

    // Store new access token
    cookieStore.set("google_access_token", newTokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: newTokens.expires_in,
      path: "/",
    });

    return NextResponse.json({
      googleAuthenticated: true,
      token: newTokens.access_token,
    });
  }

  return NextResponse.json({
    googleAuthenticated: true,
    token: access_token,
  });
}
