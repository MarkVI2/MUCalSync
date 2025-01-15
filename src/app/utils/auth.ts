import { cookies } from "next/headers";

export async function refreshAccessToken(refresh_token: string) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}
