import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export const usePollQuery = () => {
  return useQuery({
    queryKey: ["poll"],
    queryFn: async () => {
      const { data } = await api.get(`/api/poll`);
      return data;
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
