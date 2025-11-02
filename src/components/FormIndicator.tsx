import { useAZTeamId } from '@/hooks/useFootballApi';
import { useTeamFixtures } from '@/hooks/useTeamFixtures';
import { Skeleton } from "@/components/ui/skeleton";

export const FormIndicator = () => {
  const { data: teamId, isLoading: teamLoading } = useAZTeamId();
  const { data: fixtures, isLoading: fixturesLoading } = useTeamFixtures(teamId || 0, 5);

  const isLoading = teamLoading || fixturesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vorm:</span>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-6 h-6 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!fixtures || fixtures.length === 0) return null;

  // Only show completed matches
  const completedMatches = fixtures
    .filter(f => f.fixture.status.short === 'FT')
    .slice(0, 5)
    .reverse(); // Show oldest to newest (left to right)

  if (completedMatches.length === 0) return null;

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vorm:</span>
      <div className="flex gap-1">
        {completedMatches.map((match, index) => {
          const isAZHome = match.teams.home.id === teamId;
          const azScore = isAZHome ? match.goals?.home || 0 : match.goals?.away || 0;
          const opponentScore = isAZHome ? match.goals?.away || 0 : match.goals?.home || 0;
          
          const result = azScore > opponentScore ? 'W' : azScore < opponentScore ? 'V' : 'G';
          const bgColor = result === 'W' ? 'bg-green-500' : result === 'V' ? 'bg-red-500' : 'bg-gray-400';
          const textColor = 'text-white';
          
          return (
            <div
              key={match.fixture.id}
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${bgColor} ${textColor} transition-transform hover:scale-110`}
              title={`${match.teams.home.name} ${match.goals?.home}-${match.goals?.away} ${match.teams.away.name}`}
            >
              {result}
            </div>
          );
        })}
      </div>
    </div>
  );
};
