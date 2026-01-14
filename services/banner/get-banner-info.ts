import api from "@/lib/axios";
import { apiBaseUrl } from "@/constants";
import { normalizeImageUrl } from "@/lib/image-url-normalizer";

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
  image: BannerImage | null;
  link: string;
  newTab: boolean;
}

export const fetchBanner = async (): Promise<BannerData[] | null> => {
  try {
    const response = await api.get("/jsonapi/node/banner", {
      params: {
        include: "field_image_banner",
        "filter[status]": "1", // solo activos
        "sort": "-created", // más recientes primero
      },
    });

    const data = response.data;

    // Crear mapa de archivos incluidos (si los hay)
    const includedById = new Map<string, any>();
    if (data.included) {
      data.included.forEach((included: any) => {
        includedById.set(included.id, included);
      });
    }

    // Mapear los banners
    const banners: BannerData[] = data.data.map((item: any) => {
      const { id, attributes, relationships } = item;

      // Obtener relación de imagen
      const imageRel = relationships?.field_image_banner?.data;
      let image: BannerImage | null = null;

      if (imageRel) {
        const includedImage = includedById.get(imageRel.id);
        if (includedImage) {
          const attrs = includedImage.attributes;
          const imageUrl = normalizeImageUrl(apiBaseUrl, attrs.uri.url || "");
          
          image = {
            id: includedImage.id,
            url: imageUrl,
            alt: imageRel.meta?.alt || "",
            title: imageRel.meta?.title || "",
            width: imageRel.meta?.width || 0,
            height: imageRel.meta?.height || 0,
          };
        }
      }

      return {
        id,
        title: attributes.title,
        created: attributes.created,
        changed: attributes.changed,
        image,
        link: attributes.field_any_link?.uri || "",
        newTab: attributes.field_new_tab || false,
      };
    });

    console.log("BANNERS: ", banners)

    return banners;
  } catch (error) {
    console.error("Error fetching banner:", error);
    return null;
  }
};
