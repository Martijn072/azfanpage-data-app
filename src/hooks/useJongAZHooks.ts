
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse, Team, Fixture, Standing } from '@/types/footballApi';
import { useSeason } from '@/contexts/SeasonContext';

const JONG_AZ_TEAM_ID = 418;
const EERSTE_DIVISIE_ID = 89;

export const useJongAZTeamId = () => {
  return useQuery({
    queryKey: ['jong-az-team-id'],
    queryFn: async () => {
      console.log('🆔 Using stable Jong AZ Team ID:', JONG_AZ_TEAM_ID);
      return JONG_AZ_TEAM_ID;
    },
    staleTime: Infinity,
  });
};

export const useJongAZFixtures = (teamId: number | null, last: number = 5) => {
  const { season } = useSeason();
  
  return useQuery({
    queryKey: ['jong-az-fixtures', teamId, last, season, EERSTE_DIVISIE_ID],
    queryFn: async () => {
      if (!teamId) return [];
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        last: last.toString(),
        season: season,
        league: EERSTE_DIVISIE_ID.toString(),
        timezone: 'Europe/Amsterdam'
      });
      
      return response.response || [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 15,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useJongAZNextFixtures = (teamId: number | null, next: number = 3) => {
  const { season } = useSeason();
  
  return useQuery({
    queryKey: ['jong-az-next-fixtures', teamId, next, season, EERSTE_DIVISIE_ID],
    queryFn: async () => {
      if (!teamId) return [];
      
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        next: next.toString(),
        season: season,
        league: EERSTE_DIVISIE_ID.toString(),
        timezone: 'Europe/Amsterdam'
      });
      
      return response.response || [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useJongAZStatistics = (teamId: number | null) => {
  const { season } = useSeason();
  
  return useQuery({
    queryKey: ['jong-az-statistics', teamId, season, EERSTE_DIVISIE_ID],
    queryFn: async () => {
      if (!teamId) return null;
      
      const response: FootballApiResponse<any> = await callFootballApi('/teams/statistics', {
        league: EERSTE_DIVISIE_ID.toString(),
        season: season,
        team: teamId.toString()
      });
      
      return response.response[0] || null;
    },
    staleTime: 1000 * 60 * 60,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!teamId,
  });
};

export const useEersteDivisieStandings = () => {
  const { season } = useSeason();
  
  return useQuery({
    queryKey: ['eerste-divisie-standings', season, EERSTE_DIVISIE_ID],
    queryFn: async () => {
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: EERSTE_DIVISIE_ID.toString(),
        season: season
      });
      
      return response.response[0]?.league.standings[0] || [];
    },
    staleTime: 1000 * 60 * 60,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
