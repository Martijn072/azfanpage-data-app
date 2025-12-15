import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEuropeanParticipation } from "@/hooks/useEuropeanParticipation";
import { useAZTeamId } from "@/hooks/useFootballApi";
import { getCurrentActiveSeason } from '@/utils/seasonUtils';

interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

interface FootballApiResponse<T> {
  response: T[];
}

const callFootballApi = async (endpoint: string, params: Record<string, string> = {}) => {
  const { data, error } = await supabase.functions.invoke('football-api', {
    body: { endpoint, params }
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error || 'API call failed');
  
  return data;
};

export const ConferenceLeagueStandings = () => {
  const { data: teamId } = useAZTeamId();
  const { data: participation } = useEuropeanParticipation(teamId);
  const seasonInfo = getCurrentActiveSeason();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['conference-league-standings', seasonInfo.currentSeason],
    queryFn: async () => {
      console.log('🏆 Fetching Conference League standings...');
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: '848', // Conference League ID
        season: seasonInfo.currentSeason
      });
      
      console.log('📊 Conference League Standings Response:', response);
      return response.response[0]?.league.standings || [];
    },
    enabled: participation?.active && participation?.competition === '848' && (participation?.status === 'poulefase' || participation?.status === 'knock-out'),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Don't show anything if AZ is not active in this competition
  if (!participation?.active || participation?.competition !== '848') {
    return null;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Fout bij het laden van de Conference League stand
        </p>
        <button 
          onClick={() => refetch()}
          className="btn-primary"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // Flatten all groups for display
  const allStandings = data?.flat() || [];

  return (
    <div>
      {allStandings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Geen Conference League poulefase data beschikbaar
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50 border-b border-border">
                <TableHead className="w-8 sm:w-12 text-foreground font-semibold">#</TableHead>
                <TableHead className="text-foreground font-semibold">Team</TableHead>
                <TableHead className="text-center w-10 sm:w-12 text-foreground font-semibold">Wed</TableHead>
                <TableHead className="hidden sm:table-cell text-center w-12 text-foreground font-semibold">W</TableHead>
                <TableHead className="hidden sm:table-cell text-center w-12 text-foreground font-semibold">G</TableHead>
                <TableHead className="hidden sm:table-cell text-center w-12 text-foreground font-semibold">V</TableHead>
                <TableHead className="text-center w-12 sm:w-16 text-foreground font-semibold">
                  <span className="hidden sm:inline">Doelpunten</span>
                  <span className="sm:hidden">+/-</span>
                </TableHead>
                <TableHead className="text-center w-10 sm:w-12 text-foreground font-semibold">Ptn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStandings.map((standing) => {
                const isAZ = standing.team.name.toLowerCase().includes('az') && 
                           standing.team.name.toLowerCase().includes('alkmaar');
                
                const goalDiff = standing.all.goals.for - standing.all.goals.against;
                const goalDiffDisplay = goalDiff > 0 ? `+${goalDiff}` : `${goalDiff}`;
                
                return (
                  <TableRow 
                    key={`${standing.group}-${standing.team.id}`}
                    className={isAZ ? 'bg-az-red/10 border-b border-az-red/20 hover:bg-az-red/15' : 'hover:bg-muted/50 border-b border-border'}
                  >
                    <TableCell className="font-medium px-2 sm:px-4">
                      <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.rank}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img 
                          src={standing.team.logo} 
                          alt={standing.team.name}
                          className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                        />
                        <span className={`hidden sm:block font-medium ${isAZ ? 'text-az-red font-bold' : 'text-foreground'}`}>
                          {standing.team.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-2 sm:px-4">
                      <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.all.played}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.all.win}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.all.draw}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        {standing.all.lose}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-2 sm:px-4">
                      <span className={isAZ ? 'text-az-red font-bold' : 'text-foreground'}>
                        <span className="sm:hidden">{goalDiffDisplay}</span>
                        <span className="hidden sm:inline">{standing.all.goals.for}-{standing.all.goals.against}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-2 sm:px-4">
                      <span className={`font-bold ${isAZ ? 'text-az-red' : 'text-foreground'}`}>
                        {standing.points}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
