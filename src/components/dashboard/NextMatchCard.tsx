import { Fixture } from "@/types/footballApi";
import { format, formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Trophy, MapPin } from "lucide-react";

interface NextMatchCardProps {
  fixture: Fixture | null | undefined;
  isLoading: boolean;
}

export const NextMatchCard = ({ fixture, isLoading }: NextMatchCardProps) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-8 bg-muted rounded w-2/3 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-app-small text-muted-foreground">Geen komende wedstrijd gevonden</p>
      </div>
    );
  }

  const matchDate = new Date(fixture.fixture.date);
  const timeUntil = formatDistanceToNow(matchDate, { addSuffix: true, locale: nl });

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium">
          Eerstvolgende wedstrijd
        </span>
        <span className="text-app-tiny bg-info/15 text-info px-2 py-0.5 rounded-full font-medium">
          {timeUntil}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="h-10 w-10 object-contain" />
          <span className="text-app-body-strong text-foreground truncate">{fixture.teams.home.name}</span>
        </div>

        <div className="text-center shrink-0">
          <div className="text-app-data-lg font-mono text-foreground">
            {format(matchDate, "HH:mm")}
          </div>
          <div className="text-app-tiny text-muted-foreground">
            {format(matchDate, "d MMM", { locale: nl })}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
          <span className="text-app-body-strong text-foreground truncate text-right">{fixture.teams.away.name}</span>
          <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="h-10 w-10 object-contain" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-app-tiny text-muted-foreground">
        <span className="flex items-center gap-1">
          <Trophy className="h-3 w-3" />
          {fixture.league.name}
        </span>
        {fixture.fixture.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {fixture.fixture.venue.name}
          </span>
        )}
      </div>
    </div>
  );
};
