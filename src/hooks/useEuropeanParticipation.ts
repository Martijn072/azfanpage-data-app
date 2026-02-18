
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Fixture } from '@/types/footballApi';
import { useSeason } from '@/contexts/SeasonContext';

interface EuropeanParticipation {
  active: boolean;
  competition: string | null;
  competitionName: string | null;
  fixtures: Fixture[];
  status: 'kwalificatie' | 'poulefase' | 'knock-out' | 'niet-actief';
}

export const useEuropeanParticipation = (teamId: number | null) => {
  const { season } = useSeason();

  return useQuery({
    queryKey: ['european-participation', teamId, season],
    queryFn: async (): Promise<EuropeanParticipation> => {
      if (!teamId) {
        return { active: false, competition: null, competitionName: null, fixtures: [], status: 'niet-actief' };
      }
      
      console.log('🏆 Checking AZ European participation for season:', season);
      
      const competitions = [
        { id: '848', name: 'Conference League' },
        { id: '3', name: 'Europa League' },
        { id: '2', name: 'Champions League' }
      ];
      
      for (const comp of competitions) {
        try {
          const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
            team: teamId.toString(),
            league: comp.id,
            season: season
          });
          
          if (response.response && response.response.length > 0) {
            const fixtures = response.response;
            
            let status: 'kwalificatie' | 'poulefase' | 'knock-out' | 'niet-actief' = 'niet-actief';
            
            const hasQualification = fixtures.some(f => {
              const round = f.league.round.toLowerCase();
              return round.includes('qualification') || round.includes('qualifying') || round.includes('kwalificatie') || round.includes('voorronde') || round.includes('preliminary');
            });
            
            const hasGroupStage = fixtures.some(f => {
              const round = f.league.round.toLowerCase();
              return round.includes('group') || round.includes('matchday') || round.includes('poulefase') || round.includes('poule') || round.includes('league stage') || round.includes('league phase');
            });
            
            const hasKnockout = fixtures.some(f => {
              const round = f.league.round.toLowerCase();
              return round.includes('final') || round.includes('semi') || round.includes('quarter') || round.includes('round of');
            });
            
            if (hasKnockout) status = 'knock-out';
            else if (hasGroupStage) status = 'poulefase';
            else if (hasQualification) status = 'kwalificatie';
            
            return {
              active: true,
              competition: comp.id,
              competitionName: comp.name,
              fixtures,
              status
            };
          }
        } catch (error) {
          console.error(`❌ Error checking ${comp.name}:`, error);
        }
      }
      
      return { active: false, competition: null, competitionName: null, fixtures: [], status: 'niet-actief' };
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 15,
    retry: 2,
  });
};
