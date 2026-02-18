import { useLocation } from "react-router-dom";
import { useSeason } from "@/contexts/SeasonContext";
import { getSeasonOptions } from "@/utils/seasonUtils";
import { Calendar } from "lucide-react";
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

export const TopBar = () => {
  const location = useLocation();
  const currentRoute = routeNames[location.pathname] || "AZ Fanpage Data";
  const { season, setSeason, isCurrentSeason } = useSeason();
  const seasonOptions = getSeasonOptions();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-6 shrink-0">
      <h1 className="font-headline text-app-heading tracking-tight text-foreground">
        {currentRoute}
      </h1>
      <div className="ml-auto flex items-center gap-3">
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="w-[160px] h-8 text-app-small bg-background border-border">
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
        <span className="text-app-small text-muted-foreground">Redactie</span>
      </div>
    </header>
  );
};
