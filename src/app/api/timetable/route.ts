import { NextRequest, NextResponse } from "next/server";

// POST /api/timetable
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/upload-timetable`,
      {
        method: "POST",
        headers: {
          "X-API-Key": process.env.API_KEY || "",
        },
        body: formData,
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload timetable" },
      { status: 500 }
    );
  }
}

// DELETE /api/timetable
export async function DELETE() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/timetable`, {
      method: "DELETE",
      headers: {
        "X-API-Key": process.env.API_KEY || "",
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete timetables" },
      { status: 500 }
    );
  }
}
