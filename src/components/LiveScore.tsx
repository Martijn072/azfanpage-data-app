
import { useAZTeamId, useLiveAZFixture, useNextAZFixture } from "@/hooks/useFootballApi";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Clock, Calendar, Wifi, WifiOff } from "lucide-react";

export const LiveScore = () => {
  const { data: teamId, isLoading: teamLoading, error: teamError } = useAZTeamId();
  const { data: liveFixture, isLoading: liveLoading, error: liveError } = useLiveAZFixture(teamId);
  const { data: nextFixture, isLoading: nextLoading, error: nextError } = useNextAZFixture(teamId);

  // Log API status for debugging
  console.log('🏈 LiveScore API Status:', {
    teamId,
    teamLoading,
    teamError: teamError?.message,
    liveFixture,
    nextFixture,
    hasErrors: !!(teamError || liveError || nextError)
  });

  // Show loading state
  if (teamLoading || liveLoading || nextLoading) {
    return (
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white mx-4 mt-4 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
          <span>Laden van wedstrijdgegevens...</span>
        </div>
      </div>
    );
  }

  // If there's a live match, show that
  if (liveFixture) {
    const isAZHome = liveFixture.teams.home.name.toLowerCase().includes('az');
    const azTeam = isAZHome ? liveFixture.teams.home : liveFixture.teams.away;
    const opponentTeam = isAZHome ? liveFixture.teams.away : liveFixture.teams.home;
    const azGoals = isAZHome ? liveFixture.goals.home : liveFixture.goals.away;
    const opponentGoals = isAZHome ? liveFixture.goals.away : liveFixture.goals.home;

    return (
      <div className="bg-gradient-to-r from-az-red to-red-700 text-white mx-4 mt-4 rounded-xl p-4 shadow-lg animate-pulse">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-az-red font-bold text-xs">AZ</span>
              </div>
              <span className="font-semibold">{azTeam.name}</span>
            </div>
          </div>
          
          <div className="text-center px-6">
            <div className="text-2xl font-bold mb-1">
              {azGoals !== null ? azGoals : '-'} - {opponentGoals !== null ? opponentGoals : '-'}
            </div>
            <div className="text-xs opacity-90">
              {liveFixture.fixture.status.elapsed}' ⚽ LIVE
            </div>
          </div>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-semibold">{opponentTeam.name}</span>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <img 
                  src={opponentTeam.logo} 
                  alt={opponentTeam.name}
                  className="w-6 h-6 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-xs opacity-90">
            <div className="flex items-center gap-1">
              <span className="animate-pulse">🔴</span>
              <span>LIVE</span>
            </div>
            <span>{liveFixture.league.name}</span>
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              <span>API Connected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's a next match, show countdown
  if (nextFixture) {
    const matchDate = new Date(nextFixture.fixture.date);
    const isAZHome = nextFixture.teams.home.name.toLowerCase().includes('az');
    const azTeam = isAZHome ? nextFixture.teams.home : nextFixture.teams.away;
    const opponentTeam = isAZHome ? nextFixture.teams.away : nextFixture.teams.home;

    return (
      <div className="bg-gradient-to-r from-az-red to-red-700 text-white mx-4 mt-4 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-az-red font-bold text-xs">AZ</span>
              </div>
              <span className="font-semibold">{azTeam.name}</span>
            </div>
          </div>
          
          <div className="text-center px-6">
            <div className="text-lg font-bold mb-1">VS</div>
            <div className="text-xs opacity-90 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {format(matchDate, 'HH:mm', { locale: nl })}
            </div>
          </div>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-semibold">{opponentTeam.name}</span>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <img 
                  src={opponentTeam.logo} 
                  alt={opponentTeam.name}
                  className="w-6 h-6 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-xs opacity-90">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(matchDate, 'dd MMM', { locale: nl })}</span>
            </div>
            <span>{nextFixture.league.name}</span>
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              <span>API Connected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show API error state if there are errors
  if (teamError || liveError || nextError) {
    return (
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white mx-4 mt-4 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold text-xs">AZ</span>
              </div>
              <span className="font-semibold">AZ Alkmaar</span>
            </div>
          </div>
          
          <div className="text-center px-6">
            <div className="text-lg font-bold mb-1">API</div>
            <div className="text-xs opacity-90">Verbinding</div>
          </div>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-semibold">Tegenstander</span>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold text-xs">?</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-xs opacity-90">
            <div className="flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              <span>API Fout</span>
            </div>
            <span>Probeer later opnieuw</span>
            <span className="text-xs">Fallback modus</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to static data if no API data is available
  return (
    <div className="bg-gradient-to-r from-az-red to-red-700 text-white mx-4 mt-4 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-az-red font-bold text-xs">AZ</span>
            </div>
            <span className="font-semibold">AZ Alkmaar</span>
          </div>
        </div>
        
        <div className="text-center px-6">
          <div className="text-2xl font-bold mb-1">2 - 1</div>
          <div className="text-xs opacity-90">67' ⚽ LIVE</div>
        </div>
        
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-semibold">PSV</span>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-xs">PSV</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/20">
        <div className="flex justify-between items-center text-xs opacity-90">
          <span>⚪🔴 Demo Data</span>
          <span>AFAS Stadion • Eredivisie</span>
          <div className="flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
