import { EmbedLayout } from "@/components/embed/EmbedLayout";
import { StandingsWidget } from "@/components/dashboard/StandingsWidget";
import { useEredivisieStandings } from "@/hooks/useStandingHooks";

const EmbedStandings = () => {
  const { data: standings, isLoading } = useEredivisieStandings();

  return (
    <EmbedLayout>
      <StandingsWidget standings={standings} isLoading={isLoading} compact hideLink />
    </EmbedLayout>
  );
};

export default EmbedStandings;
