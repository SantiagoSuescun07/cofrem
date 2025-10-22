import { fetchDigitalServices } from "@/services/digital-services/get-digital-services";
import { useQuery } from "@tanstack/react-query";

export const useDigitalServicesQuery = () => {
  return useQuery({
    queryKey: ["digital-services"],
    queryFn: fetchDigitalServices,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};
