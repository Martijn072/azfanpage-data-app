
import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EredivisieStandings } from "@/components/EredivisieStandings";
import { ErrorMessage } from "@/components/ErrorMessage";

const Eredivisie = () => {
  const [activeTab, setActiveTab] = useState("eredivisie");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="px-4 pb-20 pt-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="max-w-4xl">
            <h1 className="headline-premium text-headline-xl mb-2 text-az-black dark:text-white leading-tight">
              Eredivisie Stand
            </h1>
            <p className="text-premium-gray-500 dark:text-gray-400 text-sm font-light">
              2024-2025
            </p>
          </div>
        </div>

        {/* Eredivisie Standings */}
        <div>
          <EredivisieStandings />
        </div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Eredivisie;
