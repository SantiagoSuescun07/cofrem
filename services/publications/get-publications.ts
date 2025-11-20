import { apiBaseUrl } from "@/constants";
import api from "@/lib/axios";
import { Publication } from "@/types/publications";

export const fetchPublications = async (): Promise<Publication[]> => {
  const response = await api.get("/jsonapi/node/publication", {
    params: {
      // include: "field_gallery,field_image",
      include: "field_image",
    },
  });

  const data = response.data;

  console.log(response.statusText)

  // Map de entidades incluidas
  const includedById = new Map<string, any>();
  if (data.included) {
    data.included.forEach((included: any) => {
      includedById.set(included.id, included);
    });
  }

  // Mapear publicaciones
  const publications = data.data.map((item: any) => {
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
    };
  });

  return publications;
};
