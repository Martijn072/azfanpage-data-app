import { EmbedLayout } from "@/components/embed/EmbedLayout";
import { NextMatchCard } from "@/components/dashboard/NextMatchCard";
import { useAZTeamId, useNextAZFixture } from "@/hooks/useFootballApi";

const EmbedNextMatch = () => {
  const { data: teamId } = useAZTeamId();
  const { data: fixture, isLoading } = useNextAZFixture(teamId ?? null);

  return (
    <EmbedLayout>
      <NextMatchCard fixture={fixture} isLoading={isLoading} />
    </EmbedLayout>
  );
};

export default EmbedNextMatch;
