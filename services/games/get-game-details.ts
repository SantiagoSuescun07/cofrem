import { apiBaseUrl } from "@/constants";
import api from "@/lib/axios";
import { GameDetails } from "@/types/games";

export const fetchGameDetails = async (
  gameUrl: string
): Promise<GameDetails | null> => {
  try {
    // La URL puede ser relativa o absoluta
    let url = gameUrl;
    if (gameUrl.startsWith("http")) {
      // Si es una URL absoluta, extraer solo la ruta después del dominio
      try {
        const urlObj = new URL(gameUrl);
        url = urlObj.pathname + urlObj.search;
      } catch {
        // Si falla el parsing, intentar reemplazar el baseURL
        url = gameUrl.replace(apiBaseUrl, "");
      }
    }

    const response = await api.get(url, {
      params: {
        include: "field_icon",
      },
    });

    const data = response.data;

    // Crear un mapa de recursos incluidos
    const includedById = new Map<string, any>();
    if (data.included) {
      data.included.forEach((included: any) => {
        includedById.set(included.id, included);
      });
    }

    // Resolver field_icon
    const iconData = data.data.relationships.field_icon?.data;
    const iconIncluded = iconData ? includedById.get(iconData.id) : null;
    const fieldIcon = iconIncluded
      ? {
          id: iconIncluded.id,
          url: apiBaseUrl + iconIncluded.attributes.uri.url,
          alt: iconData.meta.alt || "",
          title: iconData.meta.title || "",
          width: iconData.meta.width || 0,
          height: iconData.meta.height || 0,
        }
      : null;

    const gameDetails: GameDetails = {
      id: data.data.id,
      type: data.data.type,
      field_title: data.data.attributes.field_title || "",
      field_description: data.data.attributes.field_description || "",
      field_grid_size: data.data.attributes.field_grid_size || "15x15",
      field_points_per_word: data.data.attributes.field_points_per_word || 10,
      field_time_limit: data.data.attributes.field_time_limit || 0,
      field_word_directions:
        data.data.attributes.field_word_directions || [],
      field_words_to_find: data.data.attributes.field_words_to_find || "",
      field_icon: fieldIcon,
    };

    return gameDetails;
  } catch (error) {
    console.error("Error fetching game details:", error);
    return null;
  }
};

