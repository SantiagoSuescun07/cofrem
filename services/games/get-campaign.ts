import { apiBaseUrl } from "@/constants";
import api from "@/lib/axios";
import { EntertainmentCampaign } from "@/types/games";

export const fetchCampaign = async (
  campaignId: string
): Promise<EntertainmentCampaign | null> => {
  try {
    const response = await api.get(`/jsonapi/node/entertainment/${campaignId}`, {
      params: {
        include: "field_main_image,field_game_type,field_badges",
      },
    });

    const item = response.data.data;
    const data = response.data;

    // Crear un mapa de recursos incluidos para acceso rápido
    const includedById = new Map<string, any>();
    if (data.included) {
      data.included.forEach((included: any) => {
        includedById.set(included.id, included);
      });
    }

    // Resolver field_main_image
    const mainImageData = item.relationships.field_main_image?.data;
    const mainImageIncluded = mainImageData
      ? includedById.get(mainImageData.id)
      : null;
    const fieldMainImage = mainImageIncluded
      ? {
          id: mainImageIncluded.id,
          url: apiBaseUrl + mainImageIncluded.attributes.uri.url,
          alt: mainImageData.meta.alt || "",
          title: mainImageData.meta.title || "",
          width: mainImageData.meta.width || 0,
          height: mainImageData.meta.height || 0,
        }
      : null;

    // Resolver field_game_type
    const gameTypeData = item.relationships.field_game_type?.data;
    const fieldGameType = gameTypeData
      ? {
          type: gameTypeData.type,
          id: gameTypeData.id,
          href:
            item.relationships.field_game_type.links?.related?.href || "",
        }
      : null;

    // Resolver field_badges
    const badgesData = item.relationships.field_badges?.data;
    const badgesIncluded = badgesData
      ? includedById.get(badgesData.id)
      : null;
    const fieldBadges = badgesIncluded
      ? {
          id: badgesIncluded.id,
          name: badgesIncluded.attributes.name || "",
        }
      : null;

    const campaign: EntertainmentCampaign = {
      id: item.id,
      drupal_internal__nid: item.attributes.drupal_internal__nid,
      title: item.attributes.title,
      body: item.attributes.body?.value || item.attributes.body?.processed || "",
      created: item.attributes.created,
      changed: item.attributes.changed,
      field_date_range: item.attributes.field_date_range || {
        value: "",
        end_value: "",
      },
      field_main_image: fieldMainImage,
      field_game_type: fieldGameType,
      field_badges: fieldBadges,
    };

    return campaign;
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return null;
  }
};

