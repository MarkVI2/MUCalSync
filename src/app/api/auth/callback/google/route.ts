import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_REDIRECT_URI =
    process.env.NODE_ENV === "production"
      ? process.env.GOOGLE_REDIRECT_PROD_URI
      : process.env.GOOGLE_REDIRECT_URI;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error("Missing environment variables");
    return new Response(
      `<script>
        window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR' }, '*');
        window.close();
      </script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return new Response(
      `<script>
        window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR' }, '*');
        window.close();
      </script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      return new Response(
        `<script>
          window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR' }, '*');
          window.close();
        </script>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // After getting tokenData
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userData = await userInfoResponse.json();
    const email = userData.email;

    // Store tokens in secure HTTP-only cookies
    const cookieStore = await cookies();

    cookieStore.set("google_refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    cookieStore.set("google_access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expires_in,
      path: "/",
    });

    return new Response(
      `<script>
        window.opener.postMessage({ 
          type: 'GOOGLE_AUTH_SUCCESS',
          token: {
            access_token: "${tokenData.access_token}",
            refresh_token: "${tokenData.refresh_token}",
            email: "${email}"
          }
        }, '*');
        window.close();
      </script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Token exchange error:", error);
    return new Response(
      `<script>
        window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR' }, '*');
        window.close();
      </script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const { username, password } = await request.json();

    // Validate against your admin credentials
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;
    const cookieStore = await cookies();

    if (!validUsername || !validPassword) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (username === validUsername && password === validPassword) {
      // Set admin session cookie
      cookieStore.set("admin_session", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
};
