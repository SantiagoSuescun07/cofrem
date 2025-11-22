import { apiBaseUrl } from "@/constants";
import api from "@/lib/axios";
import { Publication, PublicationContent } from "@/types/publications";

export const fetchSinglePublication = async (
  id: string
): Promise<Publication> => {
  const response = await api.get(`/jsonapi/node/publication/${id}`, {
    params: {
      include: "field_image,field_news_category,field_options_in_publication",
    },
  });

  const item = response.data.data;
  const includedById = new Map<string, any>();
  if (response.data.included) {
    response.data.included.forEach((included: any) => {
      includedById.set(included.id, included);
    });
  }

  // field_gallery
  const galleryData = item.relationships.field_gallery?.data || [];
  const fieldGallery = galleryData.map((galItem: any) => {
    const galIncluded = includedById.get(galItem.id);
    return {
      id: galIncluded.id,
      url: apiBaseUrl + galIncluded.attributes.uri.url,
      alt: galItem.meta.alt,
      title: galItem.meta.title,
      width: galItem.meta.width,
      height: galItem.meta.height,
    };
  });

  // field_image
  const mainImageData = item.relationships.field_image?.data;
  const mainImageIncluded = mainImageData
    ? includedById.get(mainImageData.id)
    : null;
  const fieldImage = mainImageIncluded
    ? {
        id: mainImageIncluded.id,
        url: apiBaseUrl + mainImageIncluded.attributes.uri.url,
        alt: mainImageData.meta.alt,
        title: mainImageData.meta.title,
        width: mainImageData.meta.width,
        height: mainImageData.meta.height,
      }
    : null;

  // field_news_category
  const categoryData = item.relationships.field_news_category?.data || [];
  const fieldNewsCategory = categoryData.map((catItem: any) => {
    const catIncluded = includedById.get(catItem.id);
    return {
      id: catItem.id,
      name: catIncluded?.attributes?.name || "",
    };
  });

  // field_options_in_publication
  const optionsData = item.relationships.field_options_in_publication?.data;
  let fieldOptionsInPublication: PublicationContent | null = null;

  if (optionsData) {
    const optionsIncluded = includedById.get(optionsData.id);
    if (optionsIncluded) {
      const contentType = optionsIncluded.type as PublicationContent["type"];

      switch (contentType) {
        case "paragraph--link": {
          fieldOptionsInPublication = {
            type: contentType,
            id: optionsIncluded.id,
            field_link: {
              uri: optionsIncluded.attributes?.field_link?.uri || "",
              title: optionsIncluded.attributes?.field_link?.title || "",
            },
          };
          break;
        }
        case "paragraph--galeria_publicaciones": {
          const galleryImagesData =
            optionsIncluded.relationships?.field_gallery_images?.data || [];
          const galleryImages = galleryImagesData
            .map((imgItem: any) => {
              const imgIncluded = includedById.get(imgItem.id);
              if (!imgIncluded) return null;
              return {
                id: imgItem.id,
                url: apiBaseUrl + imgIncluded.attributes.uri.url,
                alt: imgItem.meta?.alt || "",
                title: imgItem.meta?.title || "",
                width: imgItem.meta?.width || 0,
                height: imgItem.meta?.height || 0,
              };
            })
            .filter((img: any) => img !== null);
          
          fieldOptionsInPublication = {
            type: contentType,
            id: optionsIncluded.id,
            field_gallery_images: galleryImages,
          };
          break;
        }
        case "paragraph--enriched_text": {
          fieldOptionsInPublication = {
            type: contentType,
            id: optionsIncluded.id,
            field_body: optionsIncluded.attributes?.field_body?.processed || "",
          };
          break;
        }
        case "paragraph--game_type_publication": {
          const gameData = optionsIncluded.relationships?.field_game?.data;
          if (gameData) {
            // Construir la URL del juego similar a como se hace en get-campaign.ts
            const paragraphType = gameData.type.replace("paragraph--", "");
            const gameId = gameData.id;
            const gameHref = `/jsonapi/paragraph/${paragraphType}/${gameId}`;
            
            fieldOptionsInPublication = {
              type: contentType,
              id: optionsIncluded.id,
              field_game: {
                id: gameData.id,
                url: gameHref,
                title: optionsIncluded.attributes?.field_title || "Juego",
                description: optionsIncluded.attributes?.field_description || "",
                gameType: gameData.type, // Guardar el tipo completo para la navegación
              },
            };
          }
          break;
        }
      }
    }
  }

  return {
    id: item.id,
    drupal_internal__nid: item.attributes.drupal_internal__nid,
    title: item.attributes.title,
    description: item.attributes.body?.processed || "",
    created: item.attributes.created,
    field_any_link: item.attributes.field_any_link?.uri || null,
    field_video_link: item.attributes.field_video_link?.uri || null,
    field_gallery: fieldGallery,
    field_image: fieldImage,
    field_news_category: fieldNewsCategory,
    field_options_in_publication: fieldOptionsInPublication,
  };
};
