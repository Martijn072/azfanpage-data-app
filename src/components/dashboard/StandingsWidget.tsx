import { Standing } from "@/types/footballApi";
import { cn } from "@/lib/utils";

interface StandingsWidgetProps {
  standings: Standing[] | undefined;
  isLoading: boolean;
}

export const StandingsWidget = ({ standings, isLoading }: StandingsWidgetProps) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded w-full mb-2" />
        ))}
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-app-small text-muted-foreground">Geen stand beschikbaar</p>
      </div>
    );
  }

  // Show top 5, but always include AZ
  const azRank = standings.find((s) => s.team.id === 201)?.rank || 0;
  const showStandings = azRank <= 5
    ? standings.slice(0, 5)
    : [...standings.slice(0, 4), standings.find((s) => s.team.id === 201)!].filter(Boolean);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium mb-3">
        Eredivisie Stand
      </h3>

      <table className="w-full">
        <thead>
          <tr className="text-app-tiny text-muted-foreground">
            <th className="text-left pb-2 w-8">#</th>
            <th className="text-left pb-2">Team</th>
            <th className="text-right pb-2 w-8">W</th>
            <th className="text-right pb-2 w-12">+/-</th>
            <th className="text-right pb-2 w-10 font-semibold">Ptn</th>
          </tr>
        </thead>
        <tbody>
          {showStandings.map((team) => {
            const isAZ = team.team.id === 201;
            return (
              <tr
                key={team.team.id}
                className={cn(
                  "text-app-body transition-colors",
                  isAZ && "bg-primary/8 border-l-[3px] border-l-primary"
                )}
              >
                <td className="py-1.5 pl-1 font-mono text-app-data text-muted-foreground">{team.rank}</td>
                <td className="py-1.5">
                  <div className="flex items-center gap-2">
                    <img src={team.team.logo} alt={team.team.name} className="h-4 w-4 object-contain" />
                    <span className={cn("truncate", isAZ && "text-foreground font-semibold")}>
                      {team.team.name}
                    </span>
                  </div>
                </td>
                <td className="py-1.5 text-right font-mono text-app-data text-muted-foreground">{team.all.played}</td>
                <td className={cn(
                  "py-1.5 text-right font-mono text-app-data",
                  team.goalsDiff > 0 ? "text-success" : team.goalsDiff < 0 ? "text-danger" : "text-muted-foreground"
                )}>
                  {team.goalsDiff > 0 ? "+" : ""}{team.goalsDiff}
                </td>
                <td className="py-1.5 text-right font-mono text-app-data font-bold text-foreground">{team.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {azRank > 5 && (
        <div className="mt-2 text-app-tiny text-muted-foreground text-center">
          ··· AZ staat op positie {azRank}
        </div>
      )}
    </div>
  );
};
