import { useAZFixtures } from "@/hooks/useFootballApi";
import { useFixtureStatistics } from "@/hooks/useFixtureStatistics";
import { useFixtureEvents } from "@/hooks/useFixtureEvents";
import { useFixtureLineups } from "@/hooks/useFixtureLineups";
import { useHeadToHead } from "@/hooks/useHeadToHead";
import { TeamLineup } from "@/hooks/useFixtureLineups";
import { FixtureEvent } from "@/hooks/useFixtureEvents";
import { StatComparisonBars } from "@/components/wedstrijd/StatComparisonBars";
import { EventsTimeline } from "@/components/wedstrijd/EventsTimeline";
import { FormationDisplay } from "@/components/wedstrijd/FormationDisplay";
import { Fixture, TeamStatistics } from "@/types/footballApi";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ArrowRight, Users, Target, Shield, AlertTriangle, Swords } from "lucide-react";

const AZ_TEAM_ID = 201;

type Tab = "statistieken" | "tijdlijn" | "opstelling";

const getStat = (teamStats: TeamStatistics, type: string): number => {
  const s = teamStats.statistics.find(s => s.type === type);
  if (!s || s.value === null || s.value === undefined) return 0;
  return parseFloat(String(s.value).replace("%", "")) || 0;
};

const resultStyles: Record<string, string> = {
  W: "text-success",
  G: "text-warning",
  V: "text-danger",
};

