import api from "@/lib/axios";
import { apiBaseUrl } from "@/constants";

export interface DigitalServiceIcon {
  id: string;
  url: string;
  alt: string;
  title: string;
  width: number;
  height: number;
}

export interface DigitalServiceData {
  id: string;
  title: string;
  link: string;
  newTab: boolean;
  icon: DigitalServiceIcon | null;
}

export const fetchDigitalServices = async (): Promise<DigitalServiceData[] | null> => {
  try {
    const response = await api.get("/jsonapi/node/digital_services", {
      params: {
        include: "field_icon",
        "filter[status]": "1", // solo los activos
        sort: "-created", // más recientes primero
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

    // Mapear los servicios digitales
    const services: DigitalServiceData[] = data.data.map((item: any) => {
      const { id, attributes, relationships } = item;

      // Obtener relación del ícono
      const iconRel = relationships?.field_icon?.data;
      let icon: DigitalServiceIcon | null = null;

      if (iconRel) {
        const includedIcon = includedById.get(iconRel.id);
        if (includedIcon) {
          const attrs = includedIcon.attributes;
          icon = {
            id: includedIcon.id,
            url: apiBaseUrl + attrs.uri.url,
            alt: iconRel.meta?.alt || "",
            title: iconRel.meta?.title || "",
            width: iconRel.meta?.width || 0,
            height: iconRel.meta?.height || 0,
          };
        }
      }

      return {
        id,
        title: attributes.title,
        link: attributes.field_any_link?.uri || "",
        newTab: attributes.field_new_tab || false,
        icon,
      };
    });

    return services;
  } catch (error) {
    console.error("Error fetching digital services:", error);
    return null;
  }
};
