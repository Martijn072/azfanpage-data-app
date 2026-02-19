import { EmbedLayout } from "@/components/embed/EmbedLayout";
import { H2HVisualBar } from "@/components/voorbeschouwing/H2HVisualBar";
import { useAZTeamId, useNextAZFixture } from "@/hooks/useFootballApi";
import { useHeadToHead } from "@/hooks/useHeadToHead";

const AZ_TEAM_ID = 201;

const EmbedH2H = () => {
  const { data: teamId } = useAZTeamId();
  const { data: nextFixture } = useNextAZFixture(teamId ?? null);

  const opponentId = nextFixture
    ? nextFixture.teams.home.id === AZ_TEAM_ID
      ? nextFixture.teams.away.id
      : nextFixture.teams.home.id
    : null;

  const opponentName = nextFixture
    ? nextFixture.teams.home.id === AZ_TEAM_ID
      ? nextFixture.teams.away.name
      : nextFixture.teams.home.name
    : "";

  const { data: h2hFixtures, isLoading } = useHeadToHead(AZ_TEAM_ID, opponentId);

  const azWins = h2hFixtures?.filter(f => {
    const azHome = f.teams.home.id === AZ_TEAM_ID;
    const azGoals = azHome ? f.goals.home : f.goals.away;
    const oppGoals = azHome ? f.goals.away : f.goals.home;
    return azGoals !== null && oppGoals !== null && azGoals > oppGoals;
  }).length ?? 0;

  const draws = h2hFixtures?.filter(f => f.goals.home === f.goals.away).length ?? 0;
  const oppWins = (h2hFixtures?.length ?? 0) - azWins - draws;
  const total = h2hFixtures?.length ?? 0;

  return (
    <EmbedLayout>
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Head-to-Head · AZ vs {opponentName || "..."}
        </h3>
        {isLoading ? (
          <div className="h-8 bg-muted rounded animate-pulse" />
        ) : total > 0 ? (
          <H2HVisualBar
            azWins={azWins}
            draws={draws}
            oppWins={oppWins}
            total={total}
            opponentName={opponentName}
          />
        ) : (
          <p className="text-app-small text-muted-foreground">Geen H2H data beschikbaar</p>
        )}
      </div>
    </EmbedLayout>
  );
};

export default EmbedH2H;
