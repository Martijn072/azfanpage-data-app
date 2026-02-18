import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, TeamStatistics } from '@/types/footballApi';

export const useFixtureStatistics = (fixtureId: string | null) => {
  return useQuery({
    queryKey: ['fixture-statistics', fixtureId],
    queryFn: async () => {
      if (!fixtureId) return [];
      
      console.log('📊 Fetching fixture statistics...', { fixtureId });
      const response: FootballApiResponse<TeamStatistics> = await callFootballApi('/fixtures/statistics', {
        fixture: fixtureId
      });
      
      console.log('📊 Fixture Statistics API Response:', response);
      return response.response || [];
    },
    enabled: !!fixtureId,
    staleTime: 1000 * 60 * 60 * 24, // 24h cache - stats don't change after match
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
