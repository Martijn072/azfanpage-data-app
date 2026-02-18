
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse } from '@/types/footballApi';
import { useSeason } from '@/contexts/SeasonContext';

interface TeamStatistics {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  form: string;
  fixtures: {
    played: { home: number; away: number; total: number };
    wins: { home: number; away: number; total: number };
    draws: { home: number; away: number; total: number };
    loses: { home: number; away: number; total: number };
  };
  goals: {
    for: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } };
    against: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } };
  };
  biggest: {
    streak: { wins: number; draws: number; loses: number };
    wins: { home: string; away: string };
    loses: { home: string; away: string };
    goals: { for: { home: number; away: number }; against: { home: number; away: number } };
  };
  clean_sheet: { home: number; away: number; total: number };
  failed_to_score: { home: number; away: number; total: number };
}

export const useTeamStatistics = (teamId: number) => {
  const { season } = useSeason();
  
  return useQuery({
    queryKey: ['team-statistics', teamId, season],
    queryFn: async () => {
      console.log(`📊 Fetching team statistics for team ${teamId} in season ${season}...`);
      const response = await callFootballApi('/teams/statistics', {
        league: '88',
        season: season,
        team: teamId.toString()
      });
      
      console.log('📊 Team Statistics API Response:', response);
      const data = response.response;
      if (Array.isArray(data)) return data[0] || null;
      return data || null;
    },
    staleTime: 1000 * 60 * 60,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!teamId,
  });
};
