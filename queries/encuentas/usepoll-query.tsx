import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export const usePollQuery = () => {
  return useQuery({
    queryKey: ["poll"],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/poll`);
        return data;
      } catch (error: any) {
        // Si es un 404, significa que no hay encuesta activa (ya respondió)
        if (error.response?.status === 404) {
          return { message: "No active poll found." };
        }
        // Para otros errores, lanzar el error normalmente
        throw error;
      }
    },
  });
};

export const useVoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (choiceId: string) => {
      await api.post(`/api/poll/vote`, { choice_id: choiceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll"] });
    },
  });
};
