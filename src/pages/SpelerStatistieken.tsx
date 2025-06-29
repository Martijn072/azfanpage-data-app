
import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AZPlayerStats } from "@/components/AZPlayerStats";
import { useAZTeamId } from "@/hooks/useFootballApi";
import { ErrorMessage } from "@/components/ErrorMessage";

const SpelerStatistieken = () => {
  const [activeTab, setActiveTab] = useState("spelers");
  const { data: teamId, isLoading: teamIdLoading, error: teamIdError, refetch: refetchTeamId } = useAZTeamId();

  if (teamIdError) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
        <Header />
        <div className="px-4 pt-6 pb-20">
          <ErrorMessage onRetry={() => refetchTeamId()} />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="px-4 pb-20 pt-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="max-w-4xl">
            <h1 className="headline-premium text-headline-xl mb-2 text-az-black dark:text-white leading-tight">
              Speler Statistieken
            </h1>
            <p className="text-premium-gray-500 dark:text-gray-400 text-sm font-light">
              2024-2025
            </p>
          </div>
        </div>

        {/* Player Statistics */}
        <div>
          <AZPlayerStats teamId={teamId} isLoadingTeamId={teamIdLoading} />
        </div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default SpelerStatistieken;
