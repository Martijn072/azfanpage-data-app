import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, PlayerStatisticsResponse } from '@/types/footballApi';
import { useSeason } from '@/contexts/SeasonContext';

export const usePlayerStatistics = (playerId: number | null, seasonOverride?: string) => {
  const { season: contextSeason } = useSeason();
  const season = seasonOverride || contextSeason;

  return useQuery({
    queryKey: ['player-statistics', playerId, season],
    queryFn: async () => {
      if (!playerId) return null;

      console.log('⚽ Fetching player statistics...', { playerId, season });
      const response: FootballApiResponse<PlayerStatisticsResponse> = await callFootballApi('/players', {
        id: playerId.toString(),
        season: season,
      });

      return response.response[0] || null;
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });
};
