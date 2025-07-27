import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin } from "lucide-react";
import { useEuropeanParticipation } from "@/hooks/useEuropeanParticipation";
import { getCurrentActiveSeason } from '@/utils/seasonUtils';

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
  const { data: participation } = useEuropeanParticipation(teamId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['european-fixtures', teamId, participation?.competition],
    queryFn: async () => {
      if (!teamId || !participation?.competition) return [];
      
      const seasonInfo = getCurrentActiveSeason();
      const seasons = [seasonInfo.currentSeason];
      
      // If we're in early season, also check next season
      if (seasonInfo.currentSeason === '2024') {
        seasons.push('2025');
      }
      
      console.log('🏆 Fetching European fixtures for seasons:', seasons);
      
      let allFixtures: Fixture[] = [];
      
      // Try each season to get all relevant fixtures
      for (const season of seasons) {
        try {
          console.log(`📅 Fetching fixtures for season ${season}...`);
          const response: FootballApiResponse<Fixture> = await callFootballApi('/fixtures', {
            team: teamId.toString(),
            league: participation.competition,
            season: season
          });
          
          if (response.response && response.response.length > 0) {
            console.log(`✅ Found ${response.response.length} fixtures for season ${season}`);
            allFixtures.push(...response.response);
          }
        } catch (error) {
          console.error(`❌ Error fetching fixtures for season ${season}:`, error);
        }
      }
      
      // Sort fixtures by date (newest first for better UX)
      allFixtures.sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());
      
      console.log('📊 Total European fixtures found:', allFixtures.length);
      return allFixtures;
    },
    enabled: !!teamId && !!participation?.competition,
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
      <div className="text-center py-8">
        <p className="text-premium-gray-600 dark:text-gray-300 mb-4">
          Fout bij het laden van Europese wedstrijden
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

  if (isLoading || isLoadingTeamId) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!participation?.active) {
    return (
      <div className="text-center py-8">
        <p className="text-premium-gray-600 dark:text-gray-300">
          AZ neemt dit seizoen niet deel aan Europese competities
        </p>
        <p className="text-sm text-premium-gray-500 dark:text-gray-400 mt-2">
          Volg de Eredivisie stand voor kwalificatieplaatsen voor volgend seizoen
        </p>
      </div>
    );
  }

  const fixtures = data || [];
  
  if (fixtures.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-premium-gray-600 dark:text-gray-300">
          Geen Europese wedstrijden gevonden voor AZ
        </p>
      </div>
    );
  }

  // Separate upcoming and played fixtures
  const now = new Date();
  const upcomingFixtures = fixtures.filter(f => new Date(f.fixture.date) > now);
  const playedFixtures = fixtures.filter(f => new Date(f.fixture.date) <= now);

  return (
    <div>
      {/* Aankomende wedstrijden */}
      {upcomingFixtures.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-az-black dark:text-white mb-3">
            Aankomende wedstrijden
          </h3>
          <div className="space-y-3">
            {upcomingFixtures.map((fixture) => (
              <div 
                key={fixture.fixture.id}
                onClick={() => handleFixtureClick(fixture.fixture.id)}
                className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-premium-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-premium-gray-600 dark:text-gray-300">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium">{formatDate(fixture.fixture.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-premium-gray-600 dark:text-gray-300">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">
                      {fixture.fixture.venue?.name || 'Onbekend'}
                    </span>
                  </div>
                </div>

                {/* Mobile-first layout: centered logos with score */}
                <div className="flex items-center justify-center gap-4 sm:gap-8">
                  {/* Home team */}
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={fixture.teams.home.logo} 
                      alt={fixture.teams.home.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                    />
                    {/* Show team name only on larger screens */}
                    <span className="hidden sm:block font-semibold text-az-black dark:text-white text-center text-sm">
                      {fixture.teams.home.name === 'AZ Alkmaar' ? 'AZ' : fixture.teams.home.name}
                    </span>
                  </div>

                  {/* Score or VS */}
                  <div className="flex flex-col items-center justify-center">
                    {fixture.goals.home !== null && fixture.goals.away !== null ? (
                      <div className="text-2xl sm:text-3xl font-bold text-az-red">
                        {fixture.goals.home} - {fixture.goals.away}
                      </div>
                    ) : (
                      <div className="text-premium-gray-400 dark:text-gray-500 font-medium text-lg">
                        vs
                      </div>
                    )}
                  </div>

                  {/* Away team */}
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={fixture.teams.away.logo} 
                      alt={fixture.teams.away.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                    />
                    {/* Show team name only on larger screens */}
                    <span className="hidden sm:block font-semibold text-az-black dark:text-white text-center text-sm">
                      {fixture.teams.away.name === 'AZ Alkmaar' ? 'AZ' : fixture.teams.away.name}
                    </span>
                  </div>
                </div>

                {/* Competition badge at bottom */}
                <div className="flex justify-center mt-3">
                  <Badge 
                    variant="outline"
                    className="text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
                  >
                    {participation?.competitionName}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gespeelde wedstrijden */}
      {playedFixtures.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-az-black dark:text-white mb-3">
            Gespeelde wedstrijden
          </h3>
          <div className="space-y-3">
            {playedFixtures.slice(0, 5).map((fixture) => (
              <div 
                key={fixture.fixture.id}
                onClick={() => handleFixtureClick(fixture.fixture.id)}
                className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-premium-gray-50 dark:hover:bg-gray-700 opacity-75"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-premium-gray-600 dark:text-gray-300">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium">{formatDate(fixture.fixture.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-premium-gray-600 dark:text-gray-300">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">
                      {fixture.fixture.venue?.name || 'Onbekend'}
                    </span>
                  </div>
                </div>

                {/* Mobile-first layout: centered logos with score */}
                <div className="flex items-center justify-center gap-4 sm:gap-8">
                  {/* Home team */}
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={fixture.teams.home.logo} 
                      alt={fixture.teams.home.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                    />
                    {/* Show team name only on larger screens */}
                    <span className="hidden sm:block font-semibold text-az-black dark:text-white text-center text-sm">
                      {fixture.teams.home.name === 'AZ Alkmaar' ? 'AZ' : fixture.teams.home.name}
                    </span>
                  </div>

                  {/* Score or VS */}
                  <div className="flex flex-col items-center justify-center">
                    {fixture.goals.home !== null && fixture.goals.away !== null ? (
                      <div className="text-2xl sm:text-3xl font-bold text-az-red">
                        {fixture.goals.home} - {fixture.goals.away}
                      </div>
                    ) : (
                      <div className="text-premium-gray-400 dark:text-gray-500 font-medium text-lg">
                        vs
                      </div>
                    )}
                  </div>

                  {/* Away team */}
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={fixture.teams.away.logo} 
                      alt={fixture.teams.away.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                    />
                    {/* Show team name only on larger screens */}
                    <span className="hidden sm:block font-semibold text-az-black dark:text-white text-center text-sm">
                      {fixture.teams.away.name === 'AZ Alkmaar' ? 'AZ' : fixture.teams.away.name}
                    </span>
                  </div>
                </div>

                {/* Competition badge at bottom */}
                <div className="flex justify-center mt-3">
                  <Badge 
                    variant="outline"
                    className="text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
                  >
                    {participation?.competitionName}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
