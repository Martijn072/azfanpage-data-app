import { useParams } from "react-router-dom";
import { EmbedLayout } from "@/components/embed/EmbedLayout";
import { StatComparisonBars } from "@/components/wedstrijd/StatComparisonBars";
import { useFixtureStatistics } from "@/hooks/useFixtureStatistics";
import { useQuery } from "@tanstack/react-query";
import { callFootballApi } from "@/utils/footballApiClient";
import { FootballApiResponse, Fixture } from "@/types/footballApi";

const EmbedMatchStats = () => {
  const { id } = useParams<{ id: string }>();

  const { data: fixtureData } = useQuery({
    queryKey: ["embed-fixture", id],
    queryFn: async () => {
      const response: FootballApiResponse<Fixture> = await callFootballApi("/fixtures", {
        id: id!,
      });
      return response.response[0] ?? null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: stats, isLoading } = useFixtureStatistics(id ?? null);

  const homeTeamId = fixtureData?.teams.home.id ?? 0;

  return (
    <EmbedLayout>
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Wedstrijdstatistieken
        </h3>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : stats && stats.length >= 2 ? (
          <StatComparisonBars stats={stats} homeTeamId={homeTeamId} />
        ) : (
          <p className="text-app-small text-muted-foreground">Geen statistieken beschikbaar</p>
        )}
      </div>
    </EmbedLayout>
  );
};

export default EmbedMatchStats;
