import { NextRequest, NextResponse } from "next/server";

// GET /api/events
export async function GET() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/events`, {
      headers: {
        "X-API-Key": process.env.API_KEY || "",
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    const response = await fetch(`${process.env.BACKEND_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.API_KEY || "",
      },
      body: JSON.stringify(event),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
