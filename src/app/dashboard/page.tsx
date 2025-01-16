"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { IconLogout } from "@tabler/icons-react";
import Calendar from "../../components/Calendar";
import { EventInput } from "@fullcalendar/core";
import Providers from "../../components/Providers";
import TimetableUpload from "../../components/TimetableUpload";

const DashboardContent = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isUploader =
    session?.user?.name === process.env.NEXT_PUBLIC_TIMETABLE_UPLOAD_USERNAME;

  const handleEventAdd = async (event: EventInput) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
      if (response.ok) {
        const savedEvent = await response.json();
        setEvents((currentEvents) => [...currentEvents, savedEvent]);
      }
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  const handleEventUpdate = async (event: EventInput) => {
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
      if (response.ok) {
        setEvents(events.map((e) => (e.id === event.id ? event : e)));
      }
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEvents(events.filter((e) => e.id !== eventId));
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    // Simple username check
    if (session?.user?.name) {
      if (
        session.user.name !== process.env.NEXT_PUBLIC_ADMIN_USERNAME &&
        session.user.name !== process.env.NEXT_PUBLIC_TIMETABLE_UPLOAD_USERNAME
      ) {
        signOut({ redirect: true, callbackUrl: "/login" });
      }
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <IconLogout size={20} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isUploader && (
          <div className="mb-6">
            <TimetableUpload />
          </div>
        )}
        <Calendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </main>
    </div>
  );
};

export default function Dashboard() {
  return (
    <Providers>
      <DashboardContent />
    </Providers>
  );
}
