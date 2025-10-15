"use client"

import { Calendar, MapPin } from "lucide-react"
import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarEvent } from "@/types"

interface CalendarListViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

export function CalendarListView({ events, onEventClick }: CalendarListViewProps) {
  // Group events by date
  const groupedEvents = events.reduce(
    (acc, event) => {
      const dateKey = format(new Date(event.date), "yyyy-MM-dd")
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    },
    {} as Record<string, CalendarEvent[]>,
  )

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Agenda de Eventos</h2>

      <div className="space-y-6">
        {sortedDates.map((dateKey) => {
          const date = new Date(dateKey)
          const dayEvents = groupedEvents[dateKey].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
          const isToday = isSameDay(date, new Date())

          return (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className={`flex items-center gap-3 pb-2 border-b ${isToday ? "border-primary" : ""}`}>
                <Calendar className={`h-5 w-5 ${isToday ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <h3 className={`font-semibold ${isToday ? "text-primary" : ""}`}>
                    {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  </h3>
                  {isToday && <span className="text-xs text-primary">Hoy</span>}
                </div>
              </div>

              {/* Events List */}
              <div className="space-y-2 pl-8">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full text-left p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-sm font-mono text-muted-foreground min-w-[60px] pt-1">
                        {format(new Date(event.date), "HH:mm")}
                      </div>
                      <div
                        className="w-1 h-full rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `var(--color-event-${event.eventType.name.toLowerCase()}, var(--color-primary))`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{event.place}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs bg-muted px-2 py-1 rounded">{event.eventType.name}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay eventos programados</p>
          </div>
        )}
      </div>
    </div>
  )
}
