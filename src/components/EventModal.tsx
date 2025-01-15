"use client";

import { useState, useEffect } from "react";
import { EventInput } from "@fullcalendar/core";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: EventInput) => void;
  onDelete?: (eventId: string) => void;
  initialDate?: {
    start: string;
    end: string;
    allDay: boolean;
  };
  selectedEvent?: EventInput | null;
  mode?: "create" | "edit";
}

// Helper function to format datetime string
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    // Format date in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};

const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0); // Set to start of the day
  return newDate;
};

const getEndOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999); // Set to end of the day
  return newDate;
};

const getInitialEventData = (
  selectedEvent: EventInput | null,
  initialDate: { start: string; end: string; allDay: boolean }
) => ({
  id: selectedEvent?.id || "",
  title: selectedEvent?.title || "",
  start: formatDateForInput(
    selectedEvent?.start?.toString() || initialDate?.start || ""
  ),
  end: formatDateForInput(
    selectedEvent?.end?.toString() || initialDate?.end || ""
  ),
  location: selectedEvent?.extendedProps?.location || "",
  description: selectedEvent?.extendedProps?.description || "",
  allDay: selectedEvent?.allDay || initialDate?.allDay || false,
});

export default function EventModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialDate = { start: "", end: "", allDay: false },
  selectedEvent = null,
  mode = "create",
}: EventModalProps) {
  const [eventData, setEventData] = useState(() =>
    getInitialEventData(selectedEvent, initialDate)
  );

  useEffect(() => {
    if (!isOpen) return; // Only update when modal is open

    if (mode === "edit" && selectedEvent) {
      setEventData({
        id: selectedEvent.id || "",
        title: selectedEvent.title || "",
        start: formatDateForInput(selectedEvent.start?.toString() || ""),
        end: formatDateForInput(selectedEvent.end?.toString() || ""),
        location: selectedEvent.extendedProps?.location || "",
        description: selectedEvent.extendedProps?.description || "",
        allDay: selectedEvent.allDay || false,
      });
    } else if (mode === "create" && initialDate) {
      setEventData({
        id: "",
        title: "",
        start: formatDateForInput(initialDate.start),
        end: formatDateForInput(initialDate.end),
        location: "",
        description: "",
        allDay: initialDate.allDay,
      });
    }
  }, [isOpen, mode, selectedEvent?.id]); // Only depend on stable values

  const handleAllDayChange = (isAllDay: boolean) => {
    try {
      if (isAllDay) {
        const startDate = getStartOfDay(
          new Date(eventData.start || new Date())
        );
        const endDate = getEndOfDay(new Date(eventData.end || startDate));

        setEventData({
          ...eventData,
          allDay: isAllDay,
          start: formatDateForInput(startDate.toISOString()),
          end: formatDateForInput(endDate.toISOString()),
        });
      } else {
        const now = new Date();
        const later = new Date(now);
        later.setHours(now.getHours() + 1);

        setEventData({
          ...eventData,
          allDay: isAllDay,
          start: formatDateForInput(now.toISOString()),
          end: formatDateForInput(later.toISOString()),
        });
      }
    } catch (error) {
      console.error("Error handling all-day change:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...eventData,
      id: eventData.id || String(Date.now()),
      start: new Date(eventData.start).toISOString(),
      end: new Date(eventData.end).toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {mode === "create" ? "Create Event" : "Edit Event"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={eventData.title}
              onChange={(e) =>
                setEventData({ ...eventData, title: e.target.value })
              }
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={eventData.allDay}
              onChange={(e) => handleAllDayChange(e.target.checked)}
            />
            <label className="ml-2 text-sm text-gray-700">All day event</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start
              </label>
              <input
                type={eventData.allDay ? "date" : "datetime-local"}
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                  eventData.allDay
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-300"
                }`}
                value={
                  eventData.allDay
                    ? eventData.start.split("T")[0]
                    : eventData.start
                }
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    start: eventData.allDay
                      ? `${e.target.value}T00:00`
                      : e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End
              </label>
              <input
                type={eventData.allDay ? "date" : "datetime-local"}
                required
                className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                  eventData.allDay
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-300"
                }`}
                value={
                  eventData.allDay ? eventData.end.split("T")[0] : eventData.end
                }
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    end: eventData.allDay
                      ? `${e.target.value}T23:59`
                      : e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={eventData.location}
              onChange={(e) =>
                setEventData({ ...eventData, location: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
              value={eventData.description}
              onChange={(e) =>
                setEventData({ ...eventData, description: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end space-x-3">
            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this event?"
                    )
                  ) {
                    onDelete(eventData.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {mode === "create" ? "Create" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
