// queries/directory/use-directory.ts
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useDirectoryByArea(areaId: number) {
  return useQuery({
    queryKey: ["directory", areaId],
    enabled: !!areaId,
    queryFn: async () => {
      const { data } = await api.get(
        `/jsonapi/node/directory?filter[field_area_subarea.meta.drupal_internal__target_id]=${areaId}&include=field_picture`
      );

      // Crear un mapa de archivos incluidos para lookup rápido
      const includedFiles =
        data.included?.reduce((acc: any, file: any) => {
          if (file.type === "file--file") {
            acc[file.id] = file.attributes.uri?.url;
          }
          return acc;
        }, {}) || {};

      return data.data.map((item: any) => {
        const imageId = item.relationships?.field_picture?.data?.id;
        const imageUrl = imageId
          ? `https://backoffice.cofrem.com.co${includedFiles[imageId]}`
          : "/default.png";

        return {
          id: item.id,
          name: item.attributes.title,
          position: item.attributes.field_charge,
          email: item.attributes.field_mail,
          phone: item.attributes.field_phone,
          imageUrl,
        };
      });
    },
  });
}
