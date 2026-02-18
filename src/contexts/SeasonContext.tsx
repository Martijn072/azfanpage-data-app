import { createContext, useContext, useState, ReactNode } from "react";
import { getCurrentActiveSeason, getSeasonOptions } from "@/utils/seasonUtils";

interface SeasonContextType {
  season: string;
  setSeason: (season: string) => void;
  displaySeason: string;
  isCurrentSeason: boolean;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const defaultSeason = getCurrentActiveSeason();
  const [season, setSeason] = useState(defaultSeason.currentSeason);

  const options = getSeasonOptions();
  const match = options.find(o => o.value === season);
  const displaySeason = match?.label || `${season}-${(parseInt(season) + 1).toString().slice(-2)}`;
  const isCurrentSeason = season === defaultSeason.currentSeason;

  return (
    <SeasonContext.Provider value={{ season, setSeason, displaySeason, isCurrentSeason }}>
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error("useSeason must be used within SeasonProvider");
  return ctx;
};