const Nabeschouwing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("statistieken");
  const { data: lastFixtures, isLoading: fixtureLoading } = useAZFixtures(AZ_TEAM_ID, 1);

  const fixture = lastFixtures?.[0] || null;
  const fixtureId = fixture?.fixture.id.toString() || null;

  const { data: stats, isLoading: statsLoading } = useFixtureStatistics(fixtureId);
  const { data: events, isLoading: eventsLoading } = useFixtureEvents(fixtureId);
  const { data: lineups, isLoading: lineupsLoading } = useFixtureLineups(fixtureId);

  const opponentId = useMemo(() => {
    if (!fixture) return null;
    return fixture.teams.home.id === AZ_TEAM_ID ? fixture.teams.away.id : fixture.teams.home.id;
  }, [fixture]);

  const { data: h2hFixtures } = useHeadToHead(AZ_TEAM_ID, opponentId);

  const isPlayed = fixture && (fixture.fixture.status.short === "FT" || fixture.fixture.status.short === "AET" || fixture.fixture.status.short === "PEN");

  const isAZHome = fixture ? fixture.teams.home.id === AZ_TEAM_ID : false;
  const azGoals = fixture ? (isAZHome ? fixture.goals.home : fixture.goals.away) : null;
  const oppGoals = fixture ? (isAZHome ? fixture.goals.away : fixture.goals.home) : null;
  const opponentName = fixture ? (isAZHome ? fixture.teams.away.name : fixture.teams.home.name) : "";

  let result: "W" | "G" | "V" = "G";
  if (azGoals !== null && oppGoals !== null) {
    if (azGoals > oppGoals) result = "W";
    else if (azGoals < oppGoals) result = "V";
  }
  const resultLabel = { W: "Winst", G: "Gelijk", V: "Verlies" };
  const resultColors = { W: "bg-success/15 text-success", G: "bg-warning/15 text-warning", V: "bg-danger/15 text-danger" };

  // H2H summary
  const h2hSummary = useMemo(() => {
    if (!h2hFixtures || h2hFixtures.length === 0) return null;
    let azWins = 0, draws = 0, oppWins = 0;
    h2hFixtures.forEach((f: Fixture) => {
      const azHome = f.teams.home.id === AZ_TEAM_ID;
      const ag = azHome ? f.goals.home : f.goals.away;
      const og = azHome ? f.goals.away : f.goals.home;
      if (ag !== null && og !== null) {
        if (ag > og) azWins++;
        else if (ag < og) oppWins++;
        else draws++;
      }
    });
    return { azWins, draws, oppWins, total: h2hFixtures.length };
  }, [h2hFixtures]);

  // Generate rich insights from stats, events, and lineups
  const insights = useMemo(() => {
    if (!fixture || !isPlayed) return [];
    const items: { icon: typeof Target; text: string; type: "info" | "success" | "warning" | "danger" }[] = [];

    // Result insight
    if (azGoals !== null && oppGoals !== null) {
      if (azGoals > oppGoals) {
        items.push({ icon: Target, text: `Overwinning: ${azGoals}-${oppGoals} tegen ${opponentName}`, type: "success" });
      } else if (azGoals < oppGoals) {
        items.push({ icon: AlertTriangle, text: `Verlies: ${azGoals}-${oppGoals} tegen ${opponentName}`, type: "danger" });
      } else {
        items.push({ icon: Target, text: `Gelijkspel: ${azGoals}-${oppGoals} tegen ${opponentName}`, type: "warning" });
      }
    }

    // Halftime vs fulltime
    if (fixture.score.halftime.home !== null && fixture.score.halftime.away !== null) {
      const htAZ = isAZHome ? fixture.score.halftime.home : fixture.score.halftime.away;
      const htOpp = isAZHome ? fixture.score.halftime.away : fixture.score.halftime.home;
      if (htAZ < htOpp && azGoals !== null && oppGoals !== null && azGoals >= oppGoals) {
        items.push({ icon: Target, text: `Comeback: AZ stond achter bij rust (${htAZ}-${htOpp})`, type: "success" });
      }
    }

    // Stats-based insights
    if (stats && stats.length >= 2) {
      const azStats = stats.find(s => s.team.id === AZ_TEAM_ID);
      const oppStats = stats.find(s => s.team.id !== AZ_TEAM_ID);
      if (azStats && oppStats) {
        // xG insight
        const azXG = getStat(azStats, "expected_goals");
        const oppXG = getStat(oppStats, "expected_goals");
        if (azXG > 0 || oppXG > 0) {
          const xgDiff = azGoals !== null ? azGoals - azXG : 0;
          if (xgDiff > 0.5) {
            items.push({ icon: Target, text: `AZ overtrof xG: ${azGoals} goals bij ${azXG.toFixed(2)} xG (+${xgDiff.toFixed(2)})`, type: "success" });
          } else if (xgDiff < -0.5) {
            items.push({ icon: AlertTriangle, text: `AZ ondermaats qua xG: ${azGoals} goals bij ${azXG.toFixed(2)} xG (${xgDiff.toFixed(2)})`, type: "warning" });
          } else {
            items.push({ icon: BarChart3, text: `xG: AZ ${azXG.toFixed(2)} – ${opponentName} ${oppXG.toFixed(2)}`, type: "info" });
          }
        }

        const azPoss = getStat(azStats, "Ball Possession");
        const oppPoss = getStat(oppStats, "Ball Possession");
        if (azPoss >= 60) items.push({ icon: BarChart3, text: `Balbezit-dominantie: ${azPoss}% voor AZ`, type: "info" });
        else if (oppPoss >= 60) items.push({ icon: BarChart3, text: `${opponentName} domineerde het balbezit (${oppPoss}%)`, type: "warning" });

        const azShots = getStat(azStats, "Total Shots");
        const oppShots = getStat(oppStats, "Total Shots");
        const azOnTarget = getStat(azStats, "Shots on Goal");

        if (azShots >= oppShots * 1.5) items.push({ icon: Target, text: `AZ was dreigender: ${azShots} schoten vs ${oppShots}`, type: "info" });
        if (azOnTarget > 0 && azGoals !== null && azGoals > 0) {
          const conversion = Math.round((azGoals / azOnTarget) * 100);
          if (conversion >= 50) items.push({ icon: Target, text: `Hoge conversie: ${conversion}% van de schoten op doel erin`, type: "success" });
        }

        const azCorners = getStat(azStats, "Corner Kicks");
        const oppCorners = getStat(oppStats, "Corner Kicks");
        if (azCorners >= oppCorners * 2 && azCorners >= 6) items.push({ icon: BarChart3, text: `Corners: ${azCorners}-${oppCorners} in voordeel AZ`, type: "info" });

        const azPassAcc = getStat(azStats, "Passes %");
        if (azPassAcc >= 85) items.push({ icon: Shield, text: `Nauwkeurig passing: ${azPassAcc}% pass-percentage`, type: "info" });
      }
    }

    // Events-based insights
    if (events && events.length > 0) {
      const azGoalEvents = events.filter((e: FixtureEvent) => e.team.id === AZ_TEAM_ID && e.type === "Goal" && e.detail !== "Missed Penalty");
      const azCards = events.filter((e: FixtureEvent) => e.team.id === AZ_TEAM_ID && e.type === "Card");
      const yellowCards = azCards.filter((e: FixtureEvent) => e.detail === "Yellow Card");
      const redCards = azCards.filter((e: FixtureEvent) => e.detail === "Red Card" || e.detail === "Second Yellow card");

      if (azGoalEvents.length > 0) {
        const scorers = azGoalEvents.map((e: FixtureEvent) => `${e.player.name.split(" ").pop()} (${e.time.elapsed}')`).join(", ");
        items.push({ icon: Target, text: `Doelpuntenmakers: ${scorers}`, type: "success" });
      }

      const lateGoals = azGoalEvents.filter((e: FixtureEvent) => e.time.elapsed >= 80);
      if (lateGoals.length > 0) {
        items.push({ icon: Target, text: `Late treffer in minuut ${lateGoals.map((e: FixtureEvent) => e.time.elapsed + "'").join(", ")}`, type: "success" });
      }

      if (redCards.length > 0) {
        items.push({ icon: AlertTriangle, text: `Rode kaart voor ${redCards.map((e: FixtureEvent) => e.player.name.split(" ").pop()).join(", ")}`, type: "danger" });
      }
      if (yellowCards.length >= 3) {
        items.push({ icon: AlertTriangle, text: `${yellowCards.length} gele kaarten voor AZ`, type: "warning" });
      }
    }

    // Lineup insight
    if (lineups && lineups.length >= 2) {
      const azLineup = lineups.find((l: TeamLineup) => l.team.id === AZ_TEAM_ID);
      if (azLineup) {
        items.push({ icon: Users, text: `Formatie: ${azLineup.formation}`, type: "info" });
      }
    }

    return items.slice(0, 10);
  }, [fixture, stats, events, lineups, isPlayed, azGoals, oppGoals, isAZHome, opponentName]);

  // Goal scorers with player IDs for linking
  const goalScorers = useMemo(() => {
    if (!events) return [];
    return events.filter((e: FixtureEvent) => e.type === "Goal" && e.detail !== "Missed Penalty");
  }, [events]);

  // Key lineup highlights
  const lineupHighlights = useMemo(() => {
    if (!lineups || lineups.length < 2 || !events) return null;
    const azLineup = lineups.find((l: TeamLineup) => l.team.id === AZ_TEAM_ID);
    if (!azLineup) return null;

    const substitutions = events.filter((e: FixtureEvent) => e.type === "subst" && e.team.id === AZ_TEAM_ID);

    return {
      formation: azLineup.formation,
      coach: azLineup.coach?.name || "Onbekend",
      starters: azLineup.startXI.length,
      subs: substitutions.length,
      subDetails: substitutions.map((e: FixtureEvent) => ({
        in: e.assist?.name?.split(" ").pop() || "?",
        out: e.player.name.split(" ").pop() || "?",
        minute: e.time.elapsed,
      })),
    };
  }, [lineups, events]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "statistieken", label: "Statistieken" },
    { key: "tijdlijn", label: "Tijdlijn" },
    { key: "opstelling", label: "Opstelling" },
  ];

  if (fixtureLoading) {
    return (
      <div className="space-y-6">
        <div><h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Nabeschouwing</h2></div>
        <div className="bg-card border border-border rounded-xl p-6 animate-pulse h-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 animate-pulse h-40" />
          <div className="bg-card border border-border rounded-xl p-4 animate-pulse h-40" />
        </div>
      </div>
    );
  }

  if (!fixture || !isPlayed) {
    return (
      <div className="space-y-6">
        <div><h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Nabeschouwing</h2></div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-app-body text-muted-foreground">Geen recente gespeelde wedstrijd gevonden</p>
        </div>
      </div>
    );
  }

  const iconColors = { info: "text-info", success: "text-success", warning: "text-warning", danger: "text-danger" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Nabeschouwing</h2>
          <p className="text-app-small text-muted-foreground">Analyse van de laatste wedstrijd</p>
        </div>
        <button
          onClick={() => navigate(`/wedstrijden/${fixture.fixture.id}`)}
          className="flex items-center gap-1 text-app-small text-primary hover:underline"
        >
          Volledig detail <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Match header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={fixture.league.logo} alt="" className="h-4 w-4 object-contain" />
            <span className="text-app-tiny text-muted-foreground">{fixture.league.name} · {fixture.league.round}</span>
          </div>
          <span className={cn("text-app-tiny px-2 py-0.5 rounded-full font-medium", resultColors[result])}>
            {resultLabel[result]}
          </span>
        </div>
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-3 flex-1 justify-end">
            <span className={cn("text-app-heading text-right", fixture.teams.home.id === AZ_TEAM_ID && "text-primary font-bold")}>
              {fixture.teams.home.name}
            </span>
            <img src={fixture.teams.home.logo} alt="" className="h-12 w-12 object-contain" />
          </div>
          <div className="text-center shrink-0">
            <div className="text-app-data-lg font-mono text-foreground tracking-tight">
              {fixture.goals.home} — {fixture.goals.away}
            </div>
            <div className="text-app-tiny text-muted-foreground">
              HT: {fixture.score.halftime.home} - {fixture.score.halftime.away}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <img src={fixture.teams.away.logo} alt="" className="h-12 w-12 object-contain" />
            <span className={cn("text-app-heading", fixture.teams.away.id === AZ_TEAM_ID && "text-primary font-bold")}>
              {fixture.teams.away.name}
            </span>
          </div>
        </div>

        {/* Clickable goal scorers */}
        {goalScorers.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 pt-4 border-t border-border">
            {goalScorers.map((g, i) => (
              <button
                key={i}
                onClick={() => g.player.id && g.team.id === AZ_TEAM_ID && navigate(`/spelers/${g.player.id}`)}
                className={cn(
                  "text-app-small",
                  g.team.id === AZ_TEAM_ID ? "text-primary hover:underline cursor-pointer" : "text-muted-foreground cursor-default"
                )}
              >
                ⚽ {g.player.name} {g.time.elapsed}'{g.time.extra ? `+${g.time.extra}` : ""}
                {g.detail === "Penalty" && " (P)"}
                {g.detail === "Own Goal" && " (e.d.)"}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 text-center text-app-tiny text-muted-foreground">
          {format(new Date(fixture.fixture.date), "EEEE d MMMM yyyy · HH:mm", { locale: nl })}
          {fixture.fixture.venue && ` · ${fixture.fixture.venue.name}`}
          {fixture.fixture.referee && ` · ${fixture.fixture.referee}`}
        </div>
      </div>

      {/* Insights + lineup highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Data highlights */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-info" />
            <h3 className="text-app-body-strong text-foreground">Data-highlights</h3>
          </div>
          {insights.length > 0 ? (
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="text-app-small text-muted-foreground flex items-start gap-2">
                  <insight.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", iconColors[insight.type])} />
                  <span>{insight.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-5 bg-muted rounded w-3/4" />)}
            </div>
          )}
        </div>

        {/* Lineup highlights */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-app-body-strong text-foreground">Opstelling</h3>
          </div>
          {lineupHighlights ? (
            <div className="space-y-3">
              <div className="flex justify-between text-app-small">
                <span className="text-muted-foreground">Formatie</span>
                <span className="font-mono text-foreground font-semibold">{lineupHighlights.formation}</span>
              </div>
              <div className="flex justify-between text-app-small">
                <span className="text-muted-foreground">Coach</span>
                <span className="text-foreground">{lineupHighlights.coach}</span>
              </div>
              {lineupHighlights.subs > 0 && (
                <>
                  <div className="border-t border-border pt-2">
                    <span className="text-app-tiny text-muted-foreground uppercase tracking-wider">Wissels ({lineupHighlights.subs})</span>
                  </div>
                  <div className="space-y-1.5">
                    {lineupHighlights.subDetails.map((sub, i) => (
                      <div key={i} className="flex items-center justify-between text-app-small">
                        <span className="text-foreground">
                          <span className="text-success">↑</span> {sub.in} <span className="text-danger">↓</span> {sub.out}
                        </span>
                        <span className="text-muted-foreground font-mono text-app-tiny">{sub.minute}'</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : lineupsLoading ? (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-5 bg-muted rounded w-full" />)}
            </div>
          ) : (
            <p className="text-app-small text-muted-foreground">Geen opstellingsdata</p>
          )}
        </div>
      </div>

      {/* H2H context */}
      {h2hSummary && h2hSummary.total > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-app-body-strong text-foreground">Onderlinge historie (laatste {h2hSummary.total})</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mb-3">
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
              <div className="text-app-tiny text-muted-foreground">{opponentName}</div>
            </div>
          </div>
          <div className="space-y-1.5 border-t border-border pt-3">
            {h2hFixtures?.slice(0, 5).map((f: Fixture) => {
              const azHome = f.teams.home.id === AZ_TEAM_ID;
              const ag = azHome ? f.goals.home : f.goals.away;
              const og = azHome ? f.goals.away : f.goals.home;
              let res = "G";
              if (ag !== null && og !== null) {
                if (ag > og) res = "W";
                else if (ag < og) res = "V";
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

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-1.5 rounded-md text-app-body transition-colors duration-150",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-card border border-border rounded-xl p-6">
        {activeTab === "statistieken" && (
          statsLoading ? (
            <div className="space-y-4 animate-pulse">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-6 bg-muted rounded w-full" />)}</div>
          ) : stats && stats.length >= 2 ? (
            <StatComparisonBars stats={stats} homeTeamId={fixture.teams.home.id} />
          ) : (
            <p className="text-app-body text-muted-foreground text-center py-8">Geen statistieken beschikbaar</p>
          )
        )}
        {activeTab === "tijdlijn" && (
          eventsLoading ? (
            <div className="space-y-2 animate-pulse">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-8 bg-muted rounded w-full" />)}</div>
          ) : (
            <EventsTimeline events={events || []} homeTeamId={fixture.teams.home.id} />
          )
        )}
        {activeTab === "opstelling" && (
          lineupsLoading ? (
            <div className="grid grid-cols-2 gap-6"><div className="h-80 bg-muted rounded-xl animate-pulse" /><div className="h-80 bg-muted rounded-xl animate-pulse" /></div>
          ) : (
            <FormationDisplay lineups={lineups || []} homeTeamId={fixture.teams.home.id} />
          )
        )}
      </div>
    </div>
  );
};

export default Nabeschouwing;
