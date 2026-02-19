import { useLocation } from "react-router-dom";
import { useSeason } from "@/contexts/SeasonContext";
import { getSeasonOptions } from "@/utils/seasonUtils";
import { Calendar, Menu } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/wedstrijden": "Wedstrijden",
  "/voorbeschouwing": "Voorbeschouwing",
  "/nabeschouwing": "Nabeschouwing",
  "/competitie": "Competitie",
  "/spelers": "Spelers",
};

interface TopBarProps {
  onMenuToggle: () => void;
  isMobile: boolean;
}

export const TopBar = ({ onMenuToggle, isMobile }: TopBarProps) => {
  const location = useLocation();
  const currentRoute = routeNames[location.pathname] || "AZ Fanpage Data";
  const { season, setSeason, isCurrentSeason } = useSeason();
  const seasonOptions = getSeasonOptions();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 md:px-6 shrink-0">
      {isMobile && (
        <button
          onClick={onMenuToggle}
          className="mr-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Menu openen"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      <h1 className="font-headline text-app-heading tracking-tight text-foreground truncate">
        {currentRoute}
      </h1>
      <div className="ml-auto flex items-center gap-3">
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="w-[140px] md:w-[160px] h-8 text-app-small bg-background border-border">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seasonOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-app-small">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-app-small text-muted-foreground hidden md:inline">Redactie</span>
      </div>
    </header>
  );
};
