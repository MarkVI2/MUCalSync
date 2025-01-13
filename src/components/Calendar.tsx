"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { createPlugin } from "@fullcalendar/core";
import EventModal from "./EventModal";

// Custom view definition
const customViewPlugin = createPlugin({
  views: {
    customWeek: {
      type: "dayGrid",
      duration: { weeks: 1 },
      buttonText: "Custom Week",
      dayHeaderContent: (args) => {
        return args.date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        });
      },
      dayCellContent: (args) => {
        return args.date.getDate();
      },
      // Custom styling
      classNames: ["custom-week-view"],
    },
    customDay: {
      type: "timeGrid",
      duration: { days: 1 },
      buttonText: "Custom Day",
      slotDuration: "00:30:00",
      slotLabelInterval: "01:00",
      slotLabelFormat: {
        hour: "numeric",
        minute: "2-digit",
        omitZeroMinute: false,
        meridiem: "short",
      },
    },
  },
  name: "",
});

interface CalendarProps {
  events: EventInput[];
  onEventAdd: (event: EventInput) => void;
  onEventUpdate: (event: EventInput) => void;
  onEventDelete: (eventId: string) => void;
}

export default function Calendar({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
}: CalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [initialDate, setInitialDate] = useState<{
    start: string;
    end: string;
    allDay: boolean;
  } | null>(null);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setModalMode("create");
    setSelectedEvent(null);
    setInitialDate({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setModalMode("edit");
    setSelectedEvent(clickInfo.event.toPlainObject());
    setIsModalOpen(true);
  };

  // Add event drag handling
  const handleEventDrop = (info: any) => {
    const updatedEvent = {
      ...info.event.toPlainObject(),
      start: info.event.allDay
        ? `${info.event.startStr}T00:00:00`
        : info.event.startStr,
      end: info.event.allDay
        ? `${info.event.endStr}T00:00:00`
        : info.event.endStr,
      allDay: info.event.allDay,
    };
    onEventUpdate(updatedEvent);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow w-full overflow-x-auto">
      <div className="min-w-[280px]">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            customViewPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,customWeek,customDay",
          }}
          views={{
            dayGridMonth: {
              dayMaxEventRows: 3,
              fixedWeekCount: false,
              showNonCurrentDates: false,
            },
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height="auto"
          expandRows={true}
          stickyHeaderDates={true}
          handleWindowResize={true}
          contentHeight="auto"
          aspectRatio={1.35}
          windowResizeDelay={0}
          themeSystem="standard"
          // Touch-related settings
          eventDragStart={(info) => (info.el.style.cursor = "move")}
          longPressDelay={0}
          eventLongPressDelay={0}
          selectLongPressDelay={0}
          // Mobile-friendly settings
          eventStartEditable={true}
          eventDurationEditable={true}
          dragRevertDuration={0}
          forceEventDuration={true}
          snapDuration={{ minutes: 30 }}
        />
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={modalMode === "create" ? onEventAdd : onEventUpdate}
        onDelete={onEventDelete}
        initialDate={initialDate || undefined}
        selectedEvent={selectedEvent}
        mode={modalMode}
      />
    </div>
  );
}
