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

    console.log("RESPONSE: ", response.data);
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

      // Procesar el link: convertir entity:node/X a la URL interna
      let link = attributes.field_any_link?.uri || "";
      if (link.startsWith("entity:node/")) {
        // Extraer el ID del nodo (ej: "entity:node/110" -> "110")
        const nodeId = link.replace("entity:node/", "");
        // Construir la URL interna
        link = `${apiBaseUrl}node/${nodeId}`;
      }

      return {
        id,
        title: attributes.title,
        link,
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
