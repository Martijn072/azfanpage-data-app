import { useState, useMemo } from "react";
import { useTeamFixtures, useTeamNextFixtures } from "@/hooks/useTeamFixtures";
import { Fixture } from "@/types/footballApi";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";

const AZ_TEAM_ID = 201;

type FilterTab = "alle" | "gespeeld" | "gepland";

const Wedstrijden = () => {
  const [filter, setFilter] = useState<FilterTab>("alle");
  const { data: playedFixtures, isLoading: playedLoading } = useTeamFixtures(AZ_TEAM_ID);
  const { data: nextFixtures, isLoading: nextLoading } = useTeamNextFixtures(AZ_TEAM_ID, 10);
  const navigate = useNavigate();

  const isLoading = playedLoading || nextLoading;

  const allFixtures = useMemo(() => {
    const played = (playedFixtures || []).filter(f => 
      f.fixture.status.short === "FT" || f.fixture.status.short === "AET" || f.fixture.status.short === "PEN"
    );
    const upcoming = (nextFixtures || []).filter(f => 
      f.fixture.status.short === "NS" || f.fixture.status.short === "TBD"
    );

    const combined = [...played, ...upcoming];
    combined.sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());
    return combined;
  }, [playedFixtures, nextFixtures]);

  const filteredFixtures = useMemo(() => {
    if (filter === "gespeeld") return allFixtures.filter(f => f.fixture.status.short === "FT" || f.fixture.status.short === "AET" || f.fixture.status.short === "PEN");
    if (filter === "gepland") return allFixtures.filter(f => f.fixture.status.short === "NS" || f.fixture.status.short === "TBD");
    return allFixtures;
  }, [allFixtures, filter]);

  const getResult = (fixture: Fixture) => {
    const isAZHome = fixture.teams.home.id === AZ_TEAM_ID;
    const azGoals = isAZHome ? fixture.goals.home : fixture.goals.away;
    const oppGoals = isAZHome ? fixture.goals.away : fixture.goals.home;
    if (azGoals === null || oppGoals === null) return null;
    if (azGoals > oppGoals) return "W";
    if (azGoals < oppGoals) return "V";
    return "G";
  };

  const resultStyles = {
    W: "bg-success/15 text-success",
    G: "bg-warning/15 text-warning",
    V: "bg-danger/15 text-danger",
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "alle", label: "Alle" },
    { key: "gespeeld", label: "Gespeeld" },
    { key: "gepland", label: "Gepland" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Wedstrijden</h2>
        <p className="text-app-small text-muted-foreground">
          Alle AZ-wedstrijden dit seizoen — klik voor analyse
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-4 py-1.5 rounded-md text-app-body transition-colors duration-150",
              filter === tab.key
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fixture list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFixtures.map((fixture) => {
            const isPlayed = fixture.fixture.status.short === "FT" || fixture.fixture.status.short === "AET" || fixture.fixture.status.short === "PEN";
            const result = isPlayed ? getResult(fixture) : null;
            const matchDate = new Date(fixture.fixture.date);

            return (
              <button
                key={fixture.fixture.id}
                onClick={() => navigate(`/wedstrijden/${fixture.fixture.id}`)}
                className="w-full bg-card border border-border rounded-xl p-4 hover:border-muted-foreground/30 transition-colors duration-150 text-left group"
              >
                <div className="flex items-center gap-4">
                  {/* Date */}
                  <div className="w-16 shrink-0 text-center">
                    <div className="text-app-tiny text-muted-foreground">
                      {format(matchDate, "d MMM", { locale: nl })}
                    </div>
                    <div className="text-app-data font-mono text-muted-foreground">
                      {format(matchDate, "HH:mm")}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <img src={fixture.teams.home.logo} alt="" className="h-5 w-5 object-contain" />
                      <span className={cn("text-app-body truncate", fixture.teams.home.id === AZ_TEAM_ID && "font-semibold text-foreground")}>
                        {fixture.teams.home.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={fixture.teams.away.logo} alt="" className="h-5 w-5 object-contain" />
                      <span className={cn("text-app-body truncate", fixture.teams.away.id === AZ_TEAM_ID && "font-semibold text-foreground")}>
                        {fixture.teams.away.name}
                      </span>
                    </div>
                  </div>

                  {/* Score or status */}
                  <div className="shrink-0 flex items-center gap-3">
                    {isPlayed ? (
                      <>
                        <div className="text-right">
                          <div className="text-app-data font-mono text-foreground">{fixture.goals.home}</div>
                          <div className="text-app-data font-mono text-foreground">{fixture.goals.away}</div>
                        </div>
                        {result && (
                          <span className={cn("text-app-tiny font-bold w-6 h-6 rounded flex items-center justify-center", resultStyles[result])}>
                            {result}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-app-tiny bg-info/15 text-info px-2 py-0.5 rounded-full">
                        Gepland
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* League badge */}
                  <div className="hidden sm:block shrink-0">
                    <img src={fixture.league.logo} alt={fixture.league.name} className="h-5 w-5 object-contain opacity-50" />
                  </div>
                </div>
              </button>
            );
          })}

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
