import { useNextAZFixture, useEredivisieStandings } from "@/hooks/useFootballApi";
import { useTeamStatistics } from "@/hooks/useTeamStatistics";
import { useHeadToHead } from "@/hooks/useHeadToHead";
import { useTeamFixtures } from "@/hooks/useTeamFixtures";
import { useOpponentRecentForm } from "@/hooks/useOpponentRecentForm";

import { Fixture, Standing } from "@/types/footballApi";
import { format, formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, MapPin, TrendingUp, Swords, BarChart3, Clock, Calendar, Home, Plane } from "lucide-react";
import { FormComparisonChart } from "@/components/voorbeschouwing/FormComparisonChart";
import { GoalsTrendChart } from "@/components/voorbeschouwing/GoalsTrendChart";
import { H2HVisualBar } from "@/components/voorbeschouwing/H2HVisualBar";

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
        <span key={i} className={cn("w-6 h-6 rounded flex items-center justify-center text-app-tiny font-bold", styles[c] || "bg-muted text-muted-foreground")}>
          {labels[c] || c}
        </span>
      ))}
    </div>
  );
};

const deriveFormFromFixtures = (fixtures: Fixture[], teamId: number): string => {
  return fixtures
    .filter(f => f.fixture.status.short === "FT" || f.fixture.status.short === "AET" || f.fixture.status.short === "PEN")
    .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
    .slice(0, 5)
    .map(f => {
      const isHome = f.teams.home.id === teamId;
      const tGoals = isHome ? f.goals.home : f.goals.away;
      const oGoals = isHome ? f.goals.away : f.goals.home;
      if (tGoals === null || oGoals === null) return "";
      if (tGoals > oGoals) return "W";
      if (tGoals < oGoals) return "L";
      return "D";
    })
    .join("");
};

const getResult = (fixture: Fixture, teamId: number) => {
  const isHome = fixture.teams.home.id === teamId;
  const tGoals = isHome ? fixture.goals.home : fixture.goals.away;
  const oGoals = isHome ? fixture.goals.away : fixture.goals.home;
  if (tGoals === null || oGoals === null) return null;
  if (tGoals > oGoals) return "W";
  if (tGoals < oGoals) return "V";
  return "G";
};

const resultStyles: Record<string, string> = {
  W: "text-success",
  G: "text-warning",
  V: "text-danger",
};

