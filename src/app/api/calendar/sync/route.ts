import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { timetable } = await request.json();

    // Convert timetable data to Google Calendar events
    const events = timetable.schedule
      .map((day: any) =>
        day.slots.map((slot: any) => ({
          summary: `${slot.subject_name} (${slot.type})`,
          location: slot.room,
          description: `Faculty: ${slot.faculty}\nSubject Code: ${slot.subject_code}`,
          start: {
            dateTime: `${day.day}T${slot.start_time}:00`,
            timeZone: "Asia/Kolkata",
          },
          end: {
            dateTime: `${day.day}T${slot.end_time}:00`,
            timeZone: "Asia/Kolkata",
          },
          recurrence: ["RRULE:FREQ=WEEKLY;COUNT=16"], // Repeat for one semester
        }))
      )
      .flat();

    // Create events in Google Calendar
    for (const event of events) {
      await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync calendar" },
      { status: 500 }
    );
  }
}