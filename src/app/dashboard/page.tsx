"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user has admin rights
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-admin");
        const data = await response.json();

        if (!data.isAdmin) {
          router.push("/"); // Redirect if not authorized
          return;
        }

        setIsAuthorized(true);
        fetchEvents();
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/");
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`
        );
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Calendar Dashboard
          </h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <IconPlus size={20} />
            Add Event
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-7 gap-4">
            {/* Calendar implementation here */}
          </div>
        </div>

        {/* Events List */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Events</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.start).toLocaleString()} -
                      {new Date(event.end).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-indigo-600">
                      <IconEdit size={20} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600">
                      <IconTrash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
