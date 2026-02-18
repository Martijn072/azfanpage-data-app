import { useNavigate } from "react-router-dom";
import { useNextAZFixture, useAZFixtures, useEredivisieStandings } from "@/hooks/useFootballApi";
import { useTeamStatistics } from "@/hooks/useTeamStatistics";
import { useTeamFixtures, useTeamNextFixtures } from "@/hooks/useTeamFixtures";
import { useSeason } from "@/contexts/SeasonContext";
import { NextMatchCard } from "@/components/dashboard/NextMatchCard";
import { LastMatchCard } from "@/components/dashboard/LastMatchCard";
import { StandingsWidget } from "@/components/dashboard/StandingsWidget";
import { Fixture, Standing } from "@/types/footballApi";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, ChevronRight, Calendar, Target, Shield, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AZ_TEAM_ID = 201;

const FormBadge = ({ form }: { form: string }) => {
  const chars = form.slice(-5).split("");
  const styles: Record<string, string> = {
    W: "bg-success/20 text-success",
    D: "bg-warning/20 text-warning",
    L: "bg-danger/20 text-danger",
  };
  const labels: Record<string, string> = { W: "W", D: "G", L: "V" };
  return (
    <div className="flex gap-1">
      {chars.map((c, i) => (
        <span key={i} className={cn("w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold", styles[c] || "bg-muted text-muted-foreground")}>
          {labels[c] || c}
        </span>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { displaySeason } = useSeason();
  const { data: nextFixture, isLoading: nextLoading } = useNextAZFixture(AZ_TEAM_ID);
  const { data: lastFixtures, isLoading: lastLoading } = useAZFixtures(AZ_TEAM_ID, 1);
  const { data: standings, isLoading: standingsLoading } = useEredivisieStandings();
  const { data: azStats } = useTeamStatistics(AZ_TEAM_ID);
  const { data: allFixtures } = useTeamFixtures(AZ_TEAM_ID);
  const { data: upcomingFixtures } = useTeamNextFixtures(AZ_TEAM_ID, 5);

  const lastFixture = lastFixtures?.[0];

  // AZ position context
  const azStanding = standings?.find(s => s.team.id === AZ_TEAM_ID);
  const teamAbove = azStanding && azStanding.rank > 1 ? standings?.find(s => s.rank === azStanding.rank - 1) : null;
  const teamBelow = azStanding ? standings?.find(s => s.rank === azStanding.rank + 1) : null;

  // Recent results (last 5)
  const recentResults = useMemo(() => {
    if (!allFixtures) return [];
    return allFixtures
      .filter(f => ["FT", "AET", "PEN"].includes(f.fixture.status.short))
      .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
      .slice(0, 5);
  }, [allFixtures]);

  // Upcoming 3 (after the next match)
  const upcoming3 = useMemo(() => {
    if (!upcomingFixtures) return [];
    return upcomingFixtures
      .filter(f => ["NS", "TBD"].includes(f.fixture.status.short))
      .slice(0, 3);
  }, [upcomingFixtures]);

  const getResult = (fixture: Fixture) => {
    const isHome = fixture.teams.home.id === AZ_TEAM_ID;
    const az = isHome ? fixture.goals.home : fixture.goals.away;
    const opp = isHome ? fixture.goals.away : fixture.goals.home;
    if (az === null || opp === null) return null;
    if (az > opp) return "W";
    if (az < opp) return "V";
    return "G";
  };

  const resultStyles: Record<string, string> = {
    W: "text-success",
    G: "text-warning",
    V: "text-danger",
  };

  const resultBg: Record<string, string> = {
    W: "bg-success/15 text-success",
    G: "bg-warning/15 text-warning",
    V: "bg-danger/15 text-danger",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Dashboard</h2>
        <p className="text-app-small text-muted-foreground">
          Seizoen {displaySeason} — overzicht AZ Alkmaar
        </p>
      </div>

      {/* Row 1: Next + Last match */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NextMatchCard fixture={nextFixture} isLoading={nextLoading} />
        <LastMatchCard fixture={lastFixture} isLoading={lastLoading} />
      </div>

      {/* Row 2: Season stats + Position context */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Season stats cards */}
        {azStats ? (
          <>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium">Vorm</span>
              </div>
              {azStats.form && <FormBadge form={azStats.form} />}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-mono text-lg font-bold text-success">{azStats.fixtures.wins.total}</div>
                  <div className="text-[10px] text-muted-foreground">W</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-warning">{azStats.fixtures.draws.total}</div>
                  <div className="text-[10px] text-muted-foreground">G</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-danger">{azStats.fixtures.loses.total}</div>
                  <div className="text-[10px] text-muted-foreground">V</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-success" />
                <span className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium">Doelpunten</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-app-small text-muted-foreground">Voor</span>
                  <span className="font-mono text-xl font-bold text-foreground">{azStats.goals.for.total.total}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-app-small text-muted-foreground">Tegen</span>
                  <span className="font-mono text-xl font-bold text-foreground">{azStats.goals.against.total.total}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-border pt-1">
                  <span className="text-app-small text-muted-foreground">Gem. per wed</span>
                  <span className="font-mono text-app-small text-foreground">{azStats.goals.for.average.total} / {azStats.goals.against.average.total}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-info" />
                <span className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium">Defensief</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-app-small text-muted-foreground">Clean sheets</span>
                  <span className="font-mono text-xl font-bold text-foreground">{azStats.clean_sheet.total}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-app-small text-muted-foreground">Niet gescoord</span>
                  <span className="font-mono text-xl font-bold text-foreground">{azStats.failed_to_score.total}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-border pt-1">
                  <span className="text-app-small text-muted-foreground">Thuis/Uit CS</span>
                  <span className="font-mono text-app-small text-foreground">{azStats.clean_sheet.home} / {azStats.clean_sheet.away}</span>
                </div>
              </div>
            </div>

            {/* Position context */}
            <div className="bg-card border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={azStanding?.team.logo} alt="" className="h-5 w-5 object-contain" />
                <span className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium">Positie</span>
              </div>
              {azStanding && (
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="font-mono text-3xl font-bold text-primary">#{azStanding.rank}</div>
                    <div className="text-[10px] text-muted-foreground">{azStanding.points} punten · {azStanding.all.played} wed</div>
                  </div>
                  <div className="space-y-1 text-app-small">
                    {teamAbove && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingUp className="h-3 w-3 text-success shrink-0" />
                        <span className="truncate">{teamAbove.points - azStanding.points}p achter {teamAbove.team.name}</span>
                      </div>
                    )}
                    {teamBelow && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingDown className="h-3 w-3 text-info shrink-0" />
                        <span className="truncate">{azStanding.points - teamBelow.points}p voor op {teamBelow.team.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[160px] rounded-xl" />
          ))
        )}
      </div>

      {/* Row 3: Recent results + Upcoming matches + Full standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent results */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium">Recente resultaten</h3>
            <button onClick={() => navigate("/wedstrijden")} className="text-app-tiny text-primary hover:underline">Alles →</button>
          </div>
          {recentResults.length > 0 ? (
            <div className="space-y-1.5">
              {recentResults.map(f => {
                const result = getResult(f);
                const isHome = f.teams.home.id === AZ_TEAM_ID;
                const opponent = isHome ? f.teams.away : f.teams.home;
                return (
                  <button
                    key={f.fixture.id}
                    onClick={() => navigate(`/wedstrijden/${f.fixture.id}`)}
                    className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors text-left group"
                  >
                    <span className="text-[10px] text-muted-foreground w-10 shrink-0">
                      {format(new Date(f.fixture.date), "d MMM", { locale: nl })}
                    </span>
                    <img src={opponent.logo} alt="" className="h-4 w-4 object-contain shrink-0" />
                    <span className="text-app-small text-foreground truncate flex-1">{opponent.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{isHome ? "T" : "U"}</span>
                    <span className="font-mono text-app-small font-bold text-foreground shrink-0">{f.goals.home}-{f.goals.away}</span>
                    {result && (
                      <span className={cn("text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0", resultBg[result])}>
                        {result}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-7 bg-muted rounded" />)}
            </div>
          )}
        </div>

        {/* Upcoming matches */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium">Komende wedstrijden</h3>
            <button onClick={() => navigate("/wedstrijden")} className="text-app-tiny text-primary hover:underline">Alles →</button>
          </div>
          {upcoming3.length > 0 ? (
            <div className="space-y-2">
              {upcoming3.map(f => {
                const isHome = f.teams.home.id === AZ_TEAM_ID;
                const opponent = isHome ? f.teams.away : f.teams.home;
                const matchDate = new Date(f.fixture.date);
                return (
                  <div
                    key={f.fixture.id}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <div className="text-center shrink-0 w-12">
                      <div className="text-[10px] text-muted-foreground">{format(matchDate, "d MMM", { locale: nl })}</div>
                      <div className="font-mono text-app-small font-semibold text-foreground">{format(matchDate, "HH:mm")}</div>
                    </div>
                    <img src={opponent.logo} alt="" className="h-5 w-5 object-contain shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-app-small text-foreground truncate">{opponent.name}</div>
                      <div className="text-[10px] text-muted-foreground">{isHome ? "Thuis" : "Uit"} · {f.league.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}
            </div>
          )}
        </div>

        {/* Biggest streak */}
        {azStats && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium mb-3">Records dit seizoen</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-app-small">
                <span className="text-muted-foreground">Langste winststreek</span>
                <span className="font-mono font-bold text-success">{azStats.biggest.streak.wins}</span>
              </div>
              <div className="flex justify-between text-app-small">
                <span className="text-muted-foreground">Langste gelijkspelreeks</span>
                <span className="font-mono font-bold text-warning">{azStats.biggest.streak.draws}</span>
              </div>
              <div className="flex justify-between text-app-small">
                <span className="text-muted-foreground">Langste verliesreeks</span>
                <span className="font-mono font-bold text-danger">{azStats.biggest.streak.loses}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-app-small">
                  <span className="text-muted-foreground">Grootste thuiswinst</span>
                  <span className="font-mono text-foreground">{azStats.biggest.wins.home || "–"}</span>
                </div>
                <div className="flex justify-between text-app-small mt-1">
                  <span className="text-muted-foreground">Grootste uitwinst</span>
                  <span className="font-mono text-foreground">{azStats.biggest.wins.away || "–"}</span>
                </div>
                <div className="flex justify-between text-app-small mt-1">
                  <span className="text-muted-foreground">Grootste thuisnederlaag</span>
                  <span className="font-mono text-foreground">{azStats.biggest.loses.home || "–"}</span>
                </div>
                <div className="flex justify-between text-app-small mt-1">
                  <span className="text-muted-foreground">Grootste uitnederlaag</span>
                  <span className="font-mono text-foreground">{azStats.biggest.loses.away || "–"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Full Eredivisie standings */}
      <StandingsWidget standings={standings} isLoading={standingsLoading} />
    </div>
  );
};

export default Dashboard;
