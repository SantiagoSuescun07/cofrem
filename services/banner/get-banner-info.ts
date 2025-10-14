import api from "@/lib/axios";
import { apiBaseUrl } from "@/constants";

export interface BannerImage {
  id: string;
  url: string;
  alt: string;
  title: string;
  width: number;
  height: number;
}

export interface BannerData {
  id: string;
  title: string;
  created: string;
  changed: string;
  field_gallery: BannerImage[];
}

export const fetchBanner = async (): Promise<BannerData | null> => {
  try {
    const response = await api.get(
      "/jsonapi/node/page",
      {
        params: {
          "filter[title]": "Banner Inicio",
          include: "field_gallery",
        },
      }
    );

    const data = response.data;

    // Crear un mapa de "included" (archivos)
    const includedById = new Map<string, any>();
    if (data.included) {
      data.included.forEach((included: any) => {
        includedById.set(included.id, included);
      });
    }

    // Tomar el primer resultado (asumiendo que "Banner Inicio" es único)
    const item = data.data?.[0];
    if (!item) return null;

    // Procesar imágenes de "field_gallery"
    const galleryData = item.relationships.field_gallery?.data || [];
    const fieldGallery = galleryData.map((galItem: any) => {
      const galIncluded = includedById.get(galItem.id);
      return {
        id: galIncluded?.id,
        url: galIncluded ? apiBaseUrl + galIncluded.attributes.uri.url : "",
        alt: galItem.meta.alt,
        title: galItem.meta.title,
        width: galItem.meta.width,
        height: galItem.meta.height,
      };
    });

    return {
      id: item.id,
      title: item.attributes.title,
      created: item.attributes.created,
      changed: item.attributes.changed,
      field_gallery: fieldGallery,
    };
  } catch (error) {
    console.error("Error fetching banner:", error);
    return null;
  }
};
