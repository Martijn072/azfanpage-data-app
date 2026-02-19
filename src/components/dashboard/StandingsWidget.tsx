import { Standing } from "@/types/footballApi";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface StandingsWidgetProps {
  standings: Standing[] | undefined;
  isLoading: boolean;
  compact?: boolean;
  hideLink?: boolean;
}

const AZ_TEAM_ID = 201;

const FormBadges = ({ form }: { form: string }) => {
  const chars = form.slice(-5).split("");
  const styles: Record<string, string> = {
    W: "bg-success/20 text-success",
    D: "bg-warning/20 text-warning",
    L: "bg-danger/20 text-danger",
  };
  const labels: Record<string, string> = { W: "W", D: "G", L: "V" };
  return (
    <div className="flex gap-0.5">
      {chars.map((c, i) => (
        <span key={i} className={cn("w-[18px] h-[18px] rounded text-[9px] flex items-center justify-center font-bold", styles[c] || "bg-muted text-muted-foreground")}>
          {labels[c] || c}
        </span>
      ))}
    </div>
  );
};

export const StandingsWidget = ({ standings, isLoading, compact = false, hideLink = false }: StandingsWidgetProps) => {
  const navigate = useNavigate();
  const showLink = compact && !hideLink;

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        {Array.from({ length: compact ? 5 : 18 }).map((_, i) => (
          <div key={i} className="h-7 bg-muted rounded w-full mb-1" />
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

  const displayStandings = compact
    ? (() => {
        const azRank = standings.find((s) => s.team.id === AZ_TEAM_ID)?.rank || 0;
        return azRank <= 5
          ? standings.slice(0, 5)
          : [...standings.slice(0, 4), standings.find((s) => s.team.id === AZ_TEAM_ID)!].filter(Boolean);
      })()
    : standings;

  const getZone = (rank: number): string | null => {
    if (rank === 1) return "bg-success/10";
    if (rank <= 3) return "bg-info/5";
    if (rank >= 16) return "bg-danger/5";
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-app-tiny uppercase tracking-wider text-muted-foreground font-medium">
          Eredivisie Stand
        </h3>
        {showLink && (
          <button
            onClick={() => navigate("/competitie")}
            className="text-app-tiny text-primary hover:underline"
          >
            Volledig →
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="text-left pb-2 w-6">#</th>
              <th className="text-left pb-2">Team</th>
              <th className="text-center pb-2 w-7">W</th>
              {!compact && (
                <>
                  <th className="text-center pb-2 w-7">W</th>
                  <th className="text-center pb-2 w-7">G</th>
                  <th className="text-center pb-2 w-7">V</th>
                </>
              )}
              <th className="text-center pb-2 w-10">+/-</th>
              <th className="text-center pb-2 w-8 font-semibold">Ptn</th>
              {!compact && <th className="text-center pb-2 w-24">Vorm</th>}
            </tr>
          </thead>
          <tbody>
            {displayStandings.map((team) => {
              const isAZ = team.team.id === AZ_TEAM_ID;
              const zone = getZone(team.rank);
              return (
                <tr
                  key={team.team.id}
                  className={cn(
                    "text-app-small border-b border-border/30 transition-colors hover:bg-accent/20",
                    isAZ && "bg-primary/8",
                    !isAZ && zone
                  )}
                >
                  <td className="py-1.5 pl-1 font-mono text-[11px] text-muted-foreground">{team.rank}</td>
                  <td className="py-1.5">
                    <div className="flex items-center gap-1.5">
                      <img src={team.team.logo} alt="" className="h-4 w-4 object-contain" />
                      <span className={cn("truncate text-[12px]", isAZ ? "text-primary font-semibold" : "text-foreground")}>
                        {team.team.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-1.5 text-center font-mono text-[11px] text-muted-foreground">{team.all.played}</td>
                  {!compact && (
                    <>
                      <td className="py-1.5 text-center font-mono text-[11px] text-success">{team.all.win}</td>
                      <td className="py-1.5 text-center font-mono text-[11px] text-warning">{team.all.draw}</td>
                      <td className="py-1.5 text-center font-mono text-[11px] text-danger">{team.all.lose}</td>
                    </>
                  )}
                  <td className={cn(
                    "py-1.5 text-center font-mono text-[11px] font-bold",
                    team.goalsDiff > 0 ? "text-success" : team.goalsDiff < 0 ? "text-danger" : "text-muted-foreground"
                  )}>
                    {team.goalsDiff > 0 ? "+" : ""}{team.goalsDiff}
                  </td>
                  <td className="py-1.5 text-center font-mono text-[11px] font-bold text-foreground">{team.points}</td>
                  {!compact && team.form && (
                    <td className="py-1.5 flex justify-center">
                      <FormBadges form={team.form} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {compact && (standings.find(s => s.team.id === AZ_TEAM_ID)?.rank || 0) > 5 && (
        <div className="mt-2 text-app-tiny text-muted-foreground text-center">
          ··· AZ staat op positie {standings.find(s => s.team.id === AZ_TEAM_ID)?.rank}
        </div>
      )}
    </div>
  );
};
