import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, SquadResponse } from '@/types/footballApi';

export const useSquad = (teamId: number | null) => {
  return useQuery({
    queryKey: ['squad', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      
      console.log('👥 Fetching squad...', { teamId });
      const response: FootballApiResponse<SquadResponse> = await callFootballApi('/players/squads', {
        team: teamId.toString()
      });
      
      return response.response[0] || null;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 60 * 24, // 24h cache
    retry: 2,
  });
};
