import { useNextAZFixture, useAZFixtures, useEredivisieStandings } from "@/hooks/useFootballApi";
import { NextMatchCard } from "@/components/dashboard/NextMatchCard";
import { LastMatchCard } from "@/components/dashboard/LastMatchCard";
import { StandingsWidget } from "@/components/dashboard/StandingsWidget";

const AZ_TEAM_ID = 201;

const Dashboard = () => {
  const { data: nextFixture, isLoading: nextLoading } = useNextAZFixture(AZ_TEAM_ID);
  const { data: lastFixtures, isLoading: lastLoading } = useAZFixtures(AZ_TEAM_ID, 1);
  const { data: standings, isLoading: standingsLoading } = useEredivisieStandings();

  const lastFixture = lastFixtures?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-app-title tracking-tight text-foreground mb-1">Dashboard</h2>
        <p className="text-app-small text-muted-foreground">
          Overzicht van de laatste en komende AZ-wedstrijden
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NextMatchCard fixture={nextFixture} isLoading={nextLoading} />
        <LastMatchCard fixture={lastFixture} isLoading={lastLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Placeholder for future content */}
          <div className="bg-card border border-border rounded-xl p-4 h-48 flex items-center justify-center">
            <p className="text-app-small text-muted-foreground">Data highlights — binnenkort beschikbaar</p>
          </div>
        </div>
        <StandingsWidget standings={standings} isLoading={standingsLoading} />
      </div>
    </div>
  );
};

export default Dashboard;
