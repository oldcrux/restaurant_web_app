"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface BookingCalendarProps {
  events: any[];
  onEventClick: (info: any) => void;
  onDateSelect: (info: any) => void;
  calendarRef: React.RefObject<any>;
}

export default function BookingCalendar({
  events,
  onEventClick,
  onDateSelect,
  calendarRef,
}: BookingCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renderEventContent = (eventInfo: any) => {
    const status = eventInfo.event.extendedProps?.status;
    const statusColors: Record<string, string> = {
      booked: "bg-blue-100 text-blue-800 border-blue-200",
      seated: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };

    const statusColor = statusColors[status] || statusColors.booked;

    return (
      <div className={`p-2 rounded border ${statusColor} text-sm`}>
        <div className="font-medium truncate">{eventInfo.event.title}</div>
        <div className="text-xs opacity-80">{eventInfo.timeText}</div>
      </div>
    );
  };

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      initialDate={today}
      validRange={{ start: today }}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      events={events}
      eventClick={onEventClick}
      selectable
      selectMirror
      selectAllow={(selectInfo: any) => selectInfo.start >= new Date()}
      dayMaxEvents
      weekends
      nowIndicator
      select={onDateSelect}
      eventContent={renderEventContent}
      businessHours={{
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: "09:00",
        endTime: "23:00",
      }}
      slotMinTime="09:00:00"
      slotMaxTime="23:00:00"
      slotDuration="00:30:00"
      allDaySlot={false}
      firstDay={1}
      height="auto"
      themeSystem="standard"
      dayHeaderClassNames="dark:text-gray-200"
      dayCellClassNames="dark:border-gray-700"
      eventClassNames="cursor-pointer"
      eventBackgroundColor="#3b82f6"
      eventBorderColor="#2563eb"
      eventTextColor="#ffffff"
      eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        meridiem: "short",
      }}
      slotLabelFormat={{
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        meridiem: "short",
      }}
    />
  );
}
