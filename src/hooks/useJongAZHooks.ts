
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Team, Fixture, Standing } from '@/types/footballApi';
import { getCurrentActiveSeason } from '@/utils/seasonUtils';

// Constants for Jong AZ - these are stable IDs
const JONG_AZ_TEAM_ID = 418;
const EERSTE_DIVISIE_ID = 89;

// Hook to find Jong AZ team ID - now returns stable ID directly
export const useJongAZTeamId = () => {
  return useQuery({
    queryKey: ['jong-az-team-id'],
    queryFn: async () => {
      console.log('🆔 Using stable Jong AZ Team ID:', JONG_AZ_TEAM_ID);
      return JONG_AZ_TEAM_ID;
    },
    staleTime: Infinity, // Never stale - it's a constant
  });
};

// Hook for Jong AZ fixtures (recent) - uses stable league ID
export const useJongAZFixtures = (teamId: number | null, last: number = 5) => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['jong-az-fixtures', teamId, last, seasonInfo.currentSeason, EERSTE_DIVISIE_ID],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No Jong AZ team ID available for fixtures');
        return [];
      }
      
      console.log('📅 Fetching Jong AZ fixtures...', { 
        teamId, 
        last, 
        leagueId: EERSTE_DIVISIE_ID
      });
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        last: last.toString(),
        season: seasonInfo.currentSeason,
        league: EERSTE_DIVISIE_ID.toString(),
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

// Hook for Jong AZ upcoming fixtures - uses stable league ID
export const useJongAZNextFixtures = (teamId: number | null, next: number = 3) => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['jong-az-next-fixtures', teamId, next, seasonInfo.currentSeason, EERSTE_DIVISIE_ID],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No Jong AZ team ID available for next fixtures');
        return [];
      }
      
      console.log('🔮 Fetching upcoming Jong AZ fixtures...', { 
        teamId, 
        next, 
        leagueId: EERSTE_DIVISIE_ID
      });
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        next: next.toString(),
        season: seasonInfo.currentSeason,
        league: EERSTE_DIVISIE_ID.toString(),
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

// Hook for Jong AZ team statistics - uses stable league ID
export const useJongAZStatistics = (teamId: number | null) => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['jong-az-statistics', teamId, seasonInfo.currentSeason, EERSTE_DIVISIE_ID],
    queryFn: async () => {
      if (!teamId) {
        console.log('⏸️ No Jong AZ team ID available for statistics');
        return null;
      }
      
      console.log(`📊 Fetching Jong AZ statistics for Eerste Divisie (ID: ${EERSTE_DIVISIE_ID}) season ${seasonInfo.currentSeason}...`);
      
      const response: FootballApiResponse<any> = await callFootballApi('/teams/statistics', {
        league: EERSTE_DIVISIE_ID.toString(),
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

// Hook for Eerste Divisie standings - uses stable league ID
export const useEersteDivisieStandings = () => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['eerste-divisie-standings', seasonInfo.currentSeason, EERSTE_DIVISIE_ID],
    queryFn: async () => {
      console.log(`🏆 Fetching Eerste Divisie standings (ID: ${EERSTE_DIVISIE_ID}) for season ${seasonInfo.currentSeason}...`);
      
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: EERSTE_DIVISIE_ID.toString(),
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
