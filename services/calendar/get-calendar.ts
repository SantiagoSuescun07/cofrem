import api from "@/lib/axios";
import { CalendarEvent } from "@/types";

const API_BASE_URL = "https://backoffice.cofrem.com.co"

/**
 * 🔹 Obtiene todos los eventos del calendario desde Drupal JSON:API
 */
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const response = await api.get(
      "/jsonapi/node/calendar?include=field_event_type,field_dependencies,field_image",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    // Mapeo de entidades incluidas (event type, dependencies, image)
    const includedMap = new Map();
    if (data.included) {
      data.included.forEach((item: any) => {
        includedMap.set(item.id, item);
      });
    }

    return data.data.map((item: any) => {
      const eventTypeId = item.relationships.field_event_type?.data?.id;
      const eventType = eventTypeId ? includedMap.get(eventTypeId) : null;

      const dependenciesId = item.relationships.field_dependencies?.data?.id;
      const dependencies = dependenciesId
        ? includedMap.get(dependenciesId)
        : null;

      const imageId = item.relationships.field_image?.data?.id;
      const image = imageId ? includedMap.get(imageId) : null;

      return {
        id: item.id,
        title: item.attributes.title,
        description: item.attributes.body?.processed || "",
        date: item.attributes.field_date,
        place: item.attributes.field_place,
        mapLink: {
          uri: item.attributes.field_map_link?.uri || "",
          title: item.attributes.field_map_link?.title || "Ver mapa",
        },
        infoButton: {
          uri: item.attributes.field_info_button?.uri || "",
          title: item.attributes.field_info_button?.title || "Más información",
        },
        isNotificationsEnabled:
          item.attributes.field_is_notifications_enabled,
        eventType: {
          id: eventTypeId || "",
          name: eventType?.attributes?.name || "Evento",
        },
        dependencies: {
          id: dependenciesId || "",
          name: dependencies?.attributes?.name || "General",
        },
        image: {
          url: image?.attributes?.uri?.url
            ? `${API_BASE_URL}${image.attributes.uri.url}`
            : "/corporate-event.png",
          alt:
            item.relationships.field_image?.data?.meta?.alt ||
            item.attributes.title,
        },
      };
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

/**
 * 🔹 Retorna los dígitos de placas restringidas por día (Pico y Placa)
 */
export function getPicoYPlacaForDate(date: Date): number[] {
  const dayOfWeek = date.getDay();

  const picoYPlacaSchedule: Record<number, number[]> = {
    1: [1, 2], // Lunes
    2: [3, 4], // Martes
    3: [5, 6], // Miércoles
    4: [7, 8], // Jueves
    5: [9, 0], // Viernes
    6: [], // Sábado
    0: [], // Domingo
  };

  return picoYPlacaSchedule[dayOfWeek] || [];
}

/**
 * 🔹 Genera un enlace directo para añadir el evento al Google Calendar
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // duración 2h

  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description.replace(/<[^>]*>/g, ""), // remover HTML
    location: event.place,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
