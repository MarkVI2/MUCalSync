import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const baseUrl = process.env.BACKEND_URL;

    // Make a single call to our backend auth endpoint
    const loginResponse = await fetch(`${baseUrl}/api/auth/muerp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
      cache: "no-store",
      credentials: "include",
    });

    const data = await loginResponse.json();

    if (!loginResponse.ok) {
      return NextResponse.json(
        { error: data.detail || "Authentication failed" },
        { status: loginResponse.status }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Successfully logged in",
    });

    // Set both MUERP session and username cookies
    response.cookies.set("muerp_session", data.cookies, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("muerp_username", username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("MUERP login error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again later." },
      { status: 500 }
    );
  }
}
