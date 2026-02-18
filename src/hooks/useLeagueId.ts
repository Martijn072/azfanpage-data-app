
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse } from '@/types/footballApi';
import { useSeason } from '@/contexts/SeasonContext';

interface League {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
  }>;
}

export const useLeagueIdByName = (country: string, leagueName: string) => {
  const { season } = useSeason();
  
  return useQuery({
    queryKey: ['league-id', country, leagueName, season],
    queryFn: async () => {
      console.log(`🔍 Searching for league: "${leagueName}" in ${country} for season ${season}...`);
      
      const response: FootballApiResponse<League> = await callFootballApi('/leagues', {
        country: country,
        season: season
      });
      
      console.log('📊 Leagues API Response:', response);
      
      const leaguesInCountry = (response.response || []).filter(item => 
        item?.country?.name?.toLowerCase() === country.toLowerCase()
      );

      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
      const targets = ['eerstedivisie', 'keukenkampioendivisie'];

      const league = leaguesInCountry.find(item => {
        const name = normalize(item.name);
        return targets.some(t => name.includes(t));
      });
      
      let leagueId = league ? league.id : null;
      let foundName = league ? league.name : null;

      if (!leagueId && country.toLowerCase() === 'netherlands') {
        console.warn('⚠️ Eerste Divisie not found via API, falling back to static ID 89');
        leagueId = 89;
        foundName = 'Keuken Kampioen Divisie';
      }
      
      console.log(`🆔 League found: "${foundName}" with ID: ${leagueId}`);
      
      return { id: leagueId, name: foundName };
    },
    staleTime: 1000 * 60 * 60 * 24,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
