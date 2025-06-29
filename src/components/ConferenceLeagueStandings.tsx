
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['conference-league-standings'],
    queryFn: async () => {
      console.log('🏆 Fetching Conference League standings...');
      const response: FootballApiResponse<{ league: { standings: Standing[][] } }> = await callFootballApi('/standings', {
        league: '848', // Conference League ID
        season: '2024'
      });
      
      console.log('📊 Conference League Standings Response:', response);
      return response.response[0]?.league.standings || [];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-az-black dark:text-white">Conference League Stand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300 mb-4">
              Fout bij het laden van de Conference League stand
            </p>
            <button 
              onClick={() => refetch()}
              className="btn-primary"
            >
              Opnieuw proberen
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-az-black dark:text-white">Conference League Stand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Flatten all groups for display
  const allStandings = data?.flat() || [];
  const azStandings = allStandings.filter(standing => 
    standing.team.name.toLowerCase().includes('az') && 
    standing.team.name.toLowerCase().includes('alkmaar')
  );

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-az-black dark:text-white">Conference League Stand</CardTitle>
      </CardHeader>
      <CardContent>
        {allStandings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300">
              Geen Conference League data beschikbaar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center w-12">W</TableHead>
                  <TableHead className="text-center w-12">D</TableHead>
                  <TableHead className="text-center w-12">L</TableHead>
                  <TableHead className="text-center w-16">Doelpunten</TableHead>
                  <TableHead className="text-center w-12">Ptn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allStandings.map((standing) => {
                  const isAZ = standing.team.name.toLowerCase().includes('az') && 
                             standing.team.name.toLowerCase().includes('alkmaar');
                  
                  return (
                    <TableRow 
                      key={`${standing.group}-${standing.team.id}`}
                      className={isAZ ? 'border-l-4 border-l-az-red' : ''}
                    >
                      <TableCell className="font-medium">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={standing.team.logo} 
                            alt={standing.team.name}
                            className="w-6 h-6 object-contain"
                          />
                          <span className={`font-medium ${isAZ ? 'text-az-red font-bold' : 'text-az-black dark:text-white'}`}>
                            {standing.team.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.all.win}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.all.draw}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.all.lose}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={isAZ ? 'text-az-red font-bold' : ''}>
                          {standing.all.goals.for}-{standing.all.goals.against}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${isAZ ? 'text-az-red' : ''}`}>
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
      </CardContent>
    </Card>
  );
};
