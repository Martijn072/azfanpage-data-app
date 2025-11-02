import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import { callFootballApi } from '@/utils/footballApiClient';
import { getCurrentActiveSeason } from '@/utils/seasonUtils';
import { Trophy } from 'lucide-react';

interface TopScorer {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    goals: {
      total: number;
    };
    games: {
      appearences: number;
    };
  }>;
}

const useTopScorers = () => {
  const seasonInfo = getCurrentActiveSeason();
  
  return useQuery({
    queryKey: ['top-scorers', seasonInfo.currentSeason],
    queryFn: async () => {
      console.log(`🎯 Fetching top scorers for Eredivisie season ${seasonInfo.currentSeason}...`);
      
      const response = await callFootballApi('/players/topscorers', {
        league: '88', // Eredivisie
        season: seasonInfo.currentSeason
      });
      
      console.log('🎯 Top Scorers Response:', response);
      return (response.response || []).slice(0, 5) as TopScorer[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
  });
};

export const TopScorersWidget = () => {
  const { data: topScorers, isLoading, error } = useTopScorers();

  if (error) {
    return null; // Silent fail for widget
  }

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topScorers || topScorers.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-az-black dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-az-red" />
          Topscorers Eredivisie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topScorers.map((scorer, index) => {
            const stats = scorer.statistics[0];
            const goals = stats?.goals?.total || 0;
            
            return (
              <div
                key={scorer.player.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-premium-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 w-6">
                  {index + 1}
                </span>
                <img 
                  src={scorer.player.photo} 
                  alt={scorer.player.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = stats?.team?.logo || '/placeholder.svg';
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-az-black dark:text-gray-100">
                    {scorer.player.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stats?.team?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-az-red">
                    {goals}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    goals
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
