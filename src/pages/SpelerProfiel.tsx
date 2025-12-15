import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { useAZTeamId } from "@/hooks/useTeamHooks";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Trophy, Target, Users, Clock, Square, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { callFootballApi } from '@/utils/footballApiClient';
import { FootballApiResponse } from '@/types/footballApi';

interface PlayerStatistics {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: {
      date: string;
      place: string;
      country: string;
    };
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
  };
  statistics: [{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      number: number;
      position: string;
      rating: string;
      captain: boolean;
    };
    substitutes: {
      in: number;
      out: number;
      bench: number;
    };
    shots: {
      total: number;
      on: number;
    };
    goals: {
      total: number;
      conceded: number;
      assists: number;
      saves: number;
    };
    passes: {
      total: number;
      key: number;
      accuracy: number;
    };
    tackles: {
      total: number;
      blocks: number;
      interceptions: number;
    };
    duels: {
      total: number;
      won: number;
    };
    dribbles: {
      attempts: number;
      success: number;
      past: number;
    };
    fouls: {
      drawn: number;
      committed: number;
    };
    cards: {
      yellow: number;
      yellowred: number;
      red: number;
    };
    penalty: {
      won: number;
      commited: number;
      scored: number;
      missed: number;
      saved: number;
    };
  }];
}

const translatePosition = (position: string): string => {
  const positionMap: Record<string, string> = {
    'Goalkeeper': 'Doelman',
    'Defender': 'Verdediger',
    'Midfielder': 'Middenvelder',
    'Attacker': 'Aanvaller'
  };
  return positionMap[position] || position;
};

// Rating badge component with color coding
const RatingBadge = ({ rating }: { rating: number | null }) => {
  if (!rating) return <span className="text-muted-foreground text-sm">-</span>;
  
  const getColorClass = () => {
    if (rating >= 7.5) return 'bg-green-500 text-white';
    if (rating >= 6.5) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };
  
  return (
    <span className={`${getColorClass()} px-2 py-0.5 rounded-full text-xs font-bold`}>
      {rating.toFixed(1)}
    </span>
  );
};

