import { useState, useMemo } from "react";
import { useTeamFixtures, useTeamNextFixtures } from "@/hooks/useTeamFixtures";
import { Fixture } from "@/types/footballApi";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AZ_TEAM_ID = 201;

type StatusFilter = "alle" | "gespeeld" | "gepland";

const Wedstrijden = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle");
  const [leagueFilter, setLeagueFilter] = useState<string>("alle");
  const [search, setSearch] = useState("");
  const { data: playedFixtures, isLoading: playedLoading } = useTeamFixtures(AZ_TEAM_ID);
  const { data: nextFixtures, isLoading: nextLoading } = useTeamNextFixtures(AZ_TEAM_ID, 10);
  const navigate = useNavigate();

  const isLoading = playedLoading || nextLoading;

  const allFixtures = useMemo(() => {
    const played = (playedFixtures || []).filter(f =>
      ["FT", "AET", "PEN"].includes(f.fixture.status.short)
    );
    const upcoming = (nextFixtures || []).filter(f =>
      ["NS", "TBD"].includes(f.fixture.status.short)
    );
    const combined = [...played, ...upcoming];
    combined.sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());
    return combined;
  }, [playedFixtures, nextFixtures]);

  // Extract unique leagues for filter
  const leagues = useMemo(() => {
    const map = new Map<string, { id: number; name: string; logo: string }>();
    allFixtures.forEach(f => {
      if (!map.has(f.league.name)) {
        map.set(f.league.name, { id: f.league.id, name: f.league.name, logo: f.league.logo });
      }
    });
    return Array.from(map.values());
  }, [allFixtures]);

  const filteredFixtures = useMemo(() => {
    let fixtures = allFixtures;

    if (statusFilter === "gespeeld") {
      fixtures = fixtures.filter(f => ["FT", "AET", "PEN"].includes(f.fixture.status.short));
    } else if (statusFilter === "gepland") {
      fixtures = fixtures.filter(f => ["NS", "TBD"].includes(f.fixture.status.short));
    }

    if (leagueFilter !== "alle") {
      fixtures = fixtures.filter(f => f.league.name === leagueFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      fixtures = fixtures.filter(f =>
        f.teams.home.name.toLowerCase().includes(q) ||
        f.teams.away.name.toLowerCase().includes(q)
      );
    }

    return fixtures;
  }, [allFixtures, statusFilter, leagueFilter, search]);

  // Group fixtures by month
  const groupedByMonth = useMemo(() => {
    const groups: { label: string; fixtures: Fixture[] }[] = [];
    let currentLabel = "";
    filteredFixtures.forEach(f => {
      const label = format(new Date(f.fixture.date), "MMMM yyyy", { locale: nl });
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, fixtures: [] });
      }
      groups[groups.length - 1].fixtures.push(f);
    });
    return groups;
  }, [filteredFixtures]);

  const getResult = (fixture: Fixture) => {
    const isAZHome = fixture.teams.home.id === AZ_TEAM_ID;
    const azGoals = isAZHome ? fixture.goals.home : fixture.goals.away;
    const oppGoals = isAZHome ? fixture.goals.away : fixture.goals.home;
    if (azGoals === null || oppGoals === null) return null;
    if (azGoals > oppGoals) return "W";
    if (azGoals < oppGoals) return "V";
    return "G";
  };

  const resultStyles: Record<string, string> = {
    W: "bg-success/15 text-success",
    G: "bg-warning/15 text-warning",
    V: "bg-danger/15 text-danger",
  };

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "alle", label: "Alle", count: allFixtures.length },
    { key: "gespeeld", label: "Gespeeld", count: allFixtures.filter(f => ["FT", "AET", "PEN"].includes(f.fixture.status.short)).length },
    { key: "gepland", label: "Gepland", count: allFixtures.filter(f => ["NS", "TBD"].includes(f.fixture.status.short)).length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Wedstrijden</h2>
        <p className="text-app-small text-muted-foreground">
          Alle AZ-wedstrijden dit seizoen — klik voor analyse
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Zoek tegenstander..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-card border border-border rounded-lg text-app-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-app-small transition-colors duration-150 flex items-center gap-1.5",
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <span className={cn(
                "text-[11px] font-mono",
                statusFilter === tab.key ? "text-primary-foreground/70" : "text-muted-foreground/50"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Competition filter */}
      {leagues.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setLeagueFilter("alle")}
            className={cn(
              "h-8 px-3 rounded-lg text-app-small font-medium transition-colors flex items-center gap-1.5",
              leagueFilter === "alle"
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Trophy className="h-3.5 w-3.5" />
            Alle competities
          </button>
          {leagues.map(league => (
            <button
              key={league.name}
              onClick={() => setLeagueFilter(league.name)}
              className={cn(
                "h-8 px-3 rounded-lg text-app-small font-medium transition-colors flex items-center gap-1.5",
                leagueFilter === league.name
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <img src={league.logo} alt="" className="h-4 w-4 object-contain" />
              {league.name}
            </button>
          ))}
        </div>
      )}

      {/* Fixture list grouped by month */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByMonth.map(group => (
            <div key={group.label}>
              <h3 className="text-app-small font-semibold text-muted-foreground uppercase tracking-wider mb-2 capitalize">
                {group.label}
              </h3>
              <div className="space-y-1.5">
                {group.fixtures.map(fixture => {
                  const isPlayed = ["FT", "AET", "PEN"].includes(fixture.fixture.status.short);
                  const result = isPlayed ? getResult(fixture) : null;
                  const matchDate = new Date(fixture.fixture.date);

                  return (
                    <button
                      key={fixture.fixture.id}
                      onClick={() => navigate(`/wedstrijden/${fixture.fixture.id}`)}
                      className="w-full bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-muted-foreground/30 transition-colors duration-150 text-left group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Date */}
                        <div className="w-14 shrink-0 text-center">
                          <div className="text-[11px] text-muted-foreground">
                            {format(matchDate, "d MMM", { locale: nl })}
                          </div>
                          <div className="font-mono text-app-small text-muted-foreground">
                            {format(matchDate, "HH:mm")}
                          </div>
                        </div>

                        {/* League badge */}
                        <img src={fixture.league.logo} alt={fixture.league.name} className="h-5 w-5 object-contain shrink-0 opacity-60" />

                        {/* Teams */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <img src={fixture.teams.home.logo} alt="" className="h-4 w-4 object-contain" />
                            <span className={cn("text-app-body truncate", fixture.teams.home.id === AZ_TEAM_ID ? "font-semibold text-foreground" : "text-muted-foreground")}>
                              {fixture.teams.home.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <img src={fixture.teams.away.logo} alt="" className="h-4 w-4 object-contain" />
                            <span className={cn("text-app-body truncate", fixture.teams.away.id === AZ_TEAM_ID ? "font-semibold text-foreground" : "text-muted-foreground")}>
                              {fixture.teams.away.name}
                            </span>
                          </div>
                        </div>

                        {/* Score or status */}
                        <div className="shrink-0 flex items-center gap-2">
                          {isPlayed ? (
                            <>
                              <div className="text-right w-6">
                                <div className="font-mono text-app-body text-foreground">{fixture.goals.home}</div>
                                <div className="font-mono text-app-body text-foreground">{fixture.goals.away}</div>
                              </div>
                              {result && (
                                <span className={cn("text-[11px] font-bold w-6 h-6 rounded flex items-center justify-center", resultStyles[result])}>
                                  {result}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] bg-info/15 text-info px-2 py-0.5 rounded-full font-medium">
                              Gepland
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredFixtures.length === 0 && (
            <div className="text-center py-12 text-app-body text-muted-foreground">
              Geen wedstrijden gevonden
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wedstrijden;
