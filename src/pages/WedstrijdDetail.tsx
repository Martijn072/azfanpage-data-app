
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, MapPin, Users, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FixtureDetail {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
    venue: {
      name: string;
      city: string;
    };
    referee: string;
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
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

interface FixtureEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  type: string;
  detail: string;
  player: {
    name: string;
  };
  team: {
    id: number;
    name: string;
  };
  assist?: {
    name: string;
  };
}

interface FixtureStats {
  team: {
    id: number;
    name: string;
  };
  statistics: Array<{
    type: string;
    value: string | number;
  }>;
}

const callFootballApi = async (endpoint: string, params: Record<string, string> = {}) => {
  const { data, error } = await supabase.functions.invoke('football-api', {
    body: { endpoint, params }
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error || 'API call failed');
  
  return data;
};

const WedstrijdDetail = () => {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("programma");

  const { data: fixtureData, isLoading: fixtureLoading } = useQuery({
    queryKey: ['fixture-detail', fixtureId],
    queryFn: async () => {
      const response = await callFootballApi('/fixtures', {
        id: fixtureId!
      });
      return response.response[0] as FixtureDetail;
    },
    enabled: !!fixtureId,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['fixture-events', fixtureId],
    queryFn: async () => {
      const response = await callFootballApi('/fixtures/events', {
        fixture: fixtureId!
      });
      return response.response as FixtureEvent[];
    },
    enabled: !!fixtureId,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['fixture-statistics', fixtureId],
    queryFn: async () => {
      const response = await callFootballApi('/fixtures/statistics', {
        fixture: fixtureId!
      });
      return response.response as FixtureStats[];
    },
    enabled: !!fixtureId,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
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

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Goal': return '⚽';
      case 'Card': return '📋';
      case 'subst': return '🔄';
      case 'Var': return '📺';
      default: return '•';
    }
  };

  if (fixtureLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (!fixtureData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <div className="text-center py-8">
            <p className="text-premium-gray-600 dark:text-gray-300">
              Wedstrijd niet gevonden
            </p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Terug naar programma
            </Button>
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  const isAZHome = fixtureData.teams.home.name.toLowerCase().includes('az');
  const isAZAway = fixtureData.teams.away.name.toLowerCase().includes('az');
  const isAZMatch = isAZHome || isAZAway;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="px-4 pt-6 pb-20">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 p-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>

        {/* Match header */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {fixtureData.league.name}
              </Badge>
              <Badge 
                variant={fixtureData.fixture.status.short === 'LIVE' ? 'default' : 'outline'}
                className={fixtureData.fixture.status.short === 'LIVE' ? 'bg-red-500 text-white' : ''}
              >
                {getStatusText(fixtureData.fixture.status.short)}
              </Badge>
            </div>
            
            {/* Teams and score */}
            <div className="flex items-center justify-center gap-8 my-6">
              <div className="flex flex-col items-center gap-2">
                <img 
                  src={fixtureData.teams.home.logo} 
                  alt={fixtureData.teams.home.name}
                  className="w-16 h-16 object-contain"
                />
                <span className={`font-semibold text-center ${isAZHome ? 'text-az-red' : 'text-az-black dark:text-white'}`}>
                  {fixtureData.teams.home.name}
                </span>
              </div>

              <div className="text-center">
                {fixtureData.goals.home !== null && fixtureData.goals.away !== null ? (
                  <>
                    <div className="text-4xl font-bold text-az-red mb-2">
                      {fixtureData.goals.home} - {fixtureData.goals.away}
                    </div>
                    {fixtureData.score.halftime.home !== null && (
                      <div className="text-sm text-premium-gray-600 dark:text-gray-400">
                        Rust: {fixtureData.score.halftime.home} - {fixtureData.score.halftime.away}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-2xl font-bold text-premium-gray-400">
                    vs
                  </div>
                )}
                {fixtureData.fixture.status.elapsed && (
                  <div className="text-sm text-premium-gray-600 dark:text-gray-400 mt-1">
                    {fixtureData.fixture.status.elapsed}'
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <img 
                  src={fixtureData.teams.away.logo} 
                  alt={fixtureData.teams.away.name}
                  className="w-16 h-16 object-contain"
                />
                <span className={`font-semibold text-center ${isAZAway ? 'text-az-red' : 'text-az-black dark:text-white'}`}>
                  {fixtureData.teams.away.name}
                </span>
              </div>
            </div>

            {/* Match info */}
            <div className="space-y-2 text-sm text-premium-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(fixtureData.fixture.date)}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{fixtureData.fixture.venue.name}, {fixtureData.fixture.venue.city}</span>
              </div>
              {fixtureData.fixture.referee && (
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Scheidsrechter: {fixtureData.fixture.referee}</span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Events */}
        {eventsData && eventsData.length > 0 && (
          <Card className="mb-6 bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Wedstrijdverloop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventsData.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-premium-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 text-center font-semibold text-sm">
                      {event.time.elapsed}'
                    </div>
                    <div className="text-lg">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {event.player.name}
                        {event.assist && <span className="text-premium-gray-600 dark:text-gray-400"> (assist: {event.assist.name})</span>}
                      </div>
                      <div className="text-xs text-premium-gray-600 dark:text-gray-400">
                        {event.detail} - {event.team.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {statsData && statsData.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Statistieken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statsData[0]?.statistics.map((stat, index) => {
                  const homeStat = statsData[0]?.statistics[index];
                  const awayStat = statsData[1]?.statistics[index];
                  
                  if (!homeStat || !awayStat) return null;
                  
                  return (
                    <div key={stat.type} className="space-y-2">
                      <div className="text-center text-sm text-premium-gray-600 dark:text-gray-400 font-medium">
                        {stat.type}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <span className="font-semibold">{homeStat.value}</span>
                        </div>
                        <div className="text-center flex-1">
                          <span className="font-semibold">{awayStat.value}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default WedstrijdDetail;
