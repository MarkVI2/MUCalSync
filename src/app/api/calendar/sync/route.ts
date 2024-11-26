import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../utils/authOptions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in sync route:", session);

    if (!session?.accessToken) {
      console.log("No access token found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendResponse = await fetch(
      "https://mucalsync-backend-b6bfaf9878eb.herokuapp.com/api/calendar/sync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: session.accessToken,
        }),
      }
    );

    const responseData = await backendResponse.json();
    console.log("Backend response:", responseData);

    if (!backendResponse.ok) {
      console.error("Backend error:", responseData);
      return NextResponse.json(
        { error: responseData.detail || "Failed to sync calendar" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync calendar", details: error },
      { status: 500 }
    );
  }
}
