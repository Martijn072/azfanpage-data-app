
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Fixture } from '@/types/footballApi';
import { useSeason } from '@/contexts/SeasonContext';

export const useTeamFixtures = (teamId: number, last?: number) => {
  const { season } = useSeason();
  
  return useQuery({
    queryKey: ['team-fixtures', teamId, season, last],
    queryFn: async () => {
      console.log(`🏈 Fetching team fixtures for team ${teamId} in season ${season}...`);
      
      const params: Record<string, string> = {
        team: teamId.toString(),
        season: season
      };
      
      if (last) {
        params.last = last.toString();
      }
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('🏈 Team Fixtures API Response:', response);
      return response.response || [];
    },
    staleTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!teamId,
  });
};

export const useTeamNextFixtures = (teamId: number, next?: number) => {
  const { season } = useSeason();
  
  return useQuery({
    queryKey: ['team-next-fixtures', teamId, season, next],
    queryFn: async () => {
      console.log(`🔮 Fetching upcoming team fixtures for team ${teamId} in season ${season}...`);
      
      const params: Record<string, string> = {
        team: teamId.toString(),
        season: season
      };
      
      if (next) {
        params.next = next.toString();
      }
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', params);
      
      console.log('🔮 Team Next Fixtures API Response:', response);
      return response.response || [];
    },
    staleTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!teamId,
  });
};
