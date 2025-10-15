// src/queries/calendar.ts
import { useQuery } from "@tanstack/react-query";
import { fetchCalendarEvents } from "@/services/calendar/get-calendar";

export const CALENDAR_EVENTS_QUERY_KEY = "calendarEvents";

export function useCalendarEventsQuery() {
  return useQuery({
    queryKey: [CALENDAR_EVENTS_QUERY_KEY],
    queryFn: fetchCalendarEvents,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
    retry: 2, // reintenta 2 veces en caso de error
  });
}
