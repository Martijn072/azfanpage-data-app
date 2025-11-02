import { useAZTeamId } from '@/hooks/useFootballApi';
import { useTeamFixtures } from '@/hooks/useTeamFixtures';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export const LastMatchWidget = () => {
  const { data: teamId, isLoading: teamLoading } = useAZTeamId();
  const { data: fixtures, isLoading: fixturesLoading } = useTeamFixtures(teamId || 0, 1);
  const navigate = useNavigate();

  const isLoading = teamLoading || fixturesLoading;

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const lastMatch = fixtures?.[0];
  
  if (!lastMatch || lastMatch.fixture.status.short === 'NS') {
    return null; // No completed match to show
  }

  const isAZHome = lastMatch.teams.home.id === teamId;
  const azTeam = isAZHome ? lastMatch.teams.home : lastMatch.teams.away;
  const opponentTeam = isAZHome ? lastMatch.teams.away : lastMatch.teams.home;
  
  const azScore = isAZHome ? lastMatch.goals?.home || 0 : lastMatch.goals?.away || 0;
  const opponentScore = isAZHome ? lastMatch.goals?.away || 0 : lastMatch.goals?.home || 0;
  
  const result = azScore > opponentScore ? 'W' : azScore < opponentScore ? 'V' : 'G';
  const resultColor = result === 'W' ? 'text-green-600' : result === 'V' ? 'text-red-600' : 'text-gray-600';
  const resultBg = result === 'W' ? 'bg-green-50 dark:bg-green-900/20' : result === 'V' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700';

  const matchDate = new Date(lastMatch.fixture.date);
  const formattedDate = matchDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });

  return (
    <Card 
      onClick={() => navigate(`/wedstrijd/${lastMatch.fixture.id}`)}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in transform hover:scale-[1.01]"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-az-black dark:text-white flex items-center justify-between">
          <span>Laatste wedstrijd</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${resultBg} ${resultColor}`}>
            {result === 'W' ? 'Winst' : result === 'V' ? 'Verlies' : 'Gelijk'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <img 
              src={azTeam.logo} 
              alt={azTeam.name}
              className="w-8 h-8 object-contain"
            />
            <span className="text-sm font-medium text-az-red">AZ</span>
          </div>
          
          <div className="text-center px-4">
            <div className="text-2xl font-bold text-az-black dark:text-white">
              {azScore} - {opponentScore}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-sm font-medium text-az-black dark:text-gray-100 text-right">
              {opponentTeam.name}
            </span>
            <img 
              src={opponentTeam.logo} 
              alt={opponentTeam.name}
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{lastMatch.league.name}</span>
        </div>
      </CardContent>
    </Card>
  );
};
