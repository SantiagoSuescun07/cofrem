"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { CalendarEvent, CalendarView } from "@/types";
import { EventDetailModal } from "./_components/event-detail-modal";
import { CalendarListView } from "./_components/calendar-list-view";
import { CalendarMonthView } from "./_components/calendar-month-view";
import { CalendarWeekView } from "./_components/calendar-week-view";
import { CalendarViewToggle } from "./_components/calendar-view-toggle";
import { BreadcrumbNav } from "./_components/breadcrumb-nav";
import { useCalendarEventsQuery } from "@/queries/calendar"; // 👈 importas el hook

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 👇 Hook de React Query (sin useEffect)
  const { data: events = [], isLoading, isError } = useCalendarEventsQuery();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 md:px-10 py-8 max-w-7xl">
        <BreadcrumbNav />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl mb-2">Calendario de Eventos</h1>
            <p className="text-muted-foreground">
              Consulta todos los eventos corporativos programados
            </p>
          </div>
          <CalendarViewToggle view={view} onViewChange={setView} />
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="text-center text-muted-foreground py-20">
            Error al cargar los eventos
          </p>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No hay eventos programados
          </div>
        ) : (
          <>
            {view === "month" && (
              <CalendarMonthView
                events={events}
                onEventClick={setSelectedEvent}
              />
            )}
            {view === "week" && (
              <CalendarWeekView
                events={events}
                onEventClick={setSelectedEvent}
              />
            )}
            {view === "list" && (
              <CalendarListView
                events={events}
                onEventClick={setSelectedEvent}
              />
            )}
          </>
        )}

        <EventDetailModal
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    </div>
  );
}
