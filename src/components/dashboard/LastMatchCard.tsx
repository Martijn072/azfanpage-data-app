import { Fixture } from "@/types/footballApi";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LastMatchCardProps {
  fixture: Fixture | undefined;
  isLoading: boolean;
}

export const LastMatchCard = ({ fixture, isLoading }: LastMatchCardProps) => {
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
        <p className="text-app-small text-muted-foreground">Geen recente wedstrijd gevonden</p>
      </div>
    );
  }

  const isAZHome = fixture.teams.home.id === 201;
  const azGoals = isAZHome ? fixture.goals.home : fixture.goals.away;
  const oppGoals = isAZHome ? fixture.goals.away : fixture.goals.home;
  
  let result: "W" | "G" | "V" = "G";
  if (azGoals !== null && oppGoals !== null) {
    if (azGoals > oppGoals) result = "W";
    else if (azGoals < oppGoals) result = "V";
  }

  const resultColors = {
    W: "bg-success/15 text-success",
    G: "bg-warning/15 text-warning",
    V: "bg-danger/15 text-danger",
  };

  const resultLabels = { W: "Winst", G: "Gelijk", V: "Verlies" };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium">
          Laatste wedstrijd
        </span>
        <span className={cn("text-app-tiny px-2 py-0.5 rounded-full font-medium", resultColors[result])}>
          {resultLabels[result]}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="h-10 w-10 object-contain" />
          <span className="text-app-body-strong text-foreground truncate">{fixture.teams.home.name}</span>
        </div>

        <div className="text-center shrink-0">
          <div className="text-app-data-lg font-mono text-foreground">
            {fixture.goals.home} — {fixture.goals.away}
          </div>
          <div className="text-app-tiny text-muted-foreground">
            {format(new Date(fixture.fixture.date), "d MMM yyyy", { locale: nl })}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
          <span className="text-app-body-strong text-foreground truncate text-right">{fixture.teams.away.name}</span>
          <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="h-10 w-10 object-contain" />
        </div>
      </div>

      <div className="mt-3 text-app-tiny text-muted-foreground">
        {fixture.league.name} · {fixture.league.round}
      </div>
    </div>
  );
};