// Competition stat card component
const CompetitionCard = ({ 
  stat, 
  showDetails,
  onToggleDetails 
}: { 
  stat: any;
  showDetails: boolean;
  onToggleDetails: () => void;
}) => {
  const rating = stat.games?.rating ? parseFloat(stat.games.rating) : null;
  
  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <img 
            src={stat.league.logo} 
            alt={stat.league.name}
            className="w-10 h-10 object-contain flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-foreground truncate">{stat.league.name}</h4>
              <RatingBadge rating={rating} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stat.games?.appearences || 0} wedstrijden • {stat.goals?.total || 0} goals • {stat.goals?.assists || 0} assists
            </p>
            
            {/* Toggle details */}
            <button
              onClick={onToggleDetails}
              className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
            >
              {showDetails ? (
                <>Minder details <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Meer details <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
            
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{stat.games?.minutes || 0} minuten</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-3 h-3 text-yellow-500" />
                  <span>{stat.cards?.yellow || 0} geel</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{stat.games?.lineups || 0} basisplaatsen</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-3 h-3 text-red-500" />
                  <span>{stat.cards?.red || 0} rood</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SpelerProfiel = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("speler-statistieken");
  const [statsTab, setStatsTab] = useState("current");
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [expandedClubs, setExpandedClubs] = useState<Set<number>>(new Set());

  const { data: azTeamId } = useAZTeamId();

  const { data: playerData, isLoading, error } = useQuery({
    queryKey: ['player-profile', playerId],
    queryFn: async () => {
      if (!playerId) return null;
      
      console.log(`👤 Fetching career statistics for player ${playerId}...`);
      
      const seasons = ['2025', '2024', '2023', '2022', '2021', '2020'];
      const allSeasonStats: PlayerStatistics[] = [];
      
      for (const season of seasons) {
        try {
          const response: FootballApiResponse<PlayerStatistics> = await callFootballApi('/players', {
            id: playerId,
            season: season
          });
          
          if (response.response && response.response.length > 0) {
            allSeasonStats.push(...response.response);
          }
        } catch (error) {
          console.log(`No data for season ${season}:`, error);
        }
      }
      
      console.log(`📊 Career stats fetched: ${allSeasonStats.length} seasons`);
      return allSeasonStats;
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  // Initialize expandedClubs with AZ when azTeamId is available
  useState(() => {
    if (azTeamId) {
      setExpandedClubs(new Set([azTeamId]));
    }
  });

  // Calculate AZ career totals
  const getAZCareerTotals = () => {
    if (!playerData || playerData.length === 0 || !azTeamId) return null;
    
    let totalGames = 0;
    let totalMinutes = 0;
    let totalGoals = 0;
    let totalAssists = 0;
    let totalYellowCards = 0;
    let totalRedCards = 0;
    
    playerData.forEach(seasonData => {
      const azStats = seasonData.statistics.find(stat => stat.team.id === azTeamId);
      if (azStats) {
        totalGames += azStats.games?.appearences || 0;
        totalMinutes += azStats.games?.minutes || 0;
        totalGoals += azStats.goals?.total || 0;
        totalAssists += azStats.goals?.assists || 0;
        totalYellowCards += azStats.cards?.yellow || 0;
        totalRedCards += azStats.cards?.red || 0;
      }
    });
    
    return {
      games: totalGames,
      minutes: totalMinutes,
      goals: totalGoals,
      assists: totalAssists,
      yellowCards: totalYellowCards,
      redCards: totalRedCards
    };
  };

  // Get current season stats (2025)
  const getCurrentSeasonStats = () => {
    if (!playerData || playerData.length === 0) return [];
    
    const currentSeason = playerData.find(d => 
      d.statistics.some(s => s.league.season === 2025)
    );
    
    if (!currentSeason) return [];
    
    return currentSeason.statistics.filter(s => 
      s.league.season === 2025 && s.games?.appearences > 0
    );
  };

  // Get AZ career stats grouped by season
  const getAZCareerStats = () => {
    if (!playerData || playerData.length === 0 || !azTeamId) return [];
    
    const azStats: Array<{ season: number; stats: any[] }> = [];
    
    playerData.forEach(seasonData => {
      const seasonAZStats = seasonData.statistics.filter(
        stat => stat.team.id === azTeamId && stat.games?.appearences > 0
      );
      
      if (seasonAZStats.length > 0) {
        const season = seasonAZStats[0].league.season;
        const existing = azStats.find(s => s.season === season);
        if (existing) {
          existing.stats.push(...seasonAZStats);
        } else {
          azStats.push({ season, stats: seasonAZStats });
        }
      }
    });
    
    return azStats.sort((a, b) => b.season - a.season);
  };

  // Get full career grouped by club
  const getFullCareerGroupedByClub = () => {
    if (!playerData || playerData.length === 0) return [];
    
    const clubMap = new Map<number, {
      team: { id: number; name: string; logo: string };
      seasons: Array<{ season: number; stats: any[] }>;
    }>();
    
    playerData.forEach(seasonData => {
      seasonData.statistics.forEach(stat => {
        if (stat.games?.appearences > 0) {
          const teamId = stat.team.id;
          
          if (!clubMap.has(teamId)) {
            clubMap.set(teamId, {
              team: stat.team,
              seasons: []
            });
          }
          
          const club = clubMap.get(teamId)!;
          const existingSeason = club.seasons.find(s => s.season === stat.league.season);
          
          if (existingSeason) {
            existingSeason.stats.push(stat);
          } else {
            club.seasons.push({ season: stat.league.season, stats: [stat] });
          }
        }
      });
    });
    
    // Sort seasons within each club
    clubMap.forEach(club => {
      club.seasons.sort((a, b) => b.season - a.season);
    });
    
    // Convert to array and sort (AZ first, then by total games)
    return Array.from(clubMap.values()).sort((a, b) => {
      if (a.team.id === azTeamId) return -1;
      if (b.team.id === azTeamId) return 1;
      const aGames = a.seasons.reduce((sum, s) => sum + s.stats.reduce((ss, st) => ss + (st.games?.appearences || 0), 0), 0);
      const bGames = b.seasons.reduce((sum, s) => sum + s.stats.reduce((ss, st) => ss + (st.games?.appearences || 0), 0), 0);
      return bGames - aGames;
    });
  };

  const toggleDetails = (key: string) => {
    const newSet = new Set(expandedDetails);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedDetails(newSet);
  };

  const toggleClub = (teamId: number) => {
    const newSet = new Set(expandedClubs);
    if (newSet.has(teamId)) {
      newSet.delete(teamId);
    } else {
      newSet.add(teamId);
    }
    setExpandedClubs(newSet);
  };

  const playerInfo = playerData?.[0]?.player;
  const azCareerTotals = getAZCareerTotals();
  const position = playerData?.[0]?.statistics[0]?.games?.position;

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <Card className="bg-card border border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Fout bij het laden van speler informatie</p>
              <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Terug
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 pt-6 pb-20 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (!playerInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <Card className="bg-card border border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Speler niet gevonden</p>
              <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Terug
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  const currentSeasonStats = getCurrentSeasonStats();
  const azCareerStats = getAZCareerStats();
  const fullCareerByClub = getFullCareerGroupedByClub();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="px-4 pt-6 pb-20 space-y-4">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-primary p-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>

        {/* Compact Player Header */}
        <Card className="bg-card border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img 
                src={playerInfo.photo} 
                alt={playerInfo.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-xl font-bold text-foreground truncate">
                    {playerInfo.name}
                  </h1>
                  {position && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      {translatePosition(position)}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">{playerInfo.nationality}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {playerInfo.age} jaar
                  {playerInfo.height && ` • ${playerInfo.height}`}
                  {playerInfo.weight && ` • ${playerInfo.weight}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AZ Career Stats - 2x3 Grid */}
        {azCareerTotals && azCareerTotals.games > 0 && (
          <Card className="bg-card border border-border">
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">AZ-CARRIÈRE</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{azCareerTotals.games}</div>
                  <div className="text-xs text-muted-foreground">Wedstrijden</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{Math.round(azCareerTotals.minutes / 90)}</div>
                  <div className="text-xs text-muted-foreground">Vol. wedstr.</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{azCareerTotals.goals}</div>
                  <div className="text-xs text-muted-foreground">Doelpunten</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{azCareerTotals.assists}</div>
                  <div className="text-xs text-muted-foreground">Assists</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Square className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{azCareerTotals.yellowCards}</div>
                  <div className="text-xs text-muted-foreground">Gele kaarten</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">{azCareerTotals.redCards}</div>
                  <div className="text-xs text-muted-foreground">Rode kaarten</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Season Statistics with Tabs */}
        <Card className="bg-card border border-border">
          <CardContent className="p-4">
            <Tabs value={statsTab} onValueChange={setStatsTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="current" className="text-xs sm:text-sm">Huidig seizoen</TabsTrigger>
                <TabsTrigger value="az" className="text-xs sm:text-sm">AZ Carrière</TabsTrigger>
                <TabsTrigger value="full" className="text-xs sm:text-sm">Volledige carrière</TabsTrigger>
              </TabsList>

              {/* Current Season Tab */}
              <TabsContent value="current" className="space-y-3">
                {currentSeasonStats.length > 0 ? (
                  currentSeasonStats.map((stat, idx) => (
                    <CompetitionCard
                      key={`current-${idx}`}
                      stat={stat}
                      showDetails={expandedDetails.has(`current-${idx}`)}
                      onToggleDetails={() => toggleDetails(`current-${idx}`)}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nog geen statistieken dit seizoen
                  </p>
                )}
              </TabsContent>

              {/* AZ Career Tab */}
              <TabsContent value="az" className="space-y-4">
                {azCareerStats.length > 0 ? (
                  azCareerStats.map((seasonData) => (
                    <div key={seasonData.season}>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        {seasonData.season}-{(seasonData.season + 1).toString().slice(-2)}
                      </h3>
                      <div className="space-y-2">
                        {seasonData.stats.map((stat, idx) => (
                          <CompetitionCard
                            key={`az-${seasonData.season}-${idx}`}
                            stat={stat}
                            showDetails={expandedDetails.has(`az-${seasonData.season}-${idx}`)}
                            onToggleDetails={() => toggleDetails(`az-${seasonData.season}-${idx}`)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Geen AZ statistieken beschikbaar
                  </p>
                )}
              </TabsContent>

              {/* Full Career Tab */}
              <TabsContent value="full" className="space-y-3">
                {fullCareerByClub.length > 0 ? (
                  fullCareerByClub.map((club) => (
                    <Collapsible
                      key={club.team.id}
                      open={expandedClubs.has(club.team.id) || club.team.id === azTeamId}
                      onOpenChange={() => toggleClub(club.team.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <div className="flex items-center gap-3">
                            <img 
                              src={club.team.logo} 
                              alt={club.team.name}
                              className="w-8 h-8 object-contain"
                            />
                            <span className={`font-semibold ${club.team.id === azTeamId ? 'text-primary' : 'text-foreground'}`}>
                              {club.team.name}
                            </span>
                          </div>
                          {expandedClubs.has(club.team.id) || club.team.id === azTeamId ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-3 pl-2">
                        {club.seasons.map((seasonData) => (
                          <div key={seasonData.season}>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2">
                              {seasonData.season}-{(seasonData.season + 1).toString().slice(-2)}
                            </h4>
                            <div className="space-y-2">
                              {seasonData.stats.map((stat, idx) => (
                                <CompetitionCard
                                  key={`full-${club.team.id}-${seasonData.season}-${idx}`}
                                  stat={stat}
                                  showDetails={expandedDetails.has(`full-${club.team.id}-${seasonData.season}-${idx}`)}
                                  onToggleDetails={() => toggleDetails(`full-${club.team.id}-${seasonData.season}-${idx}`)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Geen carrière statistieken beschikbaar
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default SpelerProfiel;