const Voorbeschouwing = () => {
  const navigate = useNavigate();
  const { data: nextFixture, isLoading: fixtureLoading } = useNextAZFixture(AZ_TEAM_ID);
  const { data: standings } = useEredivisieStandings();
  const { data: azStats } = useTeamStatistics(AZ_TEAM_ID);
  const { data: allFixtures } = useTeamFixtures(AZ_TEAM_ID);
  

  const opponentId = useMemo(() => {
    if (!nextFixture) return null;
    return nextFixture.teams.home.id === AZ_TEAM_ID
      ? nextFixture.teams.away.id
      : nextFixture.teams.home.id;
  }, [nextFixture]);

  const { data: h2hFixtures } = useHeadToHead(AZ_TEAM_ID, opponentId);
  const { data: opponentRecent } = useOpponentRecentForm(opponentId, 5);

  const opponentForm = useMemo(() => {
    if (!opponentRecent || opponentRecent.length === 0 || !opponentId) return null;
    return deriveFormFromFixtures(opponentRecent, opponentId);
  }, [opponentRecent, opponentId]);

  const opponentSummary = useMemo(() => {
    if (!opponentRecent || !opponentId) return null;
    const played = opponentRecent.filter(f => f.fixture.status.short === "FT" || f.fixture.status.short === "AET" || f.fixture.status.short === "PEN");
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    played.forEach(f => {
      const isHome = f.teams.home.id === opponentId;
      const tg = (isHome ? f.goals.home : f.goals.away) || 0;
      const og = (isHome ? f.goals.away : f.goals.home) || 0;
      goalsFor += tg;
      goalsAgainst += og;
      if (tg > og) wins++;
      else if (tg < og) losses++;
      else draws++;
    });
    return { wins, draws, losses, goalsFor, goalsAgainst, played: played.length };
  }, [opponentRecent, opponentId]);

  const azStanding = standings?.find(s => s.team.id === AZ_TEAM_ID);
  const oppStanding = opponentId ? standings?.find(s => s.team.id === opponentId) : null;

  // AZ recent results list
  const azRecentResults = useMemo(() => {
    if (!allFixtures) return [];
    return allFixtures
      .filter(f => f.fixture.status.short === "FT" || f.fixture.status.short === "AET" || f.fixture.status.short === "PEN")
      .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
      .slice(0, 5);
  }, [allFixtures]);

  // H2H summary
  const h2hSummary = useMemo(() => {
    if (!h2hFixtures || h2hFixtures.length === 0) return null;
    let azWins = 0, draws = 0, oppWins = 0;
    h2hFixtures.forEach((f: Fixture) => {
      const azHome = f.teams.home.id === AZ_TEAM_ID;
      const azGoals = azHome ? f.goals.home : f.goals.away;
      const oppGoals = azHome ? f.goals.away : f.goals.home;
      if (azGoals !== null && oppGoals !== null) {
        if (azGoals > oppGoals) azWins++;
        else if (azGoals < oppGoals) oppWins++;
        else draws++;
      }
    });
    return { azWins, draws, oppWins, total: h2hFixtures.length };
  }, [h2hFixtures]);

  // Top scorers from AZ's recent fixtures
  const topScorers = useMemo(() => {
    if (!allFixtures) return [];
    // We don't have per-match goal data in fixtures, but we can show squad info
    return [];
  }, [allFixtures]);

  if (fixtureLoading) {
    return (
      <div className="space-y-6">
        <div><h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Voorbeschouwing</h2></div>
        <div className="bg-card border border-border rounded-xl p-6 animate-pulse h-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 animate-pulse h-56" />
          <div className="bg-card border border-border rounded-xl p-4 animate-pulse h-56" />
        </div>
      </div>
    );
  }

  if (!nextFixture) {
    return (
      <div className="space-y-6">
        <div><h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Voorbeschouwing</h2></div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-app-body text-muted-foreground">Geen aankomende wedstrijd gevonden</p>
        </div>
      </div>
    );
  }

  const matchDate = new Date(nextFixture.fixture.date);
  const isAZHome = nextFixture.teams.home.id === AZ_TEAM_ID;
  const opponent = isAZHome ? nextFixture.teams.away : nextFixture.teams.home;
  const isEredivisie = nextFixture.league.id === 88;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Voorbeschouwing</h2>
        <p className="text-app-small text-muted-foreground">
          Data-analyse voor de volgende wedstrijd
        </p>
      </div>

      {/* Match header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={nextFixture.league.logo} alt="" className="h-4 w-4 object-contain" />
            <span className="text-app-small text-muted-foreground">{nextFixture.league.name} · {nextFixture.league.round}</span>
          </div>
          <span className="text-app-tiny bg-info/15 text-info px-2 py-0.5 rounded-full font-medium">
            {formatDistanceToNow(matchDate, { addSuffix: true, locale: nl })}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src={nextFixture.teams.home.logo} alt="" className="h-12 w-12 object-contain" />
            <div>
              <span className={cn("text-app-heading block", isAZHome && "text-primary")}>{nextFixture.teams.home.name}</span>
              {isAZHome && azStanding && <span className="text-app-tiny text-muted-foreground">Eredivisie #{azStanding.rank} · {azStanding.points} ptn</span>}
              {!isAZHome && oppStanding && <span className="text-app-tiny text-muted-foreground">Eredivisie #{oppStanding.rank} · {oppStanding.points} ptn</span>}
            </div>
          </div>
          <div className="text-center shrink-0">
            <div className="text-app-data-lg font-mono text-foreground">{format(matchDate, "HH:mm")}</div>
            <div className="text-app-tiny text-muted-foreground">{format(matchDate, "EEEE d MMMM", { locale: nl })}</div>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <div className="text-right">
              <span className={cn("text-app-heading block", !isAZHome && "text-primary")}>{nextFixture.teams.away.name}</span>
              {!isAZHome && azStanding && <span className="text-app-tiny text-muted-foreground">Eredivisie #{azStanding.rank} · {azStanding.points} ptn</span>}
              {isAZHome && oppStanding && <span className="text-app-tiny text-muted-foreground">Eredivisie #{oppStanding.rank} · {oppStanding.points} ptn</span>}
            </div>
            <img src={nextFixture.teams.away.logo} alt="" className="h-12 w-12 object-contain" />
          </div>
        </div>

        {nextFixture.fixture.venue && (
          <div className="mt-3 flex items-center gap-4 text-app-tiny text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{nextFixture.fixture.venue.name}{nextFixture.fixture.venue.city ? `, ${nextFixture.fixture.venue.city}` : ""}</span>
            {nextFixture.fixture.referee && (
              <span>Scheidsrechter: {nextFixture.fixture.referee}</span>
            )}
          </div>
        )}
      </div>

      {/* Form cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AZ Form */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-app-body-strong text-foreground">Vorm AZ</h3>
          </div>
          {azStats?.form ? (
            <>
              <FormBadge form={azStats.form} />
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-app-data-lg font-mono text-success">{azStats.fixtures.wins.total}</div>
                  <div className="text-app-tiny text-muted-foreground">Winst</div>
                </div>
                <div>
                  <div className="text-app-data-lg font-mono text-warning">{azStats.fixtures.draws.total}</div>
                  <div className="text-app-tiny text-muted-foreground">Gelijk</div>
                </div>
                <div>
                  <div className="text-app-data-lg font-mono text-danger">{azStats.fixtures.loses.total}</div>
                  <div className="text-app-tiny text-muted-foreground">Verlies</div>
                </div>
              </div>

              {/* Home/Away split */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-app-tiny text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Home className="h-3 w-3" /> Thuis
                    </h4>
                    <div className="space-y-1 text-app-small">
                      <div className="flex justify-between"><span className="text-muted-foreground">W-G-V</span><span className="font-mono text-foreground">{azStats.fixtures.wins.home}-{azStats.fixtures.draws.home}-{azStats.fixtures.loses.home}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Goals</span><span className="font-mono text-foreground">{azStats.goals.for.total.home}-{azStats.goals.against.total.home}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Clean sheets</span><span className="font-mono text-foreground">{azStats.clean_sheet.home}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-app-tiny text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Plane className="h-3 w-3" /> Uit
                    </h4>
                    <div className="space-y-1 text-app-small">
                      <div className="flex justify-between"><span className="text-muted-foreground">W-G-V</span><span className="font-mono text-foreground">{azStats.fixtures.wins.away}-{azStats.fixtures.draws.away}-{azStats.fixtures.loses.away}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Goals</span><span className="font-mono text-foreground">{azStats.goals.for.total.away}-{azStats.goals.against.total.away}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Clean sheets</span><span className="font-mono text-foreground">{azStats.clean_sheet.away}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border space-y-1">
                <div className="flex justify-between text-app-small">
                  <span className="text-muted-foreground">Doelpunten voor</span>
                  <span className="text-foreground font-mono">{azStats.goals.for.total.total} ({azStats.goals.for.average.total}/wed)</span>
                </div>
                <div className="flex justify-between text-app-small">
                  <span className="text-muted-foreground">Doelpunten tegen</span>
                  <span className="text-foreground font-mono">{azStats.goals.against.total.total} ({azStats.goals.against.average.total}/wed)</span>
                </div>
                <div className="flex justify-between text-app-small">
                  <span className="text-muted-foreground">Clean sheets</span>
                  <span className="text-foreground font-mono">{azStats.clean_sheet.total}</span>
                </div>
                <div className="flex justify-between text-app-small">
                  <span className="text-muted-foreground">Niet gescoord</span>
                  <span className="text-foreground font-mono">{azStats.failed_to_score.total}x</span>
                </div>
              </div>

              {/* AZ recent results */}
              {azRecentResults.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <h4 className="text-app-tiny text-muted-foreground uppercase tracking-wider mb-2">Recente uitslagen</h4>
                  <div className="space-y-1.5">
                    {azRecentResults.map((f: Fixture) => {
                      const res = getResult(f, AZ_TEAM_ID);
                      const isHome = f.teams.home.id === AZ_TEAM_ID;
                      return (
                        <div key={f.fixture.id} className="flex items-center justify-between text-app-small gap-2">
                          <span className="text-muted-foreground w-14 shrink-0">{format(new Date(f.fixture.date), "d MMM", { locale: nl })}</span>
                          <span className="flex-1 truncate text-foreground">
                            {isHome ? f.teams.away.name : f.teams.home.name}
                            <span className="text-muted-foreground text-app-tiny ml-1">({isHome ? "T" : "U"})</span>
                          </span>
                          <span className={cn("font-mono font-bold shrink-0", res ? resultStyles[res] : "text-muted-foreground")}>
                            {f.goals.home}-{f.goals.away}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2 animate-pulse">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-16 bg-muted rounded w-full" />
            </div>
          )}
        </div>

        {/* Opponent Form */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-app-body-strong text-foreground">Vorm {opponent.name}</h3>
          </div>
          {opponentForm && opponentSummary ? (
            <>
              <FormBadge form={opponentForm} />
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-app-data-lg font-mono text-success">{opponentSummary.wins}</div>
                  <div className="text-app-tiny text-muted-foreground">Winst</div>
                </div>
                <div>
                  <div className="text-app-data-lg font-mono text-warning">{opponentSummary.draws}</div>
                  <div className="text-app-tiny text-muted-foreground">Gelijk</div>
                </div>
                <div>
                  <div className="text-app-data-lg font-mono text-danger">{opponentSummary.losses}</div>
                  <div className="text-app-tiny text-muted-foreground">Verlies</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-app-small">
                  <span className="text-muted-foreground">Goals (laatste {opponentSummary.played})</span>
                  <span className="text-foreground font-mono">{opponentSummary.goalsFor} voor, {opponentSummary.goalsAgainst} tegen</span>
                </div>
              </div>

              {/* Recent opponent results */}
              <div className="mt-3 pt-3 border-t border-border">
                <h4 className="text-app-tiny text-muted-foreground uppercase tracking-wider mb-2">Recente uitslagen</h4>
                <div className="space-y-1.5">
                  {opponentRecent?.filter(f => f.fixture.status.short === "FT" || f.fixture.status.short === "AET").slice(0, 5).map((f: Fixture) => {
                    const res = getResult(f, opponentId!);
                    return (
                      <div key={f.fixture.id} className="flex items-center justify-between text-app-small gap-2">
                        <span className="text-muted-foreground w-14 shrink-0">{format(new Date(f.fixture.date), "d MMM", { locale: nl })}</span>
                        <span className="flex-1 truncate text-foreground">
                          {f.teams.home.id === opponentId ? f.teams.away.name : f.teams.home.name}
                          <span className="text-muted-foreground text-app-tiny ml-1">({f.teams.home.id === opponentId ? "T" : "U"})</span>
                        </span>
                        <span className={cn("font-mono font-bold shrink-0", res ? resultStyles[res] : "text-muted-foreground")}>
                          {f.goals.home}-{f.goals.away}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2 animate-pulse">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-16 bg-muted rounded w-full" />
            </div>
          )}
        </div>
      </div>

      {/* Head to Head */}
      {h2hSummary && h2hSummary.total > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-app-body-strong text-foreground">Onderlinge resultaten (laatste {h2hSummary.total})</h3>
          </div>

          {/* Visual H2H bar */}
          <div className="mb-4">
            <H2HVisualBar
              azWins={h2hSummary.azWins}
              draws={h2hSummary.draws}
              oppWins={h2hSummary.oppWins}
              total={h2hSummary.total}
              opponentName={opponent.name}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-app-data-lg font-mono text-primary">{h2hSummary.azWins}</div>
              <div className="text-app-tiny text-muted-foreground">AZ winst</div>
            </div>
            <div>
              <div className="text-app-data-lg font-mono text-warning">{h2hSummary.draws}</div>
              <div className="text-app-tiny text-muted-foreground">Gelijk</div>
            </div>
            <div>
              <div className="text-app-data-lg font-mono text-muted-foreground">{h2hSummary.oppWins}</div>
              <div className="text-app-tiny text-muted-foreground">{opponent.name}</div>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border pt-3">
            {h2hFixtures?.slice(0, 5).map((f: Fixture) => {
              const azHome = f.teams.home.id === AZ_TEAM_ID;
              const azGoals = azHome ? f.goals.home : f.goals.away;
              const oppGoals = azHome ? f.goals.away : f.goals.home;
              let res = "G";
              if (azGoals !== null && oppGoals !== null) {
                if (azGoals > oppGoals) res = "W";
                else if (azGoals < oppGoals) res = "V";
              }
              return (
                <div key={f.fixture.id} className="flex items-center justify-between text-app-small">
                  <span className="text-muted-foreground w-20">{format(new Date(f.fixture.date), "d MMM yy", { locale: nl })}</span>
                  <span className="flex-1 text-foreground">
                    {f.teams.home.name}
                    <span className={cn("font-mono font-bold mx-1.5", resultStyles[res])}>{f.goals.home} - {f.goals.away}</span>
                    {f.teams.away.name}
                  </span>
                  <img src={f.league.logo} alt="" className="h-4 w-4 object-contain opacity-40 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Context charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allFixtures && opponentRecent && opponentId && (
          <FormComparisonChart
            azFixtures={allFixtures}
            opponentFixtures={opponentRecent}
            opponentId={opponentId}
            opponentName={opponent.name}
          />
        )}
        {allFixtures && <GoalsTrendChart fixtures={allFixtures} />}
      </div>


      {/* Eredivisie stand context */}
      {isEredivisie && azStanding && oppStanding && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-app-body-strong text-foreground">Stand-context Eredivisie</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[azStanding, oppStanding].map(s => {
              const isAZ = s.team.id === AZ_TEAM_ID;
              return (
                <div key={s.team.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <img src={s.team.logo} alt="" className="h-5 w-5 object-contain" />
                    <span className={cn("text-app-body-strong", isAZ && "text-primary")}>{s.team.name}</span>
                    <span className="text-app-tiny text-muted-foreground">#{s.rank}</span>
                  </div>
                  <div className="space-y-1 text-app-small">
                    <div className="flex justify-between"><span className="text-muted-foreground">Punten</span><span className="font-mono text-foreground">{s.points}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Gespeeld</span><span className="font-mono text-foreground">{s.all.played}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">W-G-V</span><span className="font-mono text-foreground">{s.all.win}-{s.all.draw}-{s.all.lose}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Doelsaldo</span><span className={cn("font-mono", s.goalsDiff > 0 ? "text-success" : s.goalsDiff < 0 ? "text-danger" : "text-foreground")}>{s.goalsDiff > 0 ? "+" : ""}{s.goalsDiff}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Doelpunten</span><span className="font-mono text-foreground">{s.all.goals.for} - {s.all.goals.against}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Non-Eredivisie info banner */}
      {!isEredivisie && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-info shrink-0" />
          <div>
            <p className="text-app-body text-foreground">Europese wedstrijd</p>
            <p className="text-app-small text-muted-foreground">
              Dit is een {nextFixture.league.name}-wedstrijd. De Eredivisie stand-context is niet van toepassing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voorbeschouwing;
