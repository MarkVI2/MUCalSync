import { NextRequest, NextResponse } from "next/server";

// PUT /api/events/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await request.json();
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/events/${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.API_KEY || "",
        },
        body: JSON.stringify(event),
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/events/${params.id}`,
      {
        method: "DELETE",
        headers: {
          "X-API-Key": process.env.API_KEY || "",
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
