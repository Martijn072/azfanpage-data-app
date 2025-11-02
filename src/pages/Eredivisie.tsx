
import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EredivisieStandings } from "@/components/EredivisieStandings";
import { TopScorersWidget } from "@/components/TopScorersWidget";
import { FormIndicator } from "@/components/FormIndicator";
import { getCurrentActiveSeason } from "@/utils/seasonUtils";
import { Calendar } from "lucide-react";

const Eredivisie = () => {
  const [activeTab, setActiveTab] = useState("eredivisie");
  const seasonInfo = getCurrentActiveSeason();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="px-4 pb-20 pt-6 space-y-6">
        {/* Season Info & AZ Form */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-premium-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Seizoen {seasonInfo.displaySeason}</span>
            </div>
            <FormIndicator />
          </div>
        </div>

        {/* Eredivisie Standings */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <EredivisieStandings />
        </div>

        {/* Top Scorers */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <TopScorersWidget />
        </div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Eredivisie;
