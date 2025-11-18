import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "@/services/games/get-campaigns";
import { fetchCampaign } from "@/services/games/get-campaign";
import { fetchGameDetails } from "@/services/games/get-game-details";
import { fetchRanking } from "@/services/games/get-ranking";
import {
  CAMPAIGNS_QUERY_KEY,
  GAME_DETAILS_QUERY_KEY,
  SINGLE_CAMPAIGN_KEY,
  RANKING_QUERY_KEY,
} from "@/constants/query-keys";

export const useCampaigns = () => {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY],
    queryFn: () => fetchCampaigns(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

export const useCampaign = (campaignId: string | null) => {
  return useQuery({
    queryKey: [SINGLE_CAMPAIGN_KEY, campaignId],
    queryFn: () => fetchCampaign(campaignId!),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!campaignId,
  });
};

export const useGameDetails = (gameUrl: string | null) => {
  return useQuery({
    queryKey: [GAME_DETAILS_QUERY_KEY, gameUrl],
    queryFn: () => fetchGameDetails(gameUrl!),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!gameUrl,
  });
};

export const useRanking = () => {
  return useQuery({
    queryKey: [RANKING_QUERY_KEY],
    queryFn: () => fetchRanking(),
    staleTime: 2 * 60 * 1000, // 2 minutos (más frecuente que campañas)
    retry: 2,
  });
};

