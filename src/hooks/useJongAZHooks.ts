
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Team, Fixture, Standing } from '@/types/footballApi';
import { getCurrentActiveSeason } from '@/utils/seasonUtils';

// Hook to find Jong AZ team ID
export const useJongAZTeamId = () => {
  return useQuery({
    queryKey: ['jong-az-team-id'],
    queryFn: async () => {
      console.log('🔍 Searching for Jong AZ team ID...');
      const response: FootballApiResponse<{ team: Team }> = await callFootballApi('/teams', {
        name: 'Jong AZ',
        country: 'Netherlands'
      });
      
      console.log('📊 Jong AZ Teams API Response:', response);
      
      const jongAZTeam = response.response.find(item => 
        item.team.name.toLowerCase().includes('jong') && 
        item.team.name.toLowerCase().includes('az')
      );
      
      const teamId = jongAZTeam ? jongAZTeam.team.id : null;
      console.log('🆔 Jong AZ Team ID found:', teamId);
      
      return teamId;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for Jong AZ fixtures (recent)
export const useJongAZFixtures = (teamId: number | null, last: number = 5) => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['jong-az-fixtures', teamId, last, seasonInfo.currentSeason],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No Jong AZ team ID available for fixtures');
        return [];
      }
      
      console.log('📅 Fetching Jong AZ fixtures...', { teamId, last });
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        last: last.toString(),
        season: seasonInfo.currentSeason,
        league: '79', // Eerste Divisie league ID
        timezone: 'Europe/Amsterdam'
      });
      
      console.log('📊 Jong AZ Fixtures API Response:', response);
      return response.response || [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for Jong AZ upcoming fixtures
export const useJongAZNextFixtures = (teamId: number | null, next: number = 3) => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['jong-az-next-fixtures', teamId, next, seasonInfo.currentSeason],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No Jong AZ team ID available for next fixtures');
        return [];
      }
      
      console.log('🔮 Fetching upcoming Jong AZ fixtures...', { teamId, next });
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        next: next.toString(),
        season: seasonInfo.currentSeason,
        league: '79', // Eerste Divisie league ID
        timezone: 'Europe/Amsterdam'
      });
      
      console.log('📊 Jong AZ Next Fixtures API Response:', response);
      return response.response || [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for Jong AZ team statistics
export const useJongAZStatistics = (teamId: number | null) => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['jong-az-statistics', teamId, seasonInfo.currentSeason],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No Jong AZ team ID available for statistics');
        return null;
      }
      
      console.log(`📊 Fetching Jong AZ statistics for season ${seasonInfo.currentSeason}...`);
      const response: FootballApiResponse<any> = await callFootballApi('/teams/statistics', {
        league: '79', // Eerste Divisie league ID
        season: seasonInfo.currentSeason,
        team: teamId.toString()
      });
      
      console.log('📊 Jong AZ Statistics API Response:', response);
      return response.response[0] || null;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!teamId,
  });
};

// Hook for Eerste Divisie standings
export const useEersteDivisieStandings = () => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['eerste-divisie-standings', seasonInfo.currentSeason],
    queryFn: async () => {
      console.log(`🏆 Fetching Eerste Divisie standings for season ${seasonInfo.currentSeason}...`);
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: '79', // Eerste Divisie league ID
        season: seasonInfo.currentSeason
      });
      
      console.log('📊 Eerste Divisie Standings API Response:', response);
      return response.response[0]?.league.standings[0] || [];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
