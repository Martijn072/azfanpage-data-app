import { useParams, useNavigate } from "react-router-dom";
import { useFixtureStatistics } from "@/hooks/useFixtureStatistics";
import { useFixtureEvents } from "@/hooks/useFixtureEvents";
import { useFixtureLineups } from "@/hooks/useFixtureLineups";
import { useTeamFixtures } from "@/hooks/useTeamFixtures";
import { StatComparisonBars } from "@/components/wedstrijd/StatComparisonBars";
import { EventsTimeline } from "@/components/wedstrijd/EventsTimeline";
import { FormationDisplay } from "@/components/wedstrijd/FormationDisplay";
import { Fixture } from "@/types/footballApi";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";

const AZ_TEAM_ID = 201;

type Tab = "statistieken" | "tijdlijn" | "opstelling";

const WedstrijdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("statistieken");

  // Fetch fixture data from existing team fixtures
  const { data: fixtures } = useTeamFixtures(AZ_TEAM_ID);
  
  const fixture = useMemo(() => {
    return fixtures?.find((f: Fixture) => f.fixture.id.toString() === id) || null;
  }, [fixtures, id]);

  const { data: stats, isLoading: statsLoading } = useFixtureStatistics(id || null);
  const { data: events, isLoading: eventsLoading } = useFixtureEvents(id || null);
  const { data: lineups, isLoading: lineupsLoading } = useFixtureLineups(id || null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "statistieken", label: "Statistieken" },
    { key: "tijdlijn", label: "Tijdlijn" },
    { key: "opstelling", label: "Opstelling" },
  ];

  const isPlayed = fixture && (fixture.fixture.status.short === "FT" || fixture.fixture.status.short === "AET" || fixture.fixture.status.short === "PEN");

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
          <div className="text-center mb-4">
            <div className="text-app-tiny text-muted-foreground mb-1">
              {fixture.league.name} · {fixture.league.round}
            </div>
            <div className="text-app-tiny text-muted-foreground">
              {format(new Date(fixture.fixture.date), "EEEE d MMMM yyyy · HH:mm", { locale: nl })}
              {fixture.fixture.venue && ` · ${fixture.fixture.venue.name}`}
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3 flex-1 justify-end">
              <span className={cn(
                "text-app-heading text-right",
                fixture.teams.home.id === AZ_TEAM_ID && "text-primary font-bold"
              )}>
                {fixture.teams.home.name}
              </span>
              <img src={fixture.teams.home.logo} alt="" className="h-12 w-12 object-contain" />
            </div>

            {isPlayed ? (
              <div className="text-center shrink-0">
                <div className="text-app-data-lg font-mono text-foreground tracking-tight">
                  {fixture.goals.home} — {fixture.goals.away}
                </div>
                <div className="text-app-tiny text-muted-foreground">
                  HT: {fixture.score.halftime.home} - {fixture.score.halftime.away}
                </div>
              </div>
            ) : (
              <div className="text-app-data-lg font-mono text-muted-foreground">vs</div>
            )}

            <div className="flex items-center gap-3 flex-1">
              <img src={fixture.teams.away.logo} alt="" className="h-12 w-12 object-contain" />
              <span className={cn(
                "text-app-heading",
                fixture.teams.away.id === AZ_TEAM_ID && "text-primary font-bold"
              )}>
                {fixture.teams.away.name}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 animate-pulse h-32" />
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
