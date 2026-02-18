
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Standing } from '@/types/footballApi';
import { useSeason } from '@/contexts/SeasonContext';

export const useEredivisieStandings = () => {
  const { season } = useSeason();
  
  return useQuery({
    queryKey: ['eredivisie-standings', season],
    queryFn: async () => {
      console.log(`🏆 Fetching Eredivisie standings for season ${season}...`);
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: '88',
        season: season
      });
      
      console.log('📊 Standings API Response:', response);
      return response.response[0]?.league.standings[0] || [];
    },
    staleTime: 1000 * 60 * 60,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
