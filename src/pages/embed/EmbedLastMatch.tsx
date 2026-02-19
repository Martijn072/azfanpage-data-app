import { EmbedLayout } from "@/components/embed/EmbedLayout";
import { LastMatchCard } from "@/components/dashboard/LastMatchCard";
import { useAZTeamId, useAZFixtures } from "@/hooks/useFootballApi";

const EmbedLastMatch = () => {
  const { data: teamId } = useAZTeamId();
  const { data: fixtures, isLoading } = useAZFixtures(teamId ?? null, 1);

  return (
    <EmbedLayout>
      <LastMatchCard fixture={fixtures?.[0]} isLoading={isLoading} />
    </EmbedLayout>
  );
};

export default EmbedLastMatch;
