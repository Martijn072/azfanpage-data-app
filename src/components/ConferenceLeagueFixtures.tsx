import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin } from "lucide-react";

interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
    };
    venue: {
      name: string;
      city: string;
    };
  };
  league: {
    name: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
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

interface ConferenceLeagueFixturesProps {
  teamId: number | null;
  isLoadingTeamId: boolean;
}

export const ConferenceLeagueFixtures = ({ teamId, isLoadingTeamId }: ConferenceLeagueFixturesProps) => {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['conference-league-fixtures', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      console.log('🏆 Fetching Conference League fixtures for AZ...');
      const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
        team: teamId.toString(),
        league: '848', // Conference League ID
        season: '2024'
      });
      
      console.log('📊 Conference League Fixtures Response:', response);
      return response.response || [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NS': return 'Te spelen';
      case 'FT': return 'Afgelopen';
      case 'LIVE': return 'Live';
      case '1H': return '1e helft';
      case 'HT': return 'Rust';
      case '2H': return '2e helft';
      default: return status;
    }
  };

  const handleFixtureClick = (fixtureId: number) => {
    navigate(`/wedstrijd/${fixtureId}`);
  };

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-az-black dark:text-white">Conference League Wedstrijden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300 mb-4">
              Fout bij het laden van Conference League wedstrijden
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

  if (isLoading || isLoadingTeamId) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-az-black dark:text-white">Conference League Wedstrijden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const fixtures = data || [];

  return (
    <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="bg-white dark:bg-gray-800">
        <CardTitle className="text-az-black dark:text-white">Conference League Wedstrijden</CardTitle>
      </CardHeader>
      <CardContent className="bg-white dark:bg-gray-800">
        {fixtures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300">
              Geen Conference League wedstrijden gevonden
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {fixtures.map((fixture) => (
              <div 
                key={fixture.fixture.id}
                onClick={() => handleFixtureClick(fixture.fixture.id)}
                className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-premium-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-premium-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formatDate(fixture.fixture.date)}</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className="text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                  >
                    {getStatusText(fixture.fixture.status.short)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <img 
                        src={fixture.teams.home.logo} 
                        alt={fixture.teams.home.name}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="font-semibold text-az-black dark:text-white">
                        {fixture.teams.home.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-6">
                    {fixture.goals.home !== null && fixture.goals.away !== null ? (
                      <div className="text-xl font-bold text-az-red">
                        {fixture.goals.home} - {fixture.goals.away}
                      </div>
                    ) : (
                      <div className="text-premium-gray-400 dark:text-gray-500 font-medium">
                        vs
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-az-black dark:text-white">
                        {fixture.teams.away.name}
                      </span>
                      <img 
                        src={fixture.teams.away.logo} 
                        alt={fixture.teams.away.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-sm">
                  <div className="flex items-center gap-2 text-premium-gray-600 dark:text-gray-300">
                    <MapPin className="w-3 h-3" />
                    <span>{fixture.fixture.venue.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-premium-gray-50 dark:bg-gray-700 border-premium-gray-200 dark:border-gray-600 text-premium-gray-700 dark:text-gray-300"
                  >
                    {fixture.league.round}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
