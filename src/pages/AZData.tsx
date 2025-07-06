import { useState } from "react";
import { Calendar, Table, Trophy, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NextMatchWidget } from "@/components/NextMatchWidget";
import { AZFixtures } from "@/components/AZFixtures";
import { EredivisieStandings } from "@/components/EredivisieStandings";
import { ConferenceLeagueStandings } from "@/components/ConferenceLeagueStandings";
import { ConferenceLeagueFixtures } from "@/components/ConferenceLeagueFixtures";
import { AZPlayerStats } from "@/components/AZPlayerStats";

const AZData = () => {
  const [activeTab, setActiveTab] = useState("azdata");
  const [dataTab, setDataTab] = useState("programma");
  
  // AZ team ID (this should match the actual AZ team ID from the API)
  const azTeamId = 785;

  return (
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pb-20">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-az-black dark:text-white mb-4">
            AZ Data
          </h1>
          
          <Tabs value={dataTab} onValueChange={setDataTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger 
                value="programma" 
                className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-az-red data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Programma</span>
                <span className="sm:hidden">Prog</span>
              </TabsTrigger>
              <TabsTrigger 
                value="eredivisie"
                className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-az-red data-[state=active]:text-white"
              >
                <Table className="w-4 h-4" />
                <span className="hidden sm:inline">Eredivisie</span>
                <span className="sm:hidden">Stand</span>
              </TabsTrigger>
              <TabsTrigger 
                value="conference"
                className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-az-red data-[state=active]:text-white"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Conference</span>
                <span className="sm:hidden">CL</span>
              </TabsTrigger>
              <TabsTrigger 
                value="spelers"
                className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-az-red data-[state=active]:text-white"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Spelers</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="programma" className="mt-0">
              <div className="space-y-6">
                <NextMatchWidget />
                <AZFixtures teamId={azTeamId} isLoadingTeamId={false} />
              </div>
            </TabsContent>

            <TabsContent value="eredivisie" className="mt-0">
              <EredivisieStandings />
            </TabsContent>

            <TabsContent value="conference" className="mt-0">
              <div className="space-y-6">
                <ConferenceLeagueStandings />
                <ConferenceLeagueFixtures teamId={azTeamId} isLoadingTeamId={false} />
              </div>
            </TabsContent>

            <TabsContent value="spelers" className="mt-0">
              <AZPlayerStats teamId={azTeamId} isLoadingTeamId={false} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AZData;