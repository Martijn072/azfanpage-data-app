import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useEredivisieStandings } from '@/hooks/useFootballApi';

export const SmartEredivisieStand = () => {
  const { data: standings, isLoading, error } = useEredivisieStandings();

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Eredivisie Positie</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !standings) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Eredivisie Positie</h3>
        <p className="text-sm text-muted-foreground">Kon stand niet laden</p>
      </div>
    );
  }

  // Find AZ position
  const azTeam = standings.find(team => 
    team.team?.name?.toLowerCase().includes('alkmaar') || 
    team.team?.name?.toLowerCase().includes('az')
  );
  
  const azPosition = azTeam?.rank || 0;

  // Smart logic for which teams to show
  const getTeamsToShow = () => {
    if (azPosition <= 5) {
      // AZ in top 5: show top 5
      return standings.slice(0, 5);
    } else if (azPosition <= 10) {
      // AZ 6th-10th: show top 3 + AZ position + teams around AZ
      const topThree = standings.slice(0, 3);
      const azIndex = azPosition - 1;
      const azContext = standings.slice(Math.max(0, azIndex - 1), azIndex + 2);
      return [...topThree, ...azContext].filter((team, index, arr) => 
        arr.findIndex(t => t.team?.id === team.team?.id) === index
      );
    } else {
      // AZ 11th+: show top 3 + AZ environment
      const topThree = standings.slice(0, 3);
      const azIndex = azPosition - 1;
      const azContext = standings.slice(Math.max(0, azIndex - 1), azIndex + 2);
      return [...topThree, ...azContext];
    }
  };

  const teamsToShow = getTeamsToShow();
  const showEllipsis = azPosition > 5;

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Eredivisie Positie</h3>
        <Link 
          to="/eredivisie"
          className="text-az-red hover:text-az-red/80 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {teamsToShow.map((team, index) => {
          const isAZ = team.team?.name?.toLowerCase().includes('alkmaar') || 
                      team.team?.name?.toLowerCase().includes('az');
          const showEllipsisHere = showEllipsis && index === 3 && azPosition > 10;

          return (
            <div key={team.team?.id || index}>
              {showEllipsisHere && (
                <div className="text-center text-gray-400 py-1 text-xs">...</div>
              )}
              
              <div className={`flex items-center space-x-3 py-2 px-2 rounded transition-colors ${
                isAZ 
                  ? 'bg-az-red/10 dark:bg-az-red/20 border border-az-red/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}>
                <span className={`w-6 text-sm font-medium text-center ${
                  isAZ ? 'text-az-red font-bold' : 'text-muted-foreground'
                }`}>
                  {team.rank}
                </span>
                
                <div className="w-6 h-6 flex-shrink-0">
                  {team.team?.logo ? (
                    <img 
                      src={team.team.logo} 
                      alt={team.team.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                  )}
                </div>
                
                <span className={`flex-1 text-sm truncate ${
                  isAZ ? 'font-semibold text-az-red' : ''
                }`}>
                  {team.team?.name || 'Onbekend'}
                </span>
                
                <span className={`text-sm font-medium ${
                  isAZ ? 'text-az-red font-bold' : 'text-muted-foreground'
                }`}>
                  {team.points}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Link 
        to="/eredivisie"
        className="block mt-4 text-center text-sm text-az-red hover:text-az-red/80 transition-colors font-medium"
      >
        Bekijk volledige stand →
      </Link>
    </div>
  );
};