import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';

interface Props {
  events: EventInput[];
  view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  onSelect: (arg: DateSelectArg) => void;
  onEventClick: (arg: EventClickArg) => void;
  onEventDrop: (arg: EventDropArg) => void;
}

export default function CalendarView({ events, view, onSelect, onEventClick, onEventDrop }: Props) {
  return (
    <div className="fc-themed">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={false}
        locale="zh-cn"
        height="auto"
        selectable
        editable
        events={events}
        select={onSelect}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        dayMaxEvents={3}
      />
    </div>
  );
}
