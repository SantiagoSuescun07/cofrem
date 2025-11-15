import api from "@/lib/axios";
import { RankingResponse } from "@/types/games";

export const fetchRanking = async (): Promise<RankingResponse | null> => {
  try {
    const response = await api.get("/api/ranking");
    return response.data;
  } catch (error) {
    console.error("Error fetching ranking:", error);
    return null;
  }
};

