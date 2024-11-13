import { NextResponse } from "next/server";
import { decryptData } from "@/utils/encryption";

export async function POST(request: Request) {
  try {
    const { encryptedData } = await request.json();
    const baseUrl = process.env.BACKEND_URL;

    if (!baseUrl) {
      console.error("BACKEND_URL not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!process.env.ENCRYPTION_KEY) {
      console.error("ENCRYPTION_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Decrypt the data
    try {
      const decryptedData = decryptData(
        encryptedData,
        process.env.ENCRYPTION_KEY!
      );

      // Make a single call to our backend auth endpoint
      const loginResponse = await fetch(`${baseUrl}/api/auth/muerp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Encryption-Key": process.env.BACKEND_ENCRYPTION_KEY!,
        },
        body: JSON.stringify(decryptedData),
        cache: "no-store",
        credentials: "include",
      });

      const data = await loginResponse.json();
      console.log("Backend response:", data); // Debug log

      if (!loginResponse.ok) {
        console.error("Backend error:", data);
        return NextResponse.json(
          { error: data.detail || "Authentication failed" },
          { status: loginResponse.status }
        );
      }

      // Create response
      const response = NextResponse.json({
        success: true,
        message: "Successfully logged in",
        cookies: data.cookies,
      });

      // Set both MUERP session and username cookies
      response.cookies.set("muerp_session", data.cookies, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      response.cookies.set("muerp_username", decryptedData.username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return response;
    } catch (decryptError) {
      console.error("Decryption error:", decryptError);
      return NextResponse.json(
        { error: "Invalid encrypted data" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("MUERP login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
