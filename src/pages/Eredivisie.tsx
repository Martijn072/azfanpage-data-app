
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
      
      <div className="px-4 pb-20 pt-6">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="max-w-4xl">
            <h1 className="headline-premium text-headline-xl mb-4 text-az-black dark:text-white leading-tight">
              Eredivisie Stand
            </h1>
            <p className="body-premium text-body-lg text-premium-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Bekijk de huidige stand van de Eredivisie seizoen 2024-2025. AZ's positie wordt speciaal gemarkeerd.
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
