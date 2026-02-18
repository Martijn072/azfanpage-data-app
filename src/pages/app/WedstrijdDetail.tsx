import { useParams, useNavigate } from "react-router-dom";
import { useFixtureStatistics } from "@/hooks/useFixtureStatistics";
import { useFixtureEvents } from "@/hooks/useFixtureEvents";
import { useFixtureLineups } from "@/hooks/useFixtureLineups";
import { useTeamFixtures, useTeamNextFixtures } from "@/hooks/useTeamFixtures";
import { useHeadToHead } from "@/hooks/useHeadToHead";
import { StatComparisonBars } from "@/components/wedstrijd/StatComparisonBars";
import { EventsTimeline } from "@/components/wedstrijd/EventsTimeline";
import { FormationDisplay } from "@/components/wedstrijd/FormationDisplay";
import { Fixture } from "@/types/footballApi";
import { FixtureEvent } from "@/hooks/useFixtureEvents";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { ArrowLeft, MapPin, User, Trophy, Clock, Swords } from "lucide-react";

const AZ_TEAM_ID = 201;

type Tab = "statistieken" | "tijdlijn" | "opstelling";

const WedstrijdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("statistieken");

  const { data: playedFixtures } = useTeamFixtures(AZ_TEAM_ID);
  const { data: nextFixtures } = useTeamNextFixtures(AZ_TEAM_ID, 10);

  const fixture = useMemo(() => {
    const all = [...(playedFixtures || []), ...(nextFixtures || [])];
    return all.find((f: Fixture) => f.fixture.id.toString() === id) || null;
  }, [playedFixtures, nextFixtures, id]);

  const opponentId = useMemo(() => {
    if (!fixture) return null;
    return fixture.teams.home.id === AZ_TEAM_ID ? fixture.teams.away.id : fixture.teams.home.id;
  }, [fixture]);

  const { data: stats, isLoading: statsLoading } = useFixtureStatistics(id || null);
  const { data: events, isLoading: eventsLoading } = useFixtureEvents(id || null);
  const { data: lineups, isLoading: lineupsLoading } = useFixtureLineups(id || null);
  const { data: h2hFixtures } = useHeadToHead(AZ_TEAM_ID, opponentId);

  const isPlayed = fixture && ["FT", "AET", "PEN"].includes(fixture.fixture.status.short);

  // Extract goal scorers from events
  const goalScorers = useMemo(() => {
    if (!events) return [];
    return events.filter((e: FixtureEvent) => e.type === "Goal");
  }, [events]);

  // Derive result for AZ
  const result = useMemo(() => {
    if (!fixture || !isPlayed) return null;
    const isAZHome = fixture.teams.home.id === AZ_TEAM_ID;
    const azGoals = isAZHome ? fixture.goals.home : fixture.goals.away;
    const oppGoals = isAZHome ? fixture.goals.away : fixture.goals.home;
    if (azGoals === null || oppGoals === null) return null;
    if (azGoals > oppGoals) return "W";
    if (azGoals < oppGoals) return "V";
    return "G";
  }, [fixture, isPlayed]);

  const resultLabel: Record<string, { text: string; class: string }> = {
    W: { text: "Winst", class: "bg-success/15 text-success" },
    G: { text: "Gelijk", class: "bg-warning/15 text-warning" },
    V: { text: "Verlies", class: "bg-danger/15 text-danger" },
  };

  // Data highlights from stats
  const highlights = useMemo(() => {
    if (!stats || stats.length < 2 || !fixture) return [];
    const items: string[] = [];
    const isAZHome = fixture.teams.home.id === AZ_TEAM_ID;
    const azStats = stats.find(s => s.team.id === AZ_TEAM_ID);
    const oppStats = stats.find(s => s.team.id !== AZ_TEAM_ID);
    if (!azStats || !oppStats) return items;

    const getStat = (team: typeof azStats, key: string) => {
      const s = team.statistics.find(st => st.type === key);
      if (!s || !s.value) return 0;
      return parseFloat(String(s.value).replace("%", "")) || 0;
    };

    const azPoss = getStat(azStats, "Ball Possession");
    const oppPoss = getStat(oppStats, "Ball Possession");
    if (azPoss > 60) items.push(`AZ domineerde balbezit met ${azPoss}%`);
    else if (oppPoss > 60) items.push(`Tegenstander had het overwicht in balbezit (${oppPoss}%)`);

    const azShots = getStat(azStats, "Total Shots");
    const oppShots = getStat(oppStats, "Total Shots");
    if (azShots > oppShots * 2) items.push(`AZ creëerde fors meer kansen: ${azShots} schoten vs ${oppShots}`);

    const azOnTarget = getStat(azStats, "Shots on Goal");
    const oppOnTarget = getStat(oppStats, "Shots on Goal");
    if (azOnTarget > 0 && fixture.goals.home !== null) {
      const azGoals = isAZHome ? fixture.goals.home : fixture.goals.away;
      if (azGoals !== null && azOnTarget > 0) {
        const conversion = Math.round((azGoals / azShots) * 100);
        if (conversion > 25) items.push(`Hoge conversie: ${conversion}% van de schoten resulteerde in een goal`);
      }
    }

    const azCorners = getStat(azStats, "Corner Kicks");
    const oppCorners = getStat(oppStats, "Corner Kicks");
    if (azCorners > oppCorners + 5) items.push(`AZ dwong veel corners af: ${azCorners} vs ${oppCorners}`);

    return items;
  }, [stats, fixture]);

  // H2H summary
  const h2hSummary = useMemo(() => {
    if (!h2hFixtures || h2hFixtures.length === 0) return null;
    let azWins = 0, draws = 0, oppWins = 0;
    h2hFixtures.forEach((f: Fixture) => {
      const azHome = f.teams.home.id === AZ_TEAM_ID;
      const azGoals = azHome ? f.goals.home : f.goals.away;
      const oppGoals = azHome ? f.goals.away : f.goals.home;
      if (azGoals === null || oppGoals === null) return;
      if (azGoals > oppGoals) azWins++;
      else if (azGoals < oppGoals) oppWins++;
      else draws++;
    });
    return { total: h2hFixtures.length, azWins, draws, oppWins };
  }, [h2hFixtures]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "statistieken", label: "Statistieken" },
    { key: "tijdlijn", label: "Tijdlijn" },
    { key: "opstelling", label: "Opstelling" },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/wedstrijden")}
        className="flex items-center gap-2 text-app-body text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar wedstrijden
      </button>

      {/* Match header */}
      {fixture ? (
        <div className="bg-card border border-border rounded-xl p-6">
          {/* Competition & meta */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={fixture.league.logo} alt="" className="h-5 w-5 object-contain" />
            <span className="text-app-small text-muted-foreground">{fixture.league.name}</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-app-small text-muted-foreground">{fixture.league.round}</span>
          </div>

          {/* Score / vs */}
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3 flex-1 justify-end">
              <span className={cn(
                "text-app-heading text-right hidden sm:block",
                fixture.teams.home.id === AZ_TEAM_ID && "text-primary font-bold"
              )}>
                {fixture.teams.home.name}
              </span>
              <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="h-14 w-14 object-contain" />
            </div>

            {isPlayed ? (
              <div className="text-center shrink-0">
                <div className="font-mono text-4xl font-bold text-foreground tracking-tight">
                  {fixture.goals.home} — {fixture.goals.away}
                </div>
                <div className="text-app-small text-muted-foreground mt-1">
                  HT: {fixture.score.halftime.home} - {fixture.score.halftime.away}
                </div>
                {result && (
                  <span className={cn("inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full", resultLabel[result].class)}>
                    {resultLabel[result].text}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-center shrink-0">
                <div className="font-mono text-3xl text-muted-foreground">vs</div>
                <div className="text-app-small text-muted-foreground mt-1">
                  {format(new Date(fixture.fixture.date), "HH:mm")}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 flex-1">
              <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="h-14 w-14 object-contain" />
              <span className={cn(
                "text-app-heading hidden sm:block",
                fixture.teams.away.id === AZ_TEAM_ID && "text-primary font-bold"
              )}>
                {fixture.teams.away.name}
              </span>
            </div>
          </div>

          {/* Mobile team names */}
          <div className="flex justify-between sm:hidden mt-3">
            <span className={cn("text-app-body", fixture.teams.home.id === AZ_TEAM_ID && "text-primary font-semibold")}>
              {fixture.teams.home.name}
            </span>
            <span className={cn("text-app-body", fixture.teams.away.id === AZ_TEAM_ID && "text-primary font-semibold")}>
              {fixture.teams.away.name}
            </span>
          </div>

          {/* Goal scorers */}
          {goalScorers.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 pt-4 border-t border-border">
              {goalScorers.map((g, i) => (
                <span key={i} className="text-app-small text-muted-foreground">
                  ⚽ {g.player.name} {g.time.elapsed}'{g.time.extra ? `+${g.time.extra}` : ""}
                  {g.detail === "Penalty" && " (P)"}
                  {g.detail === "Own Goal" && " (e.d.)"}
                </span>
              ))}
            </div>
          )}

          {/* Match info bar */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-border text-app-small text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(fixture.fixture.date), "EEEE d MMMM yyyy", { locale: nl })}
            </span>
            {fixture.fixture.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {fixture.fixture.venue.name}
              </span>
            )}
            {fixture.fixture.referee && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {fixture.fixture.referee}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 animate-pulse h-40" />
      )}

      {/* Side-by-side: H2H + Highlights */}
      {isPlayed && (h2hSummary || highlights.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Data highlights */}
          {highlights.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-app-body font-semibold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Data-highlights
              </h3>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-app-small text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* H2H */}
          {h2hSummary && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-app-body font-semibold text-foreground mb-3 flex items-center gap-2">
                <Swords className="h-4 w-4 text-muted-foreground" /> Onderlinge historie
              </h3>
              <p className="text-app-small text-muted-foreground mb-3">
                Laatste {h2hSummary.total} ontmoetingen
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-mono text-xl font-bold text-success">{h2hSummary.azWins}</p>
                  <p className="text-[11px] text-muted-foreground">AZ wint</p>
                </div>
                <div>
                  <p className="font-mono text-xl font-bold text-warning">{h2hSummary.draws}</p>
                  <p className="text-[11px] text-muted-foreground">Gelijk</p>
                </div>
                <div>
                  <p className="font-mono text-xl font-bold text-danger">{h2hSummary.oppWins}</p>
                  <p className="text-[11px] text-muted-foreground">Verlies</p>
                </div>
              </div>
              {/* Last 5 H2H results */}
              {h2hFixtures && h2hFixtures.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  {h2hFixtures.slice(0, 5).map((f: Fixture) => {
                    const azHome = f.teams.home.id === AZ_TEAM_ID;
                    const azG = azHome ? f.goals.home : f.goals.away;
                    const oppG = azHome ? f.goals.away : f.goals.home;
                    const r = azG !== null && oppG !== null ? (azG > oppG ? "W" : azG < oppG ? "V" : "G") : null;
                    return (
                      <div key={f.fixture.id} className="flex items-center gap-2 text-app-small">
                        {r && <span className={cn("w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold", resultLabel[r].class)}>{r}</span>}
                        <span className="text-muted-foreground flex-1">{f.teams.home.name} {f.goals.home}-{f.goals.away} {f.teams.away.name}</span>
                        <span className="text-muted-foreground/50 text-[11px]">{format(new Date(f.fixture.date), "dd-MM-yy")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      {isPlayed && (
        <>
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
                <div className="space-y-4 animate-pulse">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-6 bg-muted rounded w-full" />
                  ))}
                </div>
              ) : stats && stats.length >= 2 ? (
                <StatComparisonBars stats={stats} homeTeamId={fixture!.teams.home.id} />
              ) : (
                <p className="text-app-body text-muted-foreground text-center py-8">
                  Geen statistieken beschikbaar
                </p>
              )
            )}

            {activeTab === "tijdlijn" && (
              eventsLoading ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 bg-muted rounded w-full" />
                  ))}
                </div>
              ) : (
                <EventsTimeline events={events || []} homeTeamId={fixture!.teams.home.id} />
              )
            )}

            {activeTab === "opstelling" && (
              lineupsLoading ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-80 bg-muted rounded-xl animate-pulse" />
                  <div className="h-80 bg-muted rounded-xl animate-pulse" />
                </div>
              ) : (
                <FormationDisplay lineups={lineups || []} homeTeamId={fixture!.teams.home.id} />
              )
            )}
          </div>
        </>
      )}

      {!isPlayed && fixture && (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-app-body text-muted-foreground">
            Statistieken worden beschikbaar na afloop van de wedstrijd
          </p>
        </div>
      )}
    </div>
  );
};

export default WedstrijdDetail;
